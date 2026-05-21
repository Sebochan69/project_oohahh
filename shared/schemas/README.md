# Shared Schemas

This folder contains shared JSON Schema contracts for PROJECT OOH-AHH.

Ticket 2 defines schema contracts only. It does not implement the runtime
tracer, React Flow rendering, validation engine, AI mentor integration, or
lesson content.

## Files

- `trace-event.schema.json`: shared trace event contract for runtime execution,
  visualization, timeline replay, validation overlays, and AI mentor context.
- `validation.schema.json`: validation state and feedback contract that can be
  attached to trace events or future graph/timeline artifacts.

## V1 Trace Event Types

- `execution_started`: a trace session or program execution began.
- `execution_finished`: execution completed successfully or reached a terminal
  state.
- `line_executed`: a source line was executed.
- `variable_created`: a variable was introduced in a scope.
- `variable_updated`: a variable value changed.
- `function_called`: a function call began.
- `function_returned`: a function returned a value or completed.
- `loop_started`: a loop construct began evaluation.
- `loop_iteration`: a loop advanced through an iteration.
- `condition_evaluated`: a conditional expression was evaluated.
- `error_raised`: an error or exception occurred.

## Trace Event Shape

Every V1 trace event supports:

- `id`: stable event id within a trace session.
- `type`: one of the V1 trace event types.
- `timestamp`: ISO 8601 event timestamp.
- `step`: monotonic timeline order.
- `file_path`: project-relative source file path.
- `line_number`: one-based source line number, or `null` for session-level
  events.
- `scope`: module, function, loop, conditional, or related runtime scope.
- `payload`: event-specific serializable data.
- `visual`: optional renderer-neutral graph and timeline hints.
- `validation`: optional validation state and feedback.

## Validation States

Validation states are:

- `not_evaluated`: no correctness decision has been made.
- `running`: validation is in progress.
- `correct`: observed behavior matches the expectation.
- `partially_correct`: some expectations match, but important gaps remain.
- `incorrect`: observed behavior conflicts with the expectation.
- `inherited_error`: this item is affected by an upstream error.

## How Systems Use These Schemas

The backend will emit trace events from future static analysis and runtime
tracing work. It should keep event payloads serializable, stable, and grounded
in source code or runtime facts.

The frontend will consume trace events to build timeline replay and future graph
views. The `visual` field provides optional hints, but the schema does not bind
the product to a specific renderer or React Flow node shape.

The validation layer will attach correctness state and feedback to trace events,
future graph nodes, or lesson expectations. Validation should point to concrete
events and avoid opaque pass/fail messages.

The AI mentor will use code, trace events, validation results, and learner mode
to produce grounded hints, explanations, and misconception feedback. AI output
should cite or refer to concrete trace facts whenever possible.

## Design Notes

- These schemas are generic enough for Python V1 and future backend,
  architecture, and AI explanation views.
- Trace events are not the runtime tracer implementation.
- Validation schemas are not lesson rules.
- Visualization hints are not a graph rendering implementation.
