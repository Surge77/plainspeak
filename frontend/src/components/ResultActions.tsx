import { useEffect, useRef, useState } from "react";

import { toMarkdown } from "../text";
import type { ExpertPick, Explanation } from "../types";

interface ResultActionsProps {
  topic: string;
  expert: ExpertPick;
  explanation: Explanation;
  isPromptOpen: boolean;
  onTogglePrompt: () => void;
}

const FEEDBACK_MS = 2_000;

function fileNameFor(topic: string): string {
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "explanation"}.md`;
}

export function ResultActions({ topic, expert, explanation, isPromptOpen, onTogglePrompt }: ResultActionsProps) {
  const [copyLabel, setCopyLabel] = useState("Copy");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function flash(label: string) {
    setCopyLabel(label);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopyLabel("Copy"), FEEDBACK_MS);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(toMarkdown(topic, expert, explanation));
      flash("Copied");
    } catch {
      flash("Couldn't copy");
    }
  }

  function download() {
    const blob = new Blob([toMarkdown(topic, expert, explanation)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileNameFor(topic);
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" className="btn-secondary" onClick={copy} aria-live="polite">
        {copyLabel}
      </button>
      <button type="button" className="btn-secondary" onClick={download}>
        Download .md
      </button>
      <button type="button" className="btn-secondary" aria-expanded={isPromptOpen} onClick={onTogglePrompt}>
        {isPromptOpen ? "Hide the prompt" : "See the prompt"}
      </button>
    </div>
  );
}
