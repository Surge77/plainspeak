import type { Choices, ExpertPick, Explanation, PromptSegment } from "./types";

// A user-typed expert has no field-specific emoji, so it gets the generic one.
const CUSTOM_EXPERT_EMOJI = "🎓";

export type ExplainerState =
  | { kind: "idle" }
  | { kind: "findingExpert"; choices: Choices }
  | { kind: "explaining"; choices: Choices; expert: ExpertPick; rolePrompt: PromptSegment[] }
  | {
      kind: "done";
      choices: Choices;
      expert: ExpertPick;
      rolePrompt: PromptSegment[];
      explanation: Explanation;
      explainPrompt: PromptSegment[];
    }
  | { kind: "invalidTopic"; choices: Choices; expert: ExpertPick }
  | {
      kind: "error";
      choices: Choices;
      message: string;
      expert: ExpertPick | null;
      rolePrompt: PromptSegment[] | null;
    };

export type ExplainerAction =
  | { type: "submitted"; choices: Choices }
  | { type: "expertFound"; expert: ExpertPick; prompt: PromptSegment[] }
  | { type: "explained"; explanation: Explanation; prompt: PromptSegment[] }
  | { type: "expertChanged"; role: string }
  | { type: "retried" }
  | { type: "failed"; message: string };

export const INITIAL_STATE: ExplainerState = { kind: "idle" };

// One short sentence per state for the screen-reader status region, so a finished
// explanation is announced without reading the whole sheet aloud.
export function describeStatus(state: ExplainerState): string {
  switch (state.kind) {
    case "idle":
      return "";
    case "findingExpert":
      return "Finding the right expert…";
    case "explaining":
      return `${state.expert.expert_role} is writing your explanation…`;
    case "done":
      return "Explanation ready.";
    case "invalidTopic":
      return "That isn't a topic PlainSpeak can explain.";
    case "error":
      return state.message;
  }
}

export function explainerReducer(state: ExplainerState, action: ExplainerAction): ExplainerState {
  switch (action.type) {
    case "submitted":
      return { kind: "findingExpert", choices: action.choices };

    case "expertFound":
      if (state.kind !== "findingExpert") return state;
      if (!action.expert.is_valid_topic) {
        return { kind: "invalidTopic", choices: state.choices, expert: action.expert };
      }
      return { kind: "explaining", choices: state.choices, expert: action.expert, rolePrompt: action.prompt };

    case "explained":
      if (state.kind !== "explaining") return state;
      return { ...state, kind: "done", explanation: action.explanation, explainPrompt: action.prompt };

    case "expertChanged": {
      if (state.kind !== "done") return state;
      const expert = { ...state.expert, expert_role: action.role, emoji: CUSTOM_EXPERT_EMOJI };
      return { kind: "explaining", choices: state.choices, expert, rolePrompt: state.rolePrompt };
    }

    case "retried":
      if (state.kind !== "error") return state;
      if (state.expert && state.rolePrompt) {
        return { kind: "explaining", choices: state.choices, expert: state.expert, rolePrompt: state.rolePrompt };
      }
      return { kind: "findingExpert", choices: state.choices };

    case "failed":
      if (state.kind === "findingExpert") {
        return { kind: "error", choices: state.choices, message: action.message, expert: null, rolePrompt: null };
      }
      if (state.kind === "explaining") {
        return {
          kind: "error",
          choices: state.choices,
          message: action.message,
          expert: state.expert,
          rolePrompt: state.rolePrompt,
        };
      }
      return state;
  }
}
