import sys
from pathlib import Path

# Vercel only builds Python functions from the root api/ directory, but the FastAPI
# package lives in backend/. Put backend/ on the path so `app` imports as it does locally.
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.main import app  # noqa: E402  # pyright: ignore[reportMissingImports]

__all__ = ["app"]
