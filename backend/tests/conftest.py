from collections.abc import Iterator
from typing import TypeVar

import pytest
from fastapi.testclient import TestClient
from pydantic import BaseModel

from app.gemini import get_generator
from app.main import app

ModelT = TypeVar("ModelT", bound=BaseModel)


class FakeGenerator:
    """Stands in for Gemini: returns queued replies and records every prompt it was sent."""

    def __init__(self) -> None:
        self.replies: list[BaseModel | Exception] = []
        self.prompts: list[str] = []

    async def generate(self, prompt: str, schema: type[ModelT]) -> ModelT:
        self.prompts.append(prompt)
        reply = self.replies.pop(0)
        if isinstance(reply, Exception):
            raise reply
        assert isinstance(reply, schema)
        return reply


@pytest.fixture
def fake_generator() -> FakeGenerator:
    return FakeGenerator()


@pytest.fixture
def client(fake_generator: FakeGenerator) -> Iterator[TestClient]:
    app.dependency_overrides[get_generator] = lambda: fake_generator
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
