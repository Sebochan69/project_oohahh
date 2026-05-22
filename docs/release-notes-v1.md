# Current Release Notes

PROJECT OOH-AHH is a local multi-track prototype release candidate for visual
software learning. The current stable milestone includes Python Foundations,
Backend Lifecycle, and AI/RAG Pipeline tracks.

## Release Scope

Python Foundations demonstrates the full code learning loop:

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```

Backend Lifecycle and AI/RAG Pipeline are static/mock visualization tracks. They
teach architecture flow with lesson-defined data and do not execute real
FastAPI services, send HTTP requests, call embedding APIs, query vector
databases, or run real RAG pipelines.

## Included

- React, TypeScript, and Vite frontend workspace.
- FastAPI backend with `/health`, static analysis, runtime trace, and mentor
  endpoints.
- Monaco editor with in-memory Python files.
- File explorer with create, select, rename, and delete.
- Multi-track lesson selector with Python Foundations, Backend Lifecycle, and
  AI/RAG Pipeline lessons.
- Static AST analysis for files, imports, functions, classes, and syntax errors.
- Controlled Python execution prototype with stdout/stderr/error capture and
  timeout protection.
- Runtime events for execution start/finish, line execution, variable
  create/update, and errors.
- Static graph and runtime graph rendering with React Flow.
- Timeline playback controls.
- Basic validation for expected stdout, required concepts, and runtime errors.
- Correctness states and node badges.
- Static Backend Lifecycle graph from lesson-defined request/response lifecycle
  metadata.
- Static AI/RAG Pipeline graph from lesson-defined retrieval, citation, and
  hallucination-risk metadata.
- Placeholder validation summaries and graph overlays for Backend Lifecycle and
  AI/RAG tracks.
- Beginner Mode and Engineer Mode presentation across all tracks.
- AI Mentor panel with OpenAI-backed responses when configured and fallback
  guidance when `OPENAI_API_KEY` is missing or a request fails.

## Verification Summary

- Frontend production build passes with `npm run build`.
- Backend Python compile check passes with `python -m compileall app`.
- Backend API smoke checks pass for `/health`, static analysis, runtime trace,
  and mentor fallback.
- Fresh backend startup was verified on `127.0.0.1:8013`.
- Fresh Vite startup was verified on `127.0.0.1:5177`.
- The smoke-test documentation covers Python Foundations, Backend Lifecycle,
  AI/RAG Pipeline, Beginner/Engineer mode, validation summaries, and AI Mentor
  fallback behavior.
- README and known limitations describe the current multi-track prototype.

## Known Limitations

- Controlled execution is a learning prototype, not a production sandbox.
- Runtime imports are blocked. Static analysis can detect import syntax, but
  execution rejects imports in V1.
- Runtime tracing currently focuses on the selected entry file.
- Function call/return, loop-specific, and condition-specific trace events are
  schema-defined but not fully emitted yet.
- Lesson validation is simple: stdout matching, runtime error presence, and
  required concept detection.
- Lesson files and learner workspace state are frontend-local and not persisted.
- AI Mentor responses are single-turn and should not be treated as full tutoring
  memory.
- Backend Lifecycle lessons are static/mock visualizations only. They do not
  execute FastAPI apps, send HTTP requests, trace backend processes, or connect
  to databases.
- AI/RAG Pipeline lessons are static/mock visualizations only. They do not call
  embedding APIs, use vector databases, retrieve live documents, or execute a
  real RAG pipeline.
- Large frontend bundle warnings are expected from Monaco and React Flow in the
  current prototype.

## Demo Recommendation

Use the "Print Welcome Message" lesson for the Python Foundations demo path:

- Load the lesson.
- Analyze to show the static graph.
- Run / Verify to show runtime events, stdout, validation, and runtime graph.
- Step through the timeline in Beginner Mode.
- Toggle Engineer Mode for raw event details.
- Ask the AI Mentor to Explain This and Give Hint.

Then load:

- "FastAPI Request Lifecycle" to demo the static Backend Lifecycle graph.
- "RAG Pipeline Overview" to demo the static AI/RAG graph and hallucination-risk
  overlay.
