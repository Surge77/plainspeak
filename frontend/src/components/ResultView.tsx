import { useEffect, useRef, useState, type ReactNode } from "react";

import type { ExplainerState } from "../explainerState";
import { withArticle } from "../text";
import { ExplanationSheet } from "./ExplanationSheet";
import { NameTag } from "./NameTag";
import { PromptPanel } from "./PromptPanel";
import { ResultActions } from "./ResultActions";

interface ResultViewProps {
  state: ExplainerState;
  nameTagRef: (element: HTMLElement | null) => void;
  onChangeExpert: (role: string) => void;
  onRetry: () => void;
}

// Rendered when a result replaces the control the user just pressed ("Try again",
// "Ask them"), so keyboard focus lands on the new content instead of falling to <body>.
function FocusHeading({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <h2 ref={ref} tabIndex={-1} className="sr-only">
      {children}
    </h2>
  );
}

function WritingPlaceholder({ role }: { role: string }) {
  return (
    <div>
      <p className="text-muted">{role} is writing your explanation…</p>
      <div aria-hidden="true" className="mt-6 space-y-3">
        <div className="placeholder-line w-11/12" />
        <div className="placeholder-line w-4/5" />
        <div className="placeholder-line w-2/3" />
      </div>
    </div>
  );
}

// Wide screens: a sticky rail (who is explaining, what you can do) beside the lesson.
// Narrow screens: the rail simply stacks above it.
function ResultLayout({ rail, children }: { rail: ReactNode; children?: ReactNode }) {
  return (
    <div className="result-grid">
      <aside className="result-rail" aria-label="About this explanation">
        {rail}
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function ResultView({ state, nameTagRef, onChangeExpert, onRetry }: ResultViewProps) {
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  switch (state.kind) {
    case "idle":
      return null;

    case "findingExpert":
      return <ResultLayout rail={<NameTag expert={null} topic={state.choices.topic} />} />;

    case "explaining":
      return (
        <ResultLayout rail={<NameTag expert={state.expert} topic={state.choices.topic} tagRef={nameTagRef} />}>
          <WritingPlaceholder role={state.expert.expert_role} />
        </ResultLayout>
      );

    case "invalidTopic":
      return (
        <div className="notice">
          <FocusHeading>Not a topic PlainSpeak can explain</FocusHeading>
          <p>
            “{state.choices.topic}” doesn't look like a topic I can explain. Try something you could look up in a
            textbook or a course, like photosynthesis or SQL joins.
          </p>
        </div>
      );

    case "error":
      return (
        <div className="notice notice-error">
          <FocusHeading>Something went wrong</FocusHeading>
          <p>{state.message}</p>
          <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
            Try again
          </button>
        </div>
      );

    case "done":
      return (
        <ResultLayout
          rail={
            <>
              <FocusHeading>{`${state.choices.topic}, explained by ${withArticle(state.expert.expert_role)}`}</FocusHeading>
              <NameTag
                expert={state.expert}
                topic={state.choices.topic}
                tagRef={nameTagRef}
                onChangeExpert={onChangeExpert}
              />
              <div className="mt-8">
                <ResultActions
                  topic={state.choices.topic}
                  expert={state.expert}
                  explanation={state.explanation}
                  isPromptOpen={isPromptOpen}
                  onTogglePrompt={() => setIsPromptOpen((open) => !open)}
                />
              </div>
            </>
          }
        >
          <ExplanationSheet explanation={state.explanation} role={state.expert.expert_role} />
          {isPromptOpen && <PromptPanel rolePrompt={state.rolePrompt} explainPrompt={state.explainPrompt} />}
        </ResultLayout>
      );
  }
}
