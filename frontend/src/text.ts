import type { ExpertPick, Explanation } from "./types";

// Same limits as backend/app/schemas.py, checked here so the user hears about a bad
// value before a round trip.
export const TOPIC_MIN_CHARS = 2;
export const TOPIC_MAX_CHARS = 100;
const ROLE_MIN_CHARS = 2;
const ROLE_MAX_CHARS = 60;

export type TextCheck = { ok: true; value: string } | { ok: false; message: string };

function checkFreeText(raw: string, label: string, min: number, max: number): TextCheck {
  const value = raw.split(/\s+/).filter(Boolean).join(" ");
  if (/[<>]/.test(value)) return { ok: false, message: `${label} can't contain < or >.` };
  if (value.length < min || value.length > max) {
    return { ok: false, message: `${label} needs ${min} to ${max} characters.` };
  }
  return { ok: true, value };
}

export function validateTopic(raw: string): TextCheck {
  return checkFreeText(raw, "The topic", TOPIC_MIN_CHARS, TOPIC_MAX_CHARS);
}

export function validateRole(raw: string): { ok: true; role: string } | { ok: false; message: string } {
  const check = checkFreeText(raw, "The expert", ROLE_MIN_CHARS, ROLE_MAX_CHARS);
  return check.ok ? { ok: true, role: check.value } : check;
}

export function withArticle(role: string): string {
  // "an Urban Planner" but "a University Professor": the sound decides, not the letter.
  const startsWithVowelSound = /^[aeiou]/i.test(role) && !/^(uni|use|eu)/i.test(role);
  return `${startsWithVowelSound ? "an" : "a"} ${role}`;
}

export function toMarkdown(topic: string, expert: ExpertPick, explanation: Explanation): string {
  const sections = [
    `# ${topic}`,
    `_Explained by ${withArticle(expert.expert_role)} (${expert.field})_`,
    `## What it is\n\n${explanation.definition}`,
    `## Think of it like this\n\n${explanation.analogy}`,
    `## From my work as ${withArticle(expert.expert_role)}\n\n${explanation.field_example}`,
  ];
  if (explanation.code_or_formula) {
    sections.push(`## Formula or code\n\n\`\`\`\n${explanation.code_or_formula}\n\`\`\``);
  }
  const terms = explanation.key_terms.map((term) => `- **${term.term}**: ${term.meaning}`).join("\n");
  sections.push(`## Words to know\n\n${terms}`, `## In short\n\n${explanation.summary}`);
  return `${sections.join("\n\n")}\n`;
}
