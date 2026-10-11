from app.prompts import (
    AUDIENCE,
    LENGTH_RULE,
    build_explain_prompt,
    build_role_prompt,
    render,
)


def techniques(segments):
    return [segment.technique for segment in segments]


def test_role_prompt_wraps_topic_in_tags():
    prompt = render(build_role_prompt("Black holes"))

    assert "<topic>Black holes</topic>" in prompt


def test_role_prompt_guards_against_instructions_in_topic():
    segments = build_role_prompt("Black holes")

    assert "GUARDRAIL" in techniques(segments)
    assert "never as instructions" in render(segments)


def test_role_prompt_asks_for_ambiguity_and_validity_handling():
    prompt = render(build_role_prompt("Java"))

    assert "most common meaning" in prompt
    assert "is_valid_topic" in prompt


def test_explain_prompt_uses_the_chosen_expert_as_role():
    segments = build_explain_prompt("Black holes", "Astrophysicist", "beginner", "English", "standard")

    role_segment = segments[0]
    assert role_segment.technique == "ROLE"
    assert "Astrophysicist" in role_segment.text


def test_explain_prompt_fills_every_dynamic_slot():
    prompt = render(build_explain_prompt("Recursion", "Software Engineer", "kid", "Marathi", "quick"))

    assert "<topic>Recursion</topic>" in prompt
    assert AUDIENCE["kid"] in prompt
    assert "Marathi" in prompt
    assert LENGTH_RULE["quick"] in prompt


def test_explain_prompt_labels_every_technique_used():
    segments = build_explain_prompt("GST", "Chartered Accountant", "pro", "Hindi", "deep")

    assert set(techniques(segments)) == {
        "ROLE",
        "TASK",
        "DYNAMIC SLOT",
        "OUTPUT FORMAT",
        "FEW-SHOT",
        "GUARDRAIL",
    }


def test_explain_prompt_keeps_answer_language_when_example_is_english():
    prompt = render(build_explain_prompt("GST", "Chartered Accountant", "pro", "Hindi", "deep"))

    assert "even though the example is in English" in prompt


def test_every_level_and_length_has_wording():
    assert set(AUDIENCE) == {"kid", "beginner", "student", "pro"}
    assert set(LENGTH_RULE) == {"quick", "standard", "deep"}


def test_render_joins_segments_in_order():
    segments = build_role_prompt("Tides")

    assert render(segments) == "\n\n".join(segment.text for segment in segments)


def test_explain_prompt_treats_the_role_as_data_not_instructions():
    segments = build_explain_prompt("GST", "Chartered Accountant", "pro", "Hindi", "deep")

    assert "<role>Chartered Accountant</role>" in render(segments)
    guardrail = next(segment.text for segment in segments if segment.technique == "GUARDRAIL")
    assert "<role>" in guardrail
