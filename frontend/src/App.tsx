import { useState } from "react";

import { ResultView } from "./components/ResultView";
import { InfoIcon } from "./components/icons";
import { SiteHeader } from "./components/SiteHeader";
import { TOPIC_INPUT_ID, TopicSentence } from "./components/TopicSentence";
import { describeStatus } from "./explainerState";
import { useExplainer } from "./useExplainer";
import { useIsVisible } from "./useIsVisible";

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function App() {
  const { state, start, changeExpert, retry } = useExplainer();
  const isBusy = state.kind === "findingExpert" || state.kind === "explaining";
  const [scrollSentinel, setScrollSentinel] = useState<HTMLDivElement | null>(null);
  const [nameTag, setNameTag] = useState<HTMLElement | null>(null);
  const isAtTop = useIsVisible(scrollSentinel);
  const isNameTagVisible = useIsVisible(nameTag);
  const expert = state.kind === "explaining" || state.kind === "done" ? state.expert : null;

  function goToNewTopic() {
    const input = document.getElementById(TOPIC_INPUT_ID);
    if (!(input instanceof HTMLInputElement)) return;
    input.closest("form")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    input.focus({ preventScroll: true });
    input.select();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div ref={setScrollSentinel} data-scroll-sentinel aria-hidden="true" className="h-px" />
      <SiteHeader
        isScrolled={!isAtTop}
        awayExpert={expert && nameTag && !isNameTagVisible ? expert : null}
        showNewTopic={state.kind !== "idle"}
        onNewTopic={goToNewTopic}
        onBackToExpert={() => nameTag?.scrollIntoView({ behavior: scrollBehavior(), block: "start" })}
      />

      {/* Idle: the sentence sits in the optical centre instead of under a blank screen. */}
      <main className={`frame flex flex-1 flex-col pb-20 ${state.kind === "idle" ? "justify-center" : ""}`}>
        <h1 className="sr-only">PlainSpeak: any topic, explained by the right expert</h1>
        <TopicSentence isBusy={isBusy} onSubmit={start} />
        <p role="status" className="sr-only">
          {describeStatus(state)}
        </p>
        <ResultView state={state} nameTagRef={setNameTag} onChangeExpert={changeExpert} onRetry={retry} />
      </main>

      <footer className="frame">
        <p className="site-footer">
          <InfoIcon />
          Explanations are written by Gemini and can contain mistakes. Check anything important.
        </p>
      </footer>
    </div>
  );
}
