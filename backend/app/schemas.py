import unicodedata
from typing import Literal

from pydantic import BaseModel, Field, field_validator

Level = Literal["kid", "beginner", "student", "pro"]
Language = Literal["English", "Hindi", "Marathi", "Spanish", "French", "German"]
Length = Literal["quick", "standard", "deep"]
Technique = Literal["ROLE", "TASK", "DYNAMIC SLOT", "OUTPUT FORMAT", "FEW-SHOT", "GUARDRAIL"]

TOPIC_MIN_CHARS = 2
TOPIC_MAX_CHARS = 100
ROLE_MIN_CHARS = 2
ROLE_MAX_CHARS = 60
# Hard ceiling on the raw payload, before whitespace is collapsed, so a huge body is
# refused without being processed.
RAW_TEXT_MAX_CHARS = 500


def clean_free_text(value: str, min_chars: int, max_chars: int) -> str:
    # Free text is placed inside <topic>/<role> tags in the prompt; a bracket would let a
    # user close the tag and smuggle in instructions. NFKC first, so look-alikes such as
    # the fullwidth "＜" become "<" and are caught too.
    cleaned = " ".join(unicodedata.normalize("NFKC", value).split())
    if "<" in cleaned or ">" in cleaned:
        raise ValueError("must not contain < or >")
    if not min_chars <= len(cleaned) <= max_chars:
        raise ValueError(f"must be between {min_chars} and {max_chars} characters")
    return cleaned


class RoleRequest(BaseModel):
    topic: str = Field(max_length=RAW_TEXT_MAX_CHARS)

    @field_validator("topic")
    @classmethod
    def _clean_topic(cls, value: str) -> str:
        return clean_free_text(value, TOPIC_MIN_CHARS, TOPIC_MAX_CHARS)


class ExplainRequest(RoleRequest):
    expert_role: str = Field(max_length=RAW_TEXT_MAX_CHARS)
    level: Level
    language: Language
    length: Length

    @field_validator("expert_role")
    @classmethod
    def _clean_role(cls, value: str) -> str:
        return clean_free_text(value, ROLE_MIN_CHARS, ROLE_MAX_CHARS)


class ExpertPick(BaseModel):
    """What Gemini returns for prompt 1 — also the response schema sent to Gemini."""

    is_valid_topic: bool
    field: str
    expert_role: str
    interpreted_as: str
    emoji: str


class KeyTerm(BaseModel):
    term: str
    meaning: str


class Explanation(BaseModel):
    """What Gemini returns for prompt 2 — also the response schema sent to Gemini."""

    definition: str
    analogy: str
    field_example: str
    code_or_formula: str | None = None
    key_terms: list[KeyTerm]
    summary: str


class PromptSegment(BaseModel):
    technique: Technique
    text: str


class RoleResponse(BaseModel):
    expert: ExpertPick
    prompt: list[PromptSegment]


class ExplainResponse(BaseModel):
    explanation: Explanation
    prompt: list[PromptSegment]
