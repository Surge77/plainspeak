from typing import Annotated

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app import service
from app.config import FRONTEND_DIST
from app.gemini import GeminiError, JsonGenerator, get_generator
from app.schemas import ExplainRequest, ExplainResponse, RoleRequest, RoleResponse

Generator = Annotated[JsonGenerator, Depends(get_generator)]


async def handle_gemini_error(_: Request, exc: Exception) -> JSONResponse:
    # Registered only for GeminiError; the guard narrows the type without relying on
    # `assert`, which `python -O` strips.
    if not isinstance(exc, GeminiError):
        raise exc
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.user_message})


def create_app() -> FastAPI:
    app = FastAPI(title="PlainSpeak", version="0.1.0")
    app.add_exception_handler(GeminiError, handle_gemini_error)

    @app.get("/api/health")
    async def health() -> dict[str, bool]:
        return {"ok": True}

    @app.post("/api/role", response_model=RoleResponse)
    async def find_expert(body: RoleRequest, generator: Generator) -> RoleResponse:
        return await service.find_expert(body.topic, generator)

    @app.post("/api/explain", response_model=ExplainResponse)
    async def explain(body: ExplainRequest, generator: Generator) -> ExplainResponse:
        return await service.explain(body, generator)

    # Demo mode: serve the built React app from the same origin as the API, so one
    # command runs everything and the browser never makes a cross-origin call. Mounted
    # last so the /api routes above take precedence.
    if FRONTEND_DIST.is_dir():
        app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

    return app


app = create_app()
