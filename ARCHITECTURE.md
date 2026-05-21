# Architecture

PROJECT OOH-AHH follows a staged learning-runtime pipeline:

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```

## Implemented V1 Flow

1. **Code**
   Learners edit in-memory Python files in Monaco. The file explorer supports
   create, select, rename, and delete operations without persistence.

2. **Static Analysis**
   The frontend sends all in-memory files plus `entry_file` to
   `POST /api/v1/analyze/static`. The backend uses Python `ast` to report file
   summaries, imports, functions, classes, and syntax errors without executing
   code.

3. **Runtime Trace Events**
   The frontend sends files plus `entry_file` to `POST /api/v1/trace/run`.
   The backend executes the entry file in a restricted prototype runner with a
   timeout, captures stdout/stderr/errors, blocks imports, and emits structured
   runtime events.

4. **Visualization Graph**
   Frontend utilities convert static analysis results and runtime trace events
   into graph-ready nodes and edges. React Flow renders static and runtime graph
   views.

5. **Validation Overlay**
   Lesson validation compares stdout, required concepts, and runtime error
   presence. Graph nodes carry correctness states such as `not_evaluated`,
   `running`, `correct`, `partially_correct`, and `incorrect`.

6. **AI Mentor Feedback**
   The frontend sends selected event/node context, lesson context, validation
   summary, learner mode, and detected misconceptions to
   `POST /api/v1/mentor/respond`. The backend uses OpenAI when configured and
   falls back safely when no API key is present or a request fails.

## Backend Lifecycle Prototype

Backend lifecycle lessons use `lesson_type: backend_lifecycle` and
lesson-defined metadata to render a static request lifecycle graph. The graph
can show client, route, validation, service, repository, mock database,
response, and error nodes. The inspector shows request method/path, request
body, query params, expected response payload, expected status code, and
placeholder validation for metadata completeness.

This prototype is intentionally static:

- It does not execute learner FastAPI apps.
- It does not send real HTTP requests.
- It does not trace a real backend process.
- It does not connect to a real database.

Beginner Mode keeps node copy focused on the story of the request. Engineer
Mode exposes deeper lifecycle, payload, status, and source metadata where the
lesson provides it. Future work may add controlled FastAPI execution and request
trace events, but that is outside the current prototype.

## Event Coverage

The shared schema defines V1 event types broadly. The current runtime emitter
produces this subset:

- `execution_started`
- `line_executed`
- `variable_created`
- `variable_updated`
- `error_raised`
- `execution_finished`

Function call/return, loop-specific, and condition-specific events are schema
contracts for future implementation.

## Modes

- Beginner Mode emphasizes plain-language event explanations, current line
  numbers, variable changes, and validation summaries.
- Engineer Mode exposes event id, step, file path, line number, scope, payload,
  validation metadata, and raw details.

## V1 Constraints

- Python only
- No Docker execution
- No arbitrary pip installs or external packages
- Runtime imports are blocked
- Backend lifecycle lessons are static metadata visualizations only
- No full terminal emulation
- No collaborative editing
- No production debugging workflows
- No multi-language runtime abstraction
- Controlled execution is a learning prototype, not a hardened sandbox

## Design Biases

- Structured events over ad hoc logs
- Explicit contracts between stages
- Learner-visible reasoning over hidden automation
- Beginner clarity with engineer-grade terminology available on demand
- Small, testable modules across analysis, tracing, graph building, validation,
  and mentor feedback
