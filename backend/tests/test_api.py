import pytest

from app.gemini import GeminiBadOutput, GeminiRateLimited, GeminiUnavailable
from app.schemas import ExpertPick, Explanation, KeyTerm


def an_expert(**overrides) -> ExpertPick:
    fields = {
        "is_valid_topic": True,
        "field": "Astrophysics",
        "expert_role": "Astrophysicist",
        "interpreted_as": "Regions of space where gravity traps light",
        "emoji": "🔭",
    }
    return ExpertPick(**{**fields, **overrides})


def an_explanation(**overrides) -> Explanation:
    fields = {
        "definition": "A black hole is a place where gravity is so strong nothing escapes.",
        "analogy": "Like a drain that even light cannot climb out of.",
        "field_example": "We find them by watching stars orbit something invisible.",
        "code_or_formula": "r_s = 2GM / c^2",
        "key_terms": [KeyTerm(term="Event horizon", meaning="The point of no return.")],
        "summary": "Black holes are collapsed stars. Nothing escapes them.",
    }
    return Explanation(**{**fields, **overrides})


def explain_body(**overrides):
    body = {
        "topic": "Black holes",
        "expert_role": "Astrophysicist",
        "level": "beginner",
        "language": "English",
        "length": "standard",
    }
    return {**body, **overrides}


def test_health_reports_ok(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_role_returns_the_expert_and_the_prompt_that_was_sent(client, fake_generator):
    fake_generator.replies.append(an_expert())

    response = client.post("/api/role", json={"topic": "Black holes"})

    assert response.status_code == 200
    body = response.json()
    assert body["expert"]["expert_role"] == "Astrophysicist"
    sent_prompt = fake_generator.prompts[0]
    assert "\n\n".join(segment["text"] for segment in body["prompt"]) == sent_prompt


def test_role_passes_through_an_invalid_topic_verdict(client, fake_generator):
    fake_generator.replies.append(an_expert(is_valid_topic=False))

    response = client.post("/api/role", json={"topic": "asdfgh"})

    assert response.status_code == 200
    assert response.json()["expert"]["is_valid_topic"] is False


def test_role_rejects_a_topic_that_fails_validation_without_calling_gemini(client, fake_generator):
    response = client.post("/api/role", json={"topic": "x"})

    assert response.status_code == 422
    assert fake_generator.prompts == []


def test_role_replaces_a_non_emoji_with_the_default(client, fake_generator):
    fake_generator.replies.append(an_expert(emoji="telescope"))

    response = client.post("/api/role", json={"topic": "Black holes"})

    assert response.json()["expert"]["emoji"] == "🎓"


def test_role_trims_an_overlong_expert_title_so_it_can_be_sent_back(client, fake_generator):
    fake_generator.replies.append(an_expert(expert_role="Very " * 20 + "Senior Astrophysicist"))

    role = client.post("/api/role", json={"topic": "Black holes"}).json()["expert"]["expert_role"]

    assert len(role) <= 60
    fake_generator.replies.append(an_explanation())
    assert client.post("/api/explain", json=explain_body(expert_role=role)).status_code == 200


def test_explain_returns_the_explanation_sections(client, fake_generator):
    fake_generator.replies.append(an_explanation())

    response = client.post("/api/explain", json=explain_body())

    assert response.status_code == 200
    explanation = response.json()["explanation"]
    assert explanation["key_terms"][0]["term"] == "Event horizon"
    assert explanation["code_or_formula"] == "r_s = 2GM / c^2"


def test_explain_sends_the_user_choices_to_gemini(client, fake_generator):
    fake_generator.replies.append(an_explanation(code_or_formula=None))

    client.post("/api/explain", json=explain_body(expert_role="Pastry Chef", language="Hindi"))

    assert "Pastry Chef" in fake_generator.prompts[0]
    assert "Hindi" in fake_generator.prompts[0]


@pytest.mark.parametrize(
    "error, status",
    [(GeminiRateLimited(), 429), (GeminiUnavailable(), 502), (GeminiBadOutput(), 502)],
)
def test_gemini_failures_become_clean_http_errors(client, fake_generator, error, status):
    fake_generator.replies.append(error)

    response = client.post("/api/explain", json=explain_body())

    assert response.status_code == status
    assert response.json() == {"detail": error.user_message}
