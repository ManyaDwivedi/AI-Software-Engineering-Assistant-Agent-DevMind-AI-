# AI Software Engineering Assistant

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL and create an account. Sign-in uses accounts stored by the backend.

## Run the backend

The FastAPI service provides SQLite-backed accounts and projects, bearer-token authentication, ZIP/multiple-file indexing, searchable project chat, file dependency graphs, code metrics, history, and all AI tool endpoints. It runs independently on port 8000:

```powershell
py -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
# Edit backend\.env and set JWT_SECRET to a long random value before using real accounts.
uvicorn app.main:app --app-dir backend --reload --port 8000
```

The interactive API reference is available at `http://localhost:8000/docs`. AI tools run with local deterministic analysis by default. To enable model-backed results, set `LLM_API_KEY`, `LLM_MODEL`, and optionally an OpenAI-compatible `LLM_BASE_URL` in `backend\.env`. Credentials stay on the backend and are never sent to the browser.

Run API tests after installing backend requirements:

```powershell
Set-Location backend
python -m unittest discover -s tests -v
```

## Build for production

```bash
npm run build
npm run preview
```

## What's implemented

**Auth**: Login, Register, Forgot Password request, protected routes, FastAPI bearer tokens, password hashing, and SQLite persistence.

**Shell**: Collapsible glass sidebar with all sections from the spec, active-state indicator, tooltips when collapsed.

**Dashboard**: Live React Three Fiber AI Core, API health/AI-provider state, project and activity panels, 6 quick actions.

**Code Workspace**: Monaco editor, language selector, Analyze button wired to the Thinking Pipeline (6-stage animated) and AI Core state.

**AI Tools**: Explain, Debug, Review, Generate, Tests, Refactor, Documentation; API-backed with local analysis fallback or an optional OpenAI-compatible provider.

**Project Intelligence**: Project AI/Chat search uploaded files with source citations, Project Galaxy builds a 3D graph from detected imports, Code DNA calculates metrics from indexed source files.

**Chat, History, Settings, Profile, Help** — project activity, profile counts, and history are loaded from the backend; appearance settings remain browser-local.

## Where to plug in the real backend

Network calls go through `src/lib/api.js`. Set `VITE_API_BASE_URL` in a root `.env` file when the backend is hosted somewhere other than `http://localhost:8000`.

## Notes / scope

- 3D: React Three Fiber (`AICore.jsx`, `ProjectGalaxy3D.jsx`). Respects `prefers-reduced-motion` at the CSS level; consider gating Canvas mounts behind that media query too if you need it enforced for 3D specifically.
- Without `LLM_API_KEY`, AI endpoints return clearly scoped local heuristics/templates; they do not claim to run or test submitted code. Password-reset email delivery is not configured until an email provider is set up.
- Project indexing currently stores supported text files in SQLite and uses keyword retrieval rather than vector embeddings. Binary files and oversized files are skipped.
- Drag-and-drop parallax scroll effects (section #26 in the spec) are not implemented; the app doesn't have long scrolling pages that would need them.
- Tailwind v4 (via `@tailwindcss/vite`), React Router v7, `@monaco-editor/react`, `@react-three/fiber` + `drei`, `lucide-react`.
