// Mirrors backend/app/schemas.py. Keep the two in step when either changes.

export type Level = "kid" | "beginner" | "student" | "pro";
export type Language = "English" | "Hindi" | "Marathi" | "Spanish" | "French" | "German";
export type Length = "quick" | "standard" | "deep";
export type Technique = "ROLE" | "TASK" | "DYNAMIC SLOT" | "OUTPUT FORMAT" | "FEW-SHOT" | "GUARDRAIL";

export interface Choices {
  topic: string;
  level: Level;
  language: Language;
  length: Length;
}

export interface ExpertPick {
  is_valid_topic: boolean;
  field: string;
  expert_role: string;
  interpreted_as: string;
  emoji: string;
}

export interface KeyTerm {
  term: string;
  meaning: string;
}

export interface Explanation {
  definition: string;
  analogy: string;
  field_example: string;
  code_or_formula: string | null;
  key_terms: KeyTerm[];
  summary: string;
}

export interface PromptSegment {
  technique: Technique;
  text: string;
}

export interface RoleResponse {
  expert: ExpertPick;
  prompt: PromptSegment[];
}

export interface ExplainRequest {
  topic: string;
  expert_role: string;
  level: Level;
  language: Language;
  length: Length;
}

export interface ExplainResponse {
  explanation: Explanation;
  prompt: PromptSegment[];
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };
