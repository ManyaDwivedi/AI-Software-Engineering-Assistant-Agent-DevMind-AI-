import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from dotenv import load_dotenv

load_dotenv()

DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "data" / "assistant.db"
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", str(DEFAULT_DB_PATH))).resolve()


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH, timeout=15)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database() -> None:
    with connect() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                stack TEXT NOT NULL DEFAULT '[]',
                files INTEGER NOT NULL DEFAULT 0,
                health INTEGER NOT NULL DEFAULT 100,
                status TEXT NOT NULL DEFAULT 'indexed',
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS project_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                path TEXT NOT NULL,
                content TEXT NOT NULL,
                UNIQUE(project_id, path)
            );
            CREATE TABLE IF NOT EXISTS history (
                id TEXT PRIMARY KEY,
                owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
                type TEXT NOT NULL,
                status TEXT NOT NULL,
                preview TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
            CREATE INDEX IF NOT EXISTS idx_history_owner ON history(owner_id, created_at);
            CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
            """
        )
