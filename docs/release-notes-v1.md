# V1 Release Notes

PROJECT OOH-AHH V1 is a local prototype release candidate for visual runtime
learning with Python fundamentals.

## Release Scope

V1 demonstrates the core learning loop:

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```

## Included

- React, TypeScript, and Vite frontend workspace.
- FastAPI backend with `/health`, static analysis, runtime trace, and mentor
  endpoints.
- Monaco editor with in-memory Python files.
- File explorer with create, select, rename, and delete.
- Python foundations lesson library.
- Static AST analysis for files, imports, functions, classes, and syntax errors.
- Controlled Python execution prototype with stdout/stderr/error capture and
  timeout protection.
- Runtime events for execution start/finish, line execution, variable
  create/update, and errors.
- Static graph and runtime graph rendering with React Flow.
- Timeline playback controls.
- Basic validation for expected stdout, required concepts, and runtime errors.
- Correctness states and node badges.
- Beginner Mode and Engineer Mode presentation.
- AI Mentor panel with OpenAI-backed responses when configured and fallback
  guidance when `OPENAI_API_KEY` is missing or a request fails.

## Verification Summary

- Frontend production build passes with `npm run build`.
- Backend Python compile check passes with `python -m compileall app`.
- Backend API smoke checks pass for `/health`, static analysis, runtime trace,
  timeout handling, and mentor fallback.
- Fresh backend startup was verified on `127.0.0.1:8001`.
- Fresh Vite startup was verified on `127.0.0.1:5174`.
- The documented smoke test and demo flow remain aligned with the current app.

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
- Large frontend bundle warnings are expected from Monaco and React Flow in the
  current prototype.

## Demo Recommendation

Use the "Print Welcome Message" lesson for the default demo path:

- Load the lesson.
- Analyze to show the static graph.
- Run / Verify to show runtime events, stdout, validation, and runtime graph.
- Step through the timeline in Beginner Mode.
- Toggle Engineer Mode for raw event details.
- Ask the AI Mentor to Explain This and Give Hint.
