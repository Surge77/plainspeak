# PlainSpeak

Type any topic and PlainSpeak explains it in plain language, as an expert from that topic's own field would.

It makes two Gemini calls. The first works out who should explain the topic ("black holes" → an Astrophysicist). The second fills a dynamic prompt template with that expert, your topic, the audience, the language and the length. The "See the prompt" button shows both prompts exactly as they were sent, with each part tagged by the prompting technique it uses: role prompt, task, dynamic slot, output format, few-shot example, guardrail.

## Run it

You need Python 3.11, Node 20+ with pnpm, and a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

**1. Backend**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
copy .env.example .env   # then put your key after GEMINI_API_KEY=
```

**2a. Demo mode: one command, one URL**

```powershell
cd frontend; pnpm install; pnpm build; cd ..\backend
uvicorn app.main:app --port 8000
```

Open http://127.0.0.1:8000.

**2b. Development mode: hot reload**

```powershell
# terminal 1
cd backend; uvicorn app.main:app --reload --port 8000
# terminal 2
cd frontend; pnpm dev
```

Open http://127.0.0.1:5173. Vite forwards `/api` to the backend, so no CORS setup is needed.

## Test

```powershell
cd backend;  pytest --cov=app;  pyright
cd frontend; pnpm coverage;     pnpm typecheck
```

No test calls Gemini. The backend tests swap in a fake generator, and the frontend tests mock the API module.

## How it is built

| Part | Where | What it does |
|---|---|---|
| Prompts | `backend/app/prompts.py` | Pure functions returning tagged segments. Gemini gets them joined, the UI shows them tagged |
| Gemini | `backend/app/gemini.py` | The only module that calls Gemini. Asks for JSON matching a Pydantic schema, validates the reply, and turns failures into plain messages |
| API | `backend/app/main.py` | `POST /api/role`, `POST /api/explain`, `GET /api/health`. Also serves the built frontend |
| UI state | `frontend/src/explainerState.ts` | One state machine: idle → finding expert → explaining → done, invalid topic or error |

## Notes

- The API key lives only in `backend/.env`, which git ignores. It is never sent to the browser.
- Topics are limited to 100 characters and can't contain `<` or `>`, because the topic sits inside `<topic>` tags in the prompt.
- On Gemini's free tier, Google may use prompts to improve its products. Don't type anything private.
