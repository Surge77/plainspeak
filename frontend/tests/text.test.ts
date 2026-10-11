import { describe, expect, it } from "vitest";

import { toMarkdown, validateRole, withArticle } from "../src/text";
import { makeExpert, makeExplanation } from "./fixtures";

describe("withArticle", () => {
  it.each([
    ["Astrophysicist", "an Astrophysicist"],
    ["Chef", "a Chef"],
    ["Urban Planner", "an Urban Planner"],
  ])("puts the right article before %s", (role, expected) => {
    expect(withArticle(role)).toBe(expected);
  });
});

describe("validateRole", () => {
  it("accepts a normal job title", () => {
    expect(validateRole("  Science   Teacher ")).toEqual({ ok: true, role: "Science Teacher" });
  });

  it.each(["", "x", "y".repeat(61), "<b>Chef</b>"])("rejects %j", (role) => {
    expect(validateRole(role).ok).toBe(false);
  });
});

describe("toMarkdown", () => {
  it("includes every section and the expert", () => {
    const markdown = toMarkdown("Black holes", makeExpert(), makeExplanation());

    expect(markdown).toContain("# Black holes");
    expect(markdown).toContain("Explained by an Astrophysicist");
    expect(markdown).toContain("```\nr_s = 2GM / c^2\n```");
    expect(markdown).toContain("- **Event horizon**: The point of no return.");
  });

  it("leaves out the formula section when there is none", () => {
    const markdown = toMarkdown("Black holes", makeExpert(), makeExplanation({ code_or_formula: null }));

    expect(markdown).not.toContain("```");
  });
});
