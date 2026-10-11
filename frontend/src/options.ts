import type { Language, Length, Level, Technique } from "./types";

export const LEVELS: ReadonlyArray<{ value: Level; label: string }> = [
  { value: "kid", label: "a 10-year-old" },
  { value: "beginner", label: "a beginner" },
  { value: "student", label: "a student" },
  { value: "pro", label: "a professional" },
];

export const LANGUAGES: ReadonlyArray<{ value: Language; label: string }> = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Marathi", label: "Marathi" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
];

export const LENGTHS: ReadonlyArray<{ value: Length; label: string }> = [
  { value: "quick", label: "briefly" },
  { value: "standard", label: "in a few paragraphs" },
  { value: "deep", label: "in depth" },
];

export const SUGGESTED_TOPICS = ["photosynthesis", "SQL joins", "black holes", "GST"] as const;

export const TECHNIQUE_LABELS: Record<Technique, string> = {
  ROLE: "Role prompt",
  TASK: "Task",
  "DYNAMIC SLOT": "Dynamic slot",
  "OUTPUT FORMAT": "Output format",
  "FEW-SHOT": "Few-shot example",
  GUARDRAIL: "Guardrail",
};

// CSS custom properties defined in index.css; the same colours mark the sentence slots
// (dynamic) and the name tag (role), so the prompt viewer's legend reads like the page.
export const TECHNIQUE_COLORS: Record<Technique, string> = {
  ROLE: "var(--t-role)",
  TASK: "var(--t-task)",
  "DYNAMIC SLOT": "var(--t-slot)",
  "OUTPUT FORMAT": "var(--t-format)",
  "FEW-SHOT": "var(--t-fewshot)",
  GUARDRAIL: "var(--t-guard)",
};
