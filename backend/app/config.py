import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
FRONTEND_DIST = BACKEND_DIR.parent / "frontend" / "dist"

load_dotenv(BACKEND_DIR / ".env")

MODEL_NAME = "gemini-flash-lite-latest"
REQUEST_TIMEOUT_MS = 30_000
# Low enough that the role finder is consistent between runs, high enough that the
# analogies do not all read the same.
TEMPERATURE = 0.4


def gemini_api_key() -> str | None:
    return os.environ.get("GEMINI_API_KEY") or None
