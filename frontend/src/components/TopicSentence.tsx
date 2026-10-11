import { useState, type FormEvent } from "react";

import { LANGUAGES, LENGTHS, LEVELS, SUGGESTED_TOPICS } from "../options";
import { TOPIC_MAX_CHARS, validateTopic } from "../text";
import type { Choices, Language, Length, Level } from "../types";

interface TopicSentenceProps {
  isBusy: boolean;
  onSubmit: (choices: Choices) => void;
}

export const TOPIC_INPUT_ID = "topic-input";

// The input grows with what is typed, so the sentence stays a sentence.
const MIN_TOPIC_WIDTH_CH = 11;

export function TopicSentence({ isBusy, onSubmit }: TopicSentenceProps) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [language, setLanguage] = useState<Language>("English");
  const [length, setLength] = useState<Length>("standard");
  const [problem, setProblem] = useState<string | null>(null);

  function submit(rawTopic: string) {
    const check = validateTopic(rawTopic);
    if (!check.ok) {
      setProblem(check.message);
      return;
    }
    setProblem(null);
    onSubmit({ topic: check.value, level, language, length });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(topic);
  }

  function pickSuggestion(suggestion: string) {
    setTopic(suggestion);
    submit(suggestion);
  }

  return (
    <form onSubmit={handleSubmit} className="py-10 sm:py-14" noValidate>
      <p className="font-display max-w-[26ch] text-[clamp(1.85rem,4.4vw,3.6rem)] leading-[1.25] font-semibold tracking-tight text-ink">
        Explain{" "}
        <input
          id={TOPIC_INPUT_ID}
          aria-label="Topic"
          aria-describedby={problem ? "topic-problem" : undefined}
          aria-invalid={problem !== null}
          className="slot slot-input"
          maxLength={TOPIC_MAX_CHARS}
          placeholder="black holes"
          size={Math.max(MIN_TOPIC_WIDTH_CH, topic.length + 1)}
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        />{" "}
        to{" "}
        <select aria-label="Who it is for" className="slot" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
          {LEVELS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>{" "}
        in{" "}
        <select aria-label="Language" className="slot" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
          {LANGUAGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        ,{" "}
        <select aria-label="Length" className="slot" value={length} onChange={(e) => setLength(e.target.value as Length)}>
          {LENGTHS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        .
      </p>

      {problem && (
        <p id="topic-problem" className="mt-3 text-base text-tag">
          {problem}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button type="submit" disabled={isBusy} className="btn-primary">
          Explain it
        </button>
        <p className="text-muted">
          Or try{" "}
          {SUGGESTED_TOPICS.map((suggestion, index) => (
            <span key={suggestion}>
              <button
                type="button"
                disabled={isBusy}
                className="link-button"
                onClick={() => pickSuggestion(suggestion)}
              >
                {suggestion}
              </button>
              {index < SUGGESTED_TOPICS.length - 2 ? ", " : index === SUGGESTED_TOPICS.length - 2 ? " or " : "."}
            </span>
          ))}
        </p>
      </div>
    </form>
  );
}
