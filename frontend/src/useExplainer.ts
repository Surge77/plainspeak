import { useCallback, useEffect, useReducer, useRef } from "react";

import { fetchExpert, fetchExplanation, UNEXPECTED_REPLY } from "./api";
import { explainerReducer, INITIAL_STATE, type ExplainerState } from "./explainerState";
import type { Choices } from "./types";

export interface Explainer {
  state: ExplainerState;
  start: (choices: Choices) => void;
  changeExpert: (role: string) => void;
  retry: () => void;
}

export function useExplainer(): Explainer {
  const [state, dispatch] = useReducer(explainerReducer, INITIAL_STATE);
  // Every run gets an id. A response whose id is no longer current belongs to a run the
  // user has replaced (or to an unmounted component), and is dropped.
  const runId = useRef(0);

  useEffect(() => {
    const current = runId;
    return () => {
      current.current += 1;
    };
  }, []);

  // The runs are fired with `void`, so anything they throw must become a "failed" state
  // here; otherwise the UI would sit in a busy state forever.
  const failUnexpectedly = useCallback((id: number) => {
    if (id === runId.current) dispatch({ type: "failed", message: UNEXPECTED_REPLY });
  }, []);

  const runExplanation = useCallback(
    async (id: number, choices: Choices, role: string) => {
      try {
        const result = await fetchExplanation({ ...choices, expert_role: role });
        if (id !== runId.current) return;
        dispatch(
          result.ok
            ? { type: "explained", explanation: result.data.explanation, prompt: result.data.prompt }
            : { type: "failed", message: result.message },
        );
      } catch {
        failUnexpectedly(id);
      }
    },
    [failUnexpectedly],
  );

  const runFromExpert = useCallback(
    async (choices: Choices) => {
      const id = ++runId.current;
      try {
        const result = await fetchExpert(choices.topic);
        if (id !== runId.current) return;
        if (!result.ok) {
          dispatch({ type: "failed", message: result.message });
          return;
        }
        dispatch({ type: "expertFound", expert: result.data.expert, prompt: result.data.prompt });
        if (result.data.expert.is_valid_topic) {
          await runExplanation(id, choices, result.data.expert.expert_role);
        }
      } catch {
        failUnexpectedly(id);
      }
    },
    [runExplanation, failUnexpectedly],
  );

  const start = useCallback(
    (choices: Choices) => {
      dispatch({ type: "submitted", choices });
      void runFromExpert(choices);
    },
    [runFromExpert],
  );

  const changeExpert = useCallback(
    (role: string) => {
      if (state.kind !== "done") return;
      dispatch({ type: "expertChanged", role });
      void runExplanation(++runId.current, state.choices, role);
    },
    [state, runExplanation],
  );

  const retry = useCallback(() => {
    if (state.kind !== "error") return;
    dispatch({ type: "retried" });
    if (state.expert && state.rolePrompt) {
      void runExplanation(++runId.current, state.choices, state.expert.expert_role);
    } else {
      void runFromExpert(state.choices);
    }
  }, [state, runExplanation, runFromExpert]);

  return { state, start, changeExpert, retry };
}
