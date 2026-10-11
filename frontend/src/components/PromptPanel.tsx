import { useId, useRef, useState, type KeyboardEvent } from "react";

import { TECHNIQUE_COLORS, TECHNIQUE_LABELS } from "../options";
import type { PromptSegment } from "../types";

interface PromptPanelProps {
  rolePrompt: PromptSegment[];
  explainPrompt: PromptSegment[];
}

type Step = "role" | "explain";

const STEPS: ReadonlyArray<{ id: Step; label: string }> = [
  { id: "role", label: "Finding the expert" },
  { id: "explain", label: "Writing the explanation" },
];

export function PromptPanel({ rolePrompt, explainPrompt }: PromptPanelProps) {
  const [step, setStep] = useState<Step>("explain");
  const tabRefs = useRef<Partial<Record<Step, HTMLButtonElement | null>>>({});
  const baseId = useId();
  const segments = step === "role" ? rolePrompt : explainPrompt;

  // WAI-ARIA tabs: only the selected tab is in the Tab order; arrows, Home and End move
  // between tabs and select them.
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = STEPS.findIndex(({ id }) => id === step);
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % STEPS.length,
      ArrowLeft: (index - 1 + STEPS.length) % STEPS.length,
      Home: 0,
      End: STEPS.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = STEPS[target].id;
    setStep(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section aria-label="The prompts sent to Gemini" className="prompt-panel">
      <p className="mb-4 max-w-prose text-muted">
        PlainSpeak sends Gemini two prompts. The first picks the expert; the second is filled with that expert, your
        topic and your choices. Each part is marked with the prompting technique it uses.
      </p>

      <div role="tablist" aria-label="Prompt" className="mb-5 flex gap-1 border-b border-rule">
        {STEPS.map(({ id, label }) => (
          <button
            key={id}
            ref={(element) => {
              tabRefs.current[id] = element;
            }}
            id={`${baseId}-${id}-tab`}
            role="tab"
            type="button"
            aria-selected={step === id}
            aria-controls={`${baseId}-panel`}
            tabIndex={step === id ? 0 : -1}
            className="tab"
            onClick={() => setStep(id)}
            onKeyDown={handleKeyDown}
          >
            {label}
          </button>
        ))}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" tabIndex={0} aria-labelledby={`${baseId}-${step}-tab`}>
        <ol className="space-y-3">
          {segments.map((segment, index) => (
            <li key={`${step}-${index}`} className="segment">
              <span className="segment-label" style={{ color: TECHNIQUE_COLORS[segment.technique] }}>
                {TECHNIQUE_LABELS[segment.technique]}
              </span>
              <pre className="segment-text">{segment.text}</pre>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
