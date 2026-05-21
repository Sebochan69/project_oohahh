# PROJECT OOH-AHH

PROJECT OOH-AHH is a visual runtime learning platform for software
fundamentals. Learners write Python, inspect static structure, run controlled
execution traces, replay runtime events, see validation overlays, and ask an AI
mentor for grounded explanations and hints.

## Current V1 Prototype

Implemented V1 prototype capabilities:

- Vite, React, TypeScript frontend with a workspace shell
- In-memory Python file explorer and Monaco editor
- Lesson selector with Python foundations starter files
- FastAPI backend with `/health`
- Static AST analysis for files, imports, functions, classes, and syntax errors
- Controlled Python execution prototype with timeout protection
- Runtime trace events for execution start/finish, line execution, variable
  create/update, and errors
- Static and runtime React Flow graph rendering
- Timeline controls for Previous, Next, Play, Pause, and Reset
- stdout, stderr, error, and event inspection
- Basic lesson validation for expected stdout and required concepts
- Correctness states and graph node badges
- Beginner Mode and Engineer Mode detail levels
- AI Mentor panel using OpenAI when configured, with safe placeholder/fallback
  behavior when no key is available

## V1 Boundaries

V1 focuses on Python fundamentals:

- Variables, conditions, loops, functions
- Lists and dictionaries
- Static analysis of imports and multiple in-memory files
- Runtime tracing of a selected entry file
- Lesson validation for output and simple required concepts
- Local/rule-based misconception detection plus AI mentor responses

V1 intentionally excludes:

- Docker execution
- Kubernetes
- Arbitrary pip installs or external packages
- Network access from learner code
- Production debugging
- Collaborative editing
- Full terminal emulation
- Multi-language support
- Full sandbox hardening

## Architecture Philosophy

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```

OOH-AHH should make invisible runtime behavior visible while preserving the
discipline of reading, reasoning about, and improving code.

## Monorepo Layout

```text
frontend/   Vite + React + TypeScript app, workspace UI, graphs, timeline
backend/    FastAPI app, static analysis, runtime trace, mentor API
shared/     JSON Schema contracts for trace events, validation, lessons
lessons/    Python foundations lesson JSON files
docs/       Product, workflow, smoke test, and demo documentation
```

## Frontend Setup

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server prints a local URL, usually
`http://localhost:5173`.

## Backend Setup

From the repository root:

```bash
copy .env.example .env
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "ooh-ahh-backend"
}
```

## Environment Variables

`.env.example` documents local backend settings:

- `OOH_AHH_ENVIRONMENT`: local environment label.
- `OPENAI_API_KEY`: optional. If missing, the backend still starts and the
  mentor endpoint returns placeholder/fallback responses.
- `OPENAI_MODEL`: optional model name used when `OPENAI_API_KEY` is present.

Never commit real API keys.

## Known Limitations

- Controlled execution is a prototype, not a production sandbox.
- Runtime imports are blocked; static analysis can still detect import syntax.
- Runtime tracing is entry-file focused and does not yet emit function call,
  function return, loop-specific, or condition-specific events.
- Lesson validation is intentionally simple: stdout matching, runtime error
  presence, and basic concept detection.
- AI Mentor responses are single-turn and do not edit learner code.

## V1 Release Candidate Checklist

- Frontend starts with `npm run dev`.
- Backend starts with `uvicorn app.main:app --reload`.
- `/health` returns `{"status":"ok","service":"ooh-ahh-backend"}`.
- Lesson loading, file explorer actions, and Monaco editing work in memory.
- Analyze renders the static graph and supports node inspection.
- Run / Verify renders runtime events, stdout/stderr/errors, validation, and the
  runtime graph.
- Timeline controls step through runtime events.
- Beginner Mode and Engineer Mode show different detail levels.
- AI Mentor returns OpenAI responses when configured and fallback guidance when
  `OPENAI_API_KEY` is missing.
- Known limitations are documented in [V1 Release Notes](docs/release-notes-v1.md).

## Documentation

- [Product Definition](docs/product-definition.md)
- [Architecture](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)
- [Git Workflow](docs/git-workflow.md)
- [Smoke Test](docs/smoke-test.md)
- [Demo Flow](docs/demo-flow.md)
- [V1 Release Notes](docs/release-notes-v1.md)
- [Codex Guidance](AGENTS.md)
- [Learning Philosophy](SKILLS.md)
