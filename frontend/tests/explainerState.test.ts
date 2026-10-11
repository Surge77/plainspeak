import { describe, expect, it } from "vitest";

import { describeStatus, explainerReducer, INITIAL_STATE, type ExplainerState } from "../src/explainerState";
import { makeChoices, makeExpert, makeExplanation, makePrompt } from "./fixtures";

const choices = makeChoices();

function explainingState(): ExplainerState {
  return { kind: "explaining", choices, expert: makeExpert(), rolePrompt: makePrompt() };
}

describe("explainerReducer", () => {
  it("starts idle", () => {
    expect(INITIAL_STATE).toEqual({ kind: "idle" });
  });

  it("moves to finding the expert when the user submits", () => {
    const next = explainerReducer(INITIAL_STATE, { type: "submitted", choices });

    expect(next).toEqual({ kind: "findingExpert", choices });
  });

  it("moves to explaining once a valid expert is found", () => {
    const finding = explainerReducer(INITIAL_STATE, { type: "submitted", choices });

    const next = explainerReducer(finding, { type: "expertFound", expert: makeExpert(), prompt: makePrompt() });

    expect(next.kind).toBe("explaining");
  });

  it("stops at invalidTopic when the expert finder rejects the topic", () => {
    const finding = explainerReducer(INITIAL_STATE, { type: "submitted", choices });

    const next = explainerReducer(finding, {
      type: "expertFound",
      expert: makeExpert({ is_valid_topic: false }),
      prompt: makePrompt(),
    });

    expect(next.kind).toBe("invalidTopic");
  });

  it("finishes with both prompts kept for the prompt viewer", () => {
    const explainPrompt = makePrompt("Task: Explain");

    const next = explainerReducer(explainingState(), {
      type: "explained",
      explanation: makeExplanation(),
      prompt: explainPrompt,
    });

    expect(next).toMatchObject({ kind: "done", rolePrompt: makePrompt(), explainPrompt });
  });

  it("swaps in the new role and explains again when the user changes expert", () => {
    const done = explainerReducer(explainingState(), {
      type: "explained",
      explanation: makeExplanation(),
      prompt: makePrompt(),
    });

    const next = explainerReducer(done, { type: "expertChanged", role: "Science Teacher" });

    expect(next).toMatchObject({ kind: "explaining", expert: { expert_role: "Science Teacher" } });
  });

  it("records the failure message and keeps the expert so a retry can skip step one", () => {
    const next = explainerReducer(explainingState(), { type: "failed", message: "Gemini is down" });

    expect(next).toMatchObject({ kind: "error", message: "Gemini is down", expert: makeExpert() });
  });

  it.each<[ExplainerState["kind"], ExplainerState, string]>([
    ["idle", INITIAL_STATE, ""],
    ["findingExpert", { kind: "findingExpert", choices }, "Finding the right expert…"],
    ["explaining", { kind: "explaining", choices, expert: makeExpert(), rolePrompt: [] }, "Astrophysicist is writing your explanation…"],
    ["invalidTopic", { kind: "invalidTopic", choices, expert: makeExpert() }, "That isn't a topic PlainSpeak can explain."],
    ["error", { kind: "error", choices, message: "Gemini is down", expert: null, rolePrompt: null }, "Gemini is down"],
  ])("describes the %s state for screen readers", (_, state, expected) => {
    expect(describeStatus(state)).toBe(expected);
  });

  it("ignores results that arrive for a step that is no longer running", () => {
    const next = explainerReducer(INITIAL_STATE, {
      type: "explained",
      explanation: makeExplanation(),
      prompt: makePrompt(),
    });

    expect(next).toBe(INITIAL_STATE);
  });
});
