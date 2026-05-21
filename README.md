# PROJECT OOH-AHH

PROJECT OOH-AHH is a visual runtime learning platform for software fundamentals.
Learners write code, visualize execution flow, inspect payload and data movement,
replay runtime events, and receive AI-guided hints and misconception feedback.

## V1 Scope

V1 focuses on Python fundamentals:

- Variables
- Conditions
- Loops
- Functions
- Lists and dictionaries
- Multi-file imports
- Static analysis
- Runtime trace events
- React Flow visualization
- Node-level correctness feedback
- Beginner mode and engineer mode
- AI mentor hints, explanations, and misconception detection

## V1 Non-Goals

The first version intentionally excludes:

- Docker execution
- Kubernetes
- Arbitrary pip installs
- Production debugging
- Collaborative editing
- Full terminal emulation
- Multi-language support

## Architecture Philosophy

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```

OOH-AHH should make invisible runtime behavior visible without hiding the
discipline of reading, reasoning about, and improving code.

## Repository Status

Ticket 1 initializes the monorepo and minimal frontend/backend app shells. It
does not implement tracing, visualization, validation, AI mentor behavior, or
lesson content.

## Monorepo Layout

```text
frontend/   Vite, React, and TypeScript app shell
backend/    FastAPI app shell
shared/     Future shared contracts and schemas
lessons/    Future lesson content
docs/       Product and process documentation
```

## Frontend Setup

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will print the local URL, usually
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

The API will run at `http://127.0.0.1:8000`.

Optional environment setup:

`OPENAI_API_KEY` and `OPENAI_MODEL` are reserved for future AI Mentor
integration. The backend starts and the mentor endpoint returns placeholder
responses when `OPENAI_API_KEY` is not set.

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

## Documentation

- [Product Definition](docs/product-definition.md)
- [Architecture](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)
- [Git Workflow](docs/git-workflow.md)
- [Codex Guidance](AGENTS.md)
- [Learning Philosophy](SKILLS.md)
