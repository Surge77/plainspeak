from app.gemini import JsonGenerator
from app.prompts import build_explain_prompt, build_role_prompt, render
from app.schemas import (
    ROLE_MAX_CHARS,
    ExplainRequest,
    ExplainResponse,
    Explanation,
    ExpertPick,
    RoleResponse,
)

DEFAULT_EMOJI = "🎓"
# An emoji with skin-tone or ZWJ modifiers can run to several code points; a word cannot
# sneak under this limit and also contain no letters.
MAX_EMOJI_CODE_POINTS = 8


def tidy_expert(pick: ExpertPick) -> ExpertPick:
    emoji = pick.emoji.strip()
    is_emoji_like = 0 < len(emoji) <= MAX_EMOJI_CODE_POINTS and not any(ch.isalnum() for ch in emoji)
    # The role goes back to /api/explain, whose validator caps it — trim here so a verbose
    # title from the model can never make the next request fail.
    role = " ".join(pick.expert_role.split())[:ROLE_MAX_CHARS].strip()
    return pick.model_copy(update={"emoji": emoji if is_emoji_like else DEFAULT_EMOJI, "expert_role": role})


async def find_expert(topic: str, generator: JsonGenerator) -> RoleResponse:
    segments = build_role_prompt(topic)
    pick = await generator.generate(render(segments), ExpertPick)
    return RoleResponse(expert=tidy_expert(pick), prompt=segments)


async def explain(request: ExplainRequest, generator: JsonGenerator) -> ExplainResponse:
    segments = build_explain_prompt(
        request.topic, request.expert_role, request.level, request.language, request.length
    )
    explanation = await generator.generate(render(segments), Explanation)
    return ExplainResponse(explanation=explanation, prompt=segments)
