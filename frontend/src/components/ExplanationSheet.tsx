import type { ReactNode } from "react";

import { withArticle } from "../text";
import type { Explanation } from "../types";

interface ExplanationSheetProps {
  explanation: Explanation;
  role: string;
}

function Part({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="sheet-part">
      <h3 className="sheet-heading">{heading}</h3>
      {children}
    </section>
  );
}

export function ExplanationSheet({ explanation, role }: ExplanationSheetProps) {
  return (
    <article className="sheet">
      <Part heading="What it is">
        <p className="text-[1.3rem] leading-relaxed text-ink">{explanation.definition}</p>
      </Part>

      <Part heading="Think of it like this">
        <blockquote className="border-l-4 border-rule pl-5 text-lg leading-relaxed">{explanation.analogy}</blockquote>
      </Part>

      <Part heading={`From my work as ${withArticle(role)}`}>
        <p className="leading-relaxed">{explanation.field_example}</p>
      </Part>

      {explanation.code_or_formula && (
        <Part heading="Formula or code">
          <pre className="code-block">
            <code>{explanation.code_or_formula}</code>
          </pre>
        </Part>
      )}

      {explanation.key_terms.length > 0 && (
        <Part heading="Words to know">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(8rem,auto)_1fr]">
            {explanation.key_terms.map((keyTerm) => (
              <div key={keyTerm.term} className="contents">
                <dt>
                  <mark className="term">{keyTerm.term}</mark>
                </dt>
                <dd className="mb-2 sm:mb-0">{keyTerm.meaning}</dd>
              </div>
            ))}
          </dl>
        </Part>
      )}

      <section className="summary">
        <h3 className="sheet-heading">In short</h3>
        <p className="text-lg leading-relaxed text-ink">{explanation.summary}</p>
      </section>
    </article>
  );
}
