import io
import json
import os
import re
import secrets
import sqlite3
import zipfile
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import PurePosixPath

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .database import connect, initialize_database
from .schemas import (
    ChatRequest,
    CodeRequest,
    DebugRequest,
    DocsRequest,
    GenerateRequest,
    LoginRequest,
    RegisterRequest,
    TestsRequest,
)
from .security import create_token, decode_token, hash_password, verify_password
from .services import (
    AIProviderError,
    analyze_code,
    debug_code,
    generate_code,
    generate_tests,
    request_ai,
    review_code,
    search_project_files,
    text_file,
)

load_dotenv()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    initialize_database()
    yield


MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "20")) * 1024 * 1024
MAX_ARCHIVE_FILES = 300
MAX_UNPACKED_BYTES = 50 * 1024 * 1024

app = FastAPI(
    title="AI Software Engineering Assistant API",
    version="1.0.0",
    description="Backend API for the AI Software Engineering Assistant frontend.",
    lifespan=lifespan,
)
origins = [
    item.strip()
    for item in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if item.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)
bearer = HTTPBearer(auto_error=False)


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authentication required.")
    try:
        user_id = decode_token(credentials.credentials)
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Invalid or expired access token.") from None
    with connect() as db:
        user = db.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    if user is None:
        raise HTTPException(status_code=401, detail="Account no longer exists.")
    return dict(user)


def create_history(
    owner_id: int,
    operation: str,
    preview: str,
    project_id: str | None = None,
) -> None:
    with connect() as db:
        db.execute(
            """INSERT INTO history (id, owner_id, project_id, type, status, preview)
               VALUES (?, ?, ?, ?, 'Completed', ?)""",
            (secrets.token_hex(8), owner_id, project_id, operation, preview[:500]),
        )


async def run_ai(operation: str, payload: dict, fallback):
    try:
        result = await request_ai(operation, payload)
    except AIProviderError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    return result if result is not None else fallback()


def owned_project(db, project_id: str, owner_id: int):
    project = db.execute(
        "SELECT id, name FROM projects WHERE id = ? AND owner_id = ?",
        (project_id, owner_id),
    ).fetchone()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


def format_history_date(value: str) -> str:
    try:
        created = datetime.fromisoformat(value.replace(" ", "T")).replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if created.date() == now.date():
            return "Today, " + created.strftime("%I:%M %p").lstrip("0")
        if (now.date() - created.date()).days == 1:
            return "Yesterday, " + created.strftime("%I:%M %p").lstrip("0")
        return created.strftime("%b %d, %Y").replace(" 0", " ")
    except (ValueError, TypeError):
        return value


@app.get("/health")
@app.get("/api/health", include_in_schema=False)
def health() -> dict:
    return {
        "status": "ok",
        "service": "ai-swe-assistant",
        "aiProviderConfigured": bool(os.getenv("LLM_API_KEY")),
    }


@app.post("/auth/register", status_code=201)
@app.post("/api/auth/register", status_code=201, include_in_schema=False)
def register(payload: RegisterRequest) -> dict:
    try:
        with connect() as db:
            cursor = db.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (payload.name, payload.email, hash_password(payload.password)),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError as error:
        if "UNIQUE constraint failed" in str(error):
            raise HTTPException(status_code=409, detail="An account with this email already exists.") from None
        raise
    user = {"id": user_id, "name": payload.name, "email": payload.email, "avatar": None}
    return {"token": create_token(user_id), "user": user}


@app.post("/auth/login")
@app.post("/api/auth/login", include_in_schema=False)
def login(payload: LoginRequest) -> dict:
    with connect() as db:
        row = db.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = ? COLLATE NOCASE",
            (payload.email,),
        ).fetchone()
    if row is None or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    user = {"id": row["id"], "name": row["name"], "email": row["email"], "avatar": None}
    return {"token": create_token(row["id"]), "user": user}


@app.get("/auth/me")
@app.get("/api/auth/me", include_in_schema=False)
def get_current_user(user: dict = Depends(current_user)) -> dict:
    return {"user": {**user, "avatar": None}}


@app.post("/auth/forgot-password")
@app.post("/api/auth/forgot-password", include_in_schema=False)
def forgot_password(payload: dict) -> dict:
    email = payload.get("email")
    if not isinstance(email, str) or not email.strip():
        raise HTTPException(status_code=422, detail="A valid email is required.")
    return {
        "message": "Password reset email delivery is not configured.",
        "emailDeliveryConfigured": False,
    }


@app.get("/projects")
@app.get("/api/projects", include_in_schema=False)
def list_projects(user: dict = Depends(current_user)) -> list[dict]:
    with connect() as db:
        rows = db.execute(
            """SELECT id, name, stack, files, health, status, updated_at
               FROM projects WHERE owner_id = ? ORDER BY updated_at DESC""",
            (user["id"],),
        ).fetchall()
    result = []
    for row in rows:
        result.append(
            {
                "id": row["id"],
                "name": row["name"],
                "stack": json.loads(row["stack"]),
                "files": row["files"],
                "health": row["health"],
                "status": row["status"],
                "lastAnalyzed": format_history_date(row["updated_at"]),
            }
        )
    return result


@app.post("/projects/upload", status_code=201)
@app.post("/api/projects/upload", status_code=201, include_in_schema=False)
async def upload_project(
    name: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    files: list[UploadFile] | None = File(default=None),
    user: dict = Depends(current_user),
) -> dict:
    project_name = (name or "").strip()
    uploaded_files: list[tuple[str, str]] = []
    incoming_files = [item for item in [file, *(files or [])] if item is not None and item.filename]
    total_upload_size = 0
    total_unpacked_size = 0
    seen_paths: set[str] = set()
    if len(incoming_files) > MAX_ARCHIVE_FILES:
        raise HTTPException(status_code=413, detail="Upload contains too many files.")
    for upload in incoming_files:
        original_name = upload.filename.replace("\\", "/")
        safe_name = PurePosixPath(original_name).name
        if not project_name:
            project_name = PurePosixPath(safe_name).stem[:120] or "Imported Project"
        raw = await upload.read(MAX_UPLOAD_BYTES + 1)
        total_upload_size += len(raw)
        if total_upload_size > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Upload exceeds the configured size limit.")
        if safe_name.lower().endswith(".zip"):
            try:
                with zipfile.ZipFile(io.BytesIO(raw)) as archive:
                    entries = [entry for entry in archive.infolist() if not entry.is_dir()]
                    if len(entries) + len(uploaded_files) > MAX_ARCHIVE_FILES:
                        raise HTTPException(status_code=413, detail="Archive contains too many files.")
                    for entry in entries:
                        path = PurePosixPath(entry.filename.replace("\\", "/"))
                        if path.is_absolute() or ".." in path.parts or entry.file_size > MAX_UNPACKED_BYTES:
                            continue
                        total_unpacked_size += entry.file_size
                        if total_unpacked_size > MAX_UNPACKED_BYTES:
                            raise HTTPException(status_code=413, detail="Expanded archive exceeds the configured size limit.")
                        normalized_path = path.as_posix()
                        if normalized_path in seen_paths:
                            continue
                        content = text_file(normalized_path, archive.read(entry))
                        if content is not None:
                            seen_paths.add(normalized_path)
                            uploaded_files.append((normalized_path, content))
            except zipfile.BadZipFile:
                raise HTTPException(status_code=400, detail=f"{safe_name} is not a valid ZIP file.") from None
        else:
            content = text_file(safe_name, raw)
            if content is not None and safe_name not in seen_paths:
                seen_paths.add(safe_name)
                uploaded_files.append((safe_name, content))
        if len(uploaded_files) > MAX_ARCHIVE_FILES:
            raise HTTPException(status_code=413, detail="Upload contains too many supported files.")
    if not incoming_files:
        project_name = project_name or "Imported Project"

    project_id = "proj_" + secrets.token_hex(8)
    stack = detect_stack(path for path, _ in uploaded_files)
    with connect() as db:
        db.execute(
            """INSERT INTO projects (id, owner_id, name, stack, files, status)
               VALUES (?, ?, ?, ?, ?, 'indexed')""",
            (project_id, user["id"], project_name, json.dumps(stack), len(uploaded_files)),
        )
        db.executemany(
            "INSERT INTO project_files (project_id, path, content) VALUES (?, ?, ?)",
            [(project_id, path, content[:250_000]) for path, content in uploaded_files],
        )
    create_history(user["id"], "Import", f"Imported and indexed {project_name}.", project_id)
    return {
        "id": project_id,
        "name": project_name,
        "status": "indexed",
        "files": len(uploaded_files),
        "stack": stack,
        "stages": [
            "Scanning archive",
            "Filtering supported text files",
            "Storing searchable source files",
            "Project import complete",
        ],
        "searchMode": "keyword",
    }


def detect_stack(paths) -> list[str]:
    extensions = {PurePosixPath(path).suffix.lower() for path in paths}
    stack = []
    if extensions & {".py"}:
        stack.append("Python")
    if extensions & {".js", ".jsx", ".ts", ".tsx"}:
        stack.append("JavaScript/TypeScript")
    if ".go" in extensions:
        stack.append("Go")
    if ".java" in extensions:
        stack.append("Java")
    return stack


@app.get("/projects/graph")
@app.get("/api/projects/graph", include_in_schema=False)
def project_graph(
    project_id: str | None = Query(default=None),
    user: dict = Depends(current_user),
) -> dict:
    with connect() as db:
        if project_id:
            owned_project(db, project_id, user["id"])
        else:
            row = db.execute(
                "SELECT id FROM projects WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 1",
                (user["id"],),
            ).fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Import a project to build its dependency graph.")
            project_id = row["id"]
        rows = db.execute(
            "SELECT path, content FROM project_files WHERE project_id = ? ORDER BY path LIMIT 120",
            (project_id,),
        ).fetchall()
    files = [dict(row) for row in rows]
    path_by_stem = {PurePosixPath(item["path"]).stem.lower(): item["path"] for item in files}
    edges: set[tuple[str, str]] = set()
    nodes = []
    for item in files:
        path = item["path"]
        content = item["content"]
        imports = re.findall(
            r"""(?:from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|^\s*from\s+([\w.]+)\s+import)""",
            content,
            re.MULTILINE,
        )
        for groups in imports:
            target = next((part for part in groups if part), "")
            stem = PurePosixPath(target.replace(".", "/").split("/")[-1]).stem.lower()
            dependency = path_by_stem.get(stem)
            if dependency and dependency != path:
                edges.add((path, dependency))
        functions = re.findall(r"\b(?:def|function|func)\s+[\w$]+\s*\(", content)
        folder = PurePosixPath(path).parent.as_posix().lower()
        group = next(
            (value for key, value in (("auth", "auth"), ("ui", "ui"), ("component", "ui"), ("model", "data"), ("data", "data"), ("util", "util")) if key in folder or key in path.lower()),
            "core",
        )
        nodes.append(
            {
                "id": path,
                "group": group,
                "functions": len(functions),
                "imports": len(imports),
                "dependents": 0,
            }
        )
    dependents = {}
    for source, target in edges:
        dependents[target] = dependents.get(target, 0) + 1
    for node in nodes:
        node["dependents"] = dependents.get(node["id"], 0)
    return {"nodes": nodes, "edges": [list(edge) for edge in sorted(edges)], "projectId": project_id}


@app.get("/projects/dna")
@app.get("/api/projects/dna", include_in_schema=False)
def project_dna(
    project_id: str | None = Query(default=None),
    user: dict = Depends(current_user),
) -> dict:
    with connect() as db:
        if project_id:
            owned_project(db, project_id, user["id"])
        else:
            row = db.execute(
                "SELECT id FROM projects WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 1",
                (user["id"],),
            ).fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Import a project to calculate its code metrics.")
            project_id = row["id"]
        rows = db.execute(
            "SELECT path, content FROM project_files WHERE project_id = ?",
            (project_id,),
        ).fetchall()
    files = [dict(row) for row in rows]
    contents = [item["content"] for item in files]
    source = "\n".join(contents)
    analysis = analyze_code(source, "source") if source else {"complexity": "Low", "issues": 0}
    dependency_count = sum(
        len(re.findall(r"\b(?:import|from)\b", content)) for content in contents
    )
    security_score = max(0, 100 - min(100, analysis["issues"] * 18))
    avg_lines = sum(len(content.splitlines()) for content in contents) / max(1, len(contents))
    metrics = [
        {"label": "Complexity", "value": {"Low": 25, "Moderate": 55, "High": 85}[analysis["complexity"]], "tone": "#b58a4a"},
        {"label": "Dependencies", "value": min(100, dependency_count * 3), "tone": "#80758c"},
        {"label": "Code Quality", "value": max(0, 100 - analysis["issues"] * 12), "tone": "#5b806f"},
        {"label": "Security", "value": security_score, "tone": "#4f7a68"},
        {"label": "Architecture", "value": min(100, 35 + len(files) * 2), "tone": "#66849a"},
        {"label": "Errors", "value": min(100, analysis["issues"] * 10 + int(avg_lines > 500) * 20), "tone": "#b45f58"},
    ]
    return {"projectId": project_id, "files": len(files), "metrics": metrics}


@app.post("/ai/analyze")
@app.post("/api/ai/analyze", include_in_schema=False)
async def analyze(payload: CodeRequest, user: dict = Depends(current_user)) -> dict:
    result = await run_ai(
        "analyze",
        payload.model_dump(),
        lambda: analyze_code(payload.code, payload.language),
    )
    create_history(user["id"], "Analyze", result["summary"])
    return result


@app.post("/ai/debug")
@app.post("/api/ai/debug", include_in_schema=False)
async def debug(payload: DebugRequest, user: dict = Depends(current_user)) -> dict:
    result = await run_ai(
        "debug",
        payload.model_dump(),
        lambda: debug_code(payload.code, payload.errorTrace),
    )
    create_history(user["id"], "Debug", result["problem"])
    return result


@app.post("/ai/review")
@app.post("/api/ai/review", include_in_schema=False)
async def review(payload: CodeRequest, user: dict = Depends(current_user)) -> dict:
    result = await run_ai(
        "review",
        payload.model_dump(),
        lambda: review_code(payload.code),
    )
    create_history(user["id"], "Review", f"Found {len(result['issues'])} potential issue(s).")
    return result


@app.post("/ai/generate")
@app.post("/api/ai/generate", include_in_schema=False)
async def generate(payload: GenerateRequest, user: dict = Depends(current_user)) -> dict:
    result = await run_ai(
        "generate",
        payload.model_dump(),
        lambda: generate_code(payload.prompt, payload.language, payload.framework),
    )
    create_history(user["id"], "Generate", payload.prompt)
    return result


@app.post("/ai/tests")
@app.post("/api/ai/tests", include_in_schema=False)
async def tests(payload: TestsRequest, user: dict = Depends(current_user)) -> dict:
    result = await run_ai(
        "tests",
        payload.model_dump(),
        lambda: generate_tests(payload.code, payload.kinds),
    )
    create_history(user["id"], "Tests", "Generated test templates.")
    return result


@app.post("/ai/explain")
@app.post("/api/ai/explain", include_in_schema=False)
async def explain(payload: CodeRequest, user: dict = Depends(current_user)) -> dict:
    functions = re.findall(
        r"(?:def|function|func)\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)", payload.code
    )
    findings = analyze_code(payload.code, payload.language)
    result = await run_ai(
        "explain",
        payload.model_dump(),
        lambda: {
            "overview": f"Provided {payload.language} code contains {len(payload.code.splitlines())} lines.",
            "howItWorks": "This local explanation summarizes structure and basic control-flow; it does not execute the code.",
            "functions": [
                {"name": f"{name}({arguments})", "detail": f"Declared in the supplied source ({payload.language})."}
                for name, arguments in functions[:30]
            ],
            "complexity": f"Estimated {findings['complexity'].lower()} control-flow complexity.",
            "issues": [item["message"] for item in findings["findings"]],
            "improvements": ["Add tests for important branches.", "Validate external input at system boundaries."],
        },
    )
    create_history(user["id"], "Explain", result["overview"])
    return result


@app.post("/ai/refactor")
@app.post("/api/ai/refactor", include_in_schema=False)
async def refactor(payload: CodeRequest, user: dict = Depends(current_user)) -> dict:
    result = await run_ai(
        "refactor",
        payload.model_dump(),
        lambda: {
            "before": payload.code,
            "after": payload.code,
            "improvements": ["No automatic rewrite was applied by the offline backend."],
            "explanation": "No language model is configured. The original source is returned unchanged for safety.",
        },
    )
    create_history(user["id"], "Refactor", "Refactor preview requested.")
    return result


@app.post("/ai/docs")
@app.post("/api/ai/docs", include_in_schema=False)
async def docs(payload: DocsRequest, user: dict = Depends(current_user)) -> dict:
    functions = re.findall(r"(?:def|function|func)\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)", payload.code)
    entries = "\n".join(f"- `{name}({args})`: Document this function's purpose and return value." for name, args in functions)
    content = "# Source Documentation\n\n" + (entries or "No function declarations were detected.") + "\n"
    result = await run_ai(
        "docs",
        payload.model_dump(),
        lambda: {
            "documentation": f"# {payload.type.title()} Documentation\n\nLanguage: {payload.language}\n\n{content}",
            "content": content,
        },
    )
    create_history(user["id"], "Docs", "Generated source documentation.")
    return result


@app.post("/ai/chat")
@app.post("/api/ai/chat", include_in_schema=False)
async def chat(payload: ChatRequest, user: dict = Depends(current_user)) -> dict:
    project_id = payload.projectId
    sources: list[str] = []
    if project_id:
        with connect() as db:
            owned_project(db, project_id, user["id"])
            rows = db.execute(
                "SELECT path, content FROM project_files WHERE project_id = ?",
                (project_id,),
            ).fetchall()
        context, sources = search_project_files([dict(row) for row in rows], payload.message)
        reply = (
            context
            if rows
            else "No source files are indexed for this project yet. Import a ZIP or select source files first."
        )
    else:
        reply = "Choose a project to search its indexed source files."
    if project_id and rows and os.getenv("LLM_API_KEY", "").strip():
        result = await run_ai(
            "chat",
            {"message": payload.message, "context": context, "allowedSources": sources},
            lambda: {"reply": reply, "sources": sources},
        )
        allowed_sources = set(sources)
        result["sources"] = [source for source in result["sources"] if source in allowed_sources]
        reply = result["reply"]
    create_history(user["id"], "Chat", payload.message, project_id)
    return {"reply": reply, "sources": sources}


@app.get("/history")
@app.get("/api/history", include_in_schema=False)
def history(user: dict = Depends(current_user)) -> list[dict]:
    with connect() as db:
        rows = db.execute(
            """SELECT h.id, h.type, h.status, h.preview, h.created_at, p.name AS project
               FROM history h LEFT JOIN projects p ON p.id = h.project_id
               WHERE h.owner_id = ? ORDER BY h.created_at DESC, h.rowid DESC LIMIT 200""",
            (user["id"],),
        ).fetchall()
    return [
        {
            "id": row["id"],
            "type": row["type"],
            "project": row["project"] or "Workspace",
            "date": format_history_date(row["created_at"]),
            "status": row["status"],
            "preview": row["preview"],
        }
        for row in rows
    ]
