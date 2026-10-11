import type { Choices, ExpertPick, Explanation, PromptSegment } from "../src/types";

export function makeChoices(overrides: Partial<Choices> = {}): Choices {
  return { topic: "Black holes", level: "beginner", language: "English", length: "standard", ...overrides };
}

export function makeExpert(overrides: Partial<ExpertPick> = {}): ExpertPick {
  return {
    is_valid_topic: true,
    field: "Astrophysics",
    expert_role: "Astrophysicist",
    interpreted_as: "Regions of space where gravity traps light",
    emoji: "🔭",
    ...overrides,
  };
}

export function makeExplanation(overrides: Partial<Explanation> = {}): Explanation {
  return {
    definition: "A black hole is a place where gravity is so strong nothing escapes.",
    analogy: "Like a drain that even light cannot climb out of.",
    field_example: "We find them by watching stars orbit something invisible.",
    code_or_formula: "r_s = 2GM / c^2",
    key_terms: [{ term: "Event horizon", meaning: "The point of no return." }],
    summary: "Black holes are collapsed stars. Nothing escapes them.",
    ...overrides,
  };
}

export function makePrompt(text = "Role: You are an experienced Astrophysicist."): PromptSegment[] {
  return [
    { technique: "ROLE", text },
    { technique: "DYNAMIC SLOT", text: "<topic>Black holes</topic>" },
  ];
}
