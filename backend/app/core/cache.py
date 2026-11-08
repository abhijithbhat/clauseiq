"""SQLite-backed SHA-256 prompt response cache for ClauseIQ LLM calls.

Avoids duplicate API quota consumption during development, debugging, and evaluation runs.
"""

import hashlib
import os
from pathlib import Path
import sqlite3
from typing import Optional

DEFAULT_CACHE_DIR = Path(".llm_cache")
DEFAULT_CACHE_FILE = DEFAULT_CACHE_DIR / "cache.db"


def compute_cache_key(model: str, prompt: str, schema_name: str = "") -> str:
    """Generate a deterministic SHA-256 cache key from model, schema, and prompt."""
    payload = f"{model}::{schema_name}::{prompt}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _get_connection(db_path: Optional[Path] = None) -> sqlite3.Connection:
    """Initialize SQLite cache database and ensure table schema exists."""
    target_path = Path(db_path) if db_path else DEFAULT_CACHE_FILE
    target_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(target_path))
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS prompt_cache (
            cache_key TEXT PRIMARY KEY,
            response TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    return conn


def get_cached_response(key: str, db_path: Optional[Path] = None) -> Optional[str]:
    """Retrieve a cached response string by SHA-256 key, or None if not found."""
    try:
        conn = _get_connection(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT response FROM prompt_cache WHERE cache_key = ?", (key,))
        row = cursor.fetchone()
        conn.close()
        return row[0] if row else None
    except Exception:
        return None


def set_cached_response(key: str, response: str, db_path: Optional[Path] = None) -> None:
    """Persist a response string into SQLite prompt cache keyed by SHA-256 key."""
    try:
        conn = _get_connection(db_path)
        conn.execute(
            "INSERT OR REPLACE INTO prompt_cache (cache_key, response) VALUES (?, ?)",
            (key, response),
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


def clear_cache(db_path: Optional[Path] = None) -> None:
    """Empty the cache database (useful for testing and benchmarking)."""
    try:
        conn = _get_connection(db_path)
        conn.execute("DELETE FROM prompt_cache")
        conn.commit()
        conn.close()
    except Exception:
        pass

