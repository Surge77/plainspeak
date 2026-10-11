# PlainSpeak design

Agreed during brainstorming on 2026-10-11 and 2026-10-12.

## Brief

A topic explainer for the GenAI course. It has to use basic prompting techniques and have an attractive frontend calling Gemini. It is shown as a local class demo after about a week.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Stack | React (Vite, TypeScript, Tailwind) + FastAPI | Chosen by the student. FastAPI keeps the API key off the browser |
| Who explains | Two calls (prompt chaining): find the expert, then explain as them | The role is visible, editable and testable. A single call would hide it inside the answer |
| Output | Gemini structured output with a Pydantic schema, validated on our side | `json.ipynb` printed raw text, and fenced or chatty replies break `json.loads` |
| Techniques shown | Every prompt segment carries a technique tag, shown in "See the prompt" | Makes the prompting visible to whoever is assessing it |
| Model | `gemini-flash-lite-latest` | The model used in class |
| Dev wiring | Vite proxy in development; FastAPI serves `dist/` in the demo | No CORS anywhere. The demo is one command |

## Visual direction

The first plan (cream paper, serif headings) was the most common generated-page look, so it was replaced:

- **Name tag**: a "Hello, I'm your…" sticker with the expert's title written in marker. Red is used only for the role.
- **Fill-in-the-blank sentence**: the form is the dynamic template. Every slot is underlined in amber, and amber also marks "Dynamic slot" in the prompt viewer.
- Cool paper and slate ink. Bricolage Grotesque for headings, Atkinson Hyperlegible for body text, Permanent Marker only on the tag.
- One motion moment: the role writes itself onto the tag. It is turned off under reduced motion.

## Out of scope

History of past topics, accounts, deployment, streaming responses, and comparing two techniques side by side.
