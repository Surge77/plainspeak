import { useId, useState, type FormEvent } from "react";

import { validateRole } from "../text";
import type { ExpertPick } from "../types";

interface NameTagProps {
  expert: ExpertPick | null;
  topic: string;
  tagRef?: (element: HTMLElement | null) => void;
  onChangeExpert?: (role: string) => void;
}

export function NameTag({ expert, topic, tagRef, onChangeExpert }: NameTagProps) {
  return (
    <section ref={tagRef} data-name-tag aria-label="Your expert" className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10 lg:flex-col lg:items-start lg:gap-6">
      <div className="nametag">
        <div className="nametag-band">
          <span className="nametag-hello">Hello,</span>
          <span className="nametag-sub">I'm your</span>
        </div>
        <div className="nametag-body">
          {expert ? (
            <>
              <span aria-hidden="true" className="text-3xl">
                {expert.emoji}
              </span>
              {/* key restarts the write-in animation when the expert changes */}
              <span key={expert.expert_role} className="nametag-role write-in">
                {expert.expert_role}
              </span>
            </>
          ) : (
            <span className="nametag-blank" aria-label="Finding the right expert" />
          )}
        </div>
      </div>

      <div className="max-w-sm pb-1 text-muted">
        {expert ? (
          <>
            <p>
              Reading “{topic}” as {lowerFirst(expert.interpreted_as)}
            </p>
            {onChangeExpert && <ChangeExpert onChange={onChangeExpert} />}
          </>
        ) : (
          <p>Finding the right expert for “{topic}”…</p>
        )}
      </div>
    </section>
  );
}

function lowerFirst(text: string): string {
  const trimmed = text.trim().replace(/\.$/, "");
  return `${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}.`;
}

function ChangeExpert({ onChange }: { onChange: (role: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const problemId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const check = validateRole(role);
    if (!check.ok) {
      setProblem(check.message);
      return;
    }
    setIsOpen(false);
    setRole("");
    setProblem(null);
    onChange(check.role);
  }

  if (!isOpen) {
    return (
      <button type="button" className="link-button mt-2" onClick={() => setIsOpen(true)}>
        Ask a different expert
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-2" noValidate>
      <input
        aria-label="Expert"
        aria-describedby={problem ? problemId : undefined}
        aria-invalid={problem !== null}
        autoFocus
        className="field"
        placeholder="e.g. Science Teacher"
        value={role}
        onChange={(event) => setRole(event.target.value)}
      />
      <button type="submit" className="btn-secondary">
        Ask them
      </button>
      <button type="button" className="link-button" onClick={() => setIsOpen(false)}>
        Cancel
      </button>
      {problem && (
        <p id={problemId} role="alert" className="w-full text-tag">
          {problem}
        </p>
      )}
    </form>
  );
}
