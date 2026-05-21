# Lessons

Lesson metadata, starter files, objectives, expected outputs, and validation
metadata live here.

## Schema

Lessons should follow `../shared/schemas/lesson.schema.json`.

Each lesson includes:

- `id`: stable lesson identifier.
- `title`: learner-facing lesson name.
- `description`: concise task summary.
- `lesson_type`: optional lesson family, currently `python_foundation` or
  `backend_lifecycle`. Existing V1 Python lessons may omit this field.
- `difficulty`: `beginner`, `intermediate`, or `advanced`.
- `topic`: course or concept area.
- `mode_support`: supported learner modes, such as `beginner` and `engineer`.
- `starter_files`: in-memory files with `path` and `content`.
- `learning_objectives`: what the learner should practice.
- `expected_output`: expected stdout, stderr, and optional exit code.
- `required_concepts`: concepts the lesson expects or introduces.
- `validation`: placeholder metadata for future validation rules.
- `hints`: simple learner-facing hints.

The frontend currently loads lessons locally from JSON imports, injects starter
files into the in-memory workspace, and can reset the active lesson back to its
starter state.

## Optional Backend Lifecycle Fields

Backend lifecycle lessons may include extra planning metadata:

- `request_method`: HTTP method, such as `GET` or `POST`.
- `request_path`: route path, such as `/hello`.
- `request_body`: sample JSON request body.
- `query_params`: sample query parameter values.
- `expected_response`: expected JSON response payload.
- `expected_status_code`: expected HTTP status code.
- `lifecycle_nodes`: visualization nodes for `client`, `route`,
  `validation`, `service`, `repository`, `database`, `response`, or `error`.
- `beginner_explanation`: optional learner-friendly text for a lifecycle node.
- `engineer_explanation`: optional technical text for a lifecycle node.

These fields are optional and are not used by the V1 Python runtime validator.
They exist so backend lifecycle lessons can describe request flow without
executing FastAPI code or sending real HTTP requests.

## Current Lessons

- `python-foundations/print-welcome-message.lesson.json`: print a welcome
  message.
- `python-foundations/variable-assignment.lesson.json`: store a string in a
  variable and print it.
- `python-foundations/update-a-variable.lesson.json`: update a numeric variable
  before printing it.
- `python-foundations/for-loop-basics.lesson.json`: iterate over a list with a
  `for` loop.
- `python-foundations/if-statement-basics.lesson.json`: use a simple
  conditional branch.
- `python-foundations/function-return-value.lesson.json`: define and call a
  function that returns a value.
- `python-foundations/list-filtering.lesson.json`: filter list values with a
  loop and condition.
- `python-foundations/dictionary-access.lesson.json`: read a value from a
  dictionary.
- `backend-lifecycle/fastapi-hello-route.lesson.json`: static demo lesson for
  the FastAPI request lifecycle visualization.

## Boundaries

This folder defines lesson data only. Frontend code consumes this data for
lesson selection, editor injection, reset behavior, stdout validation, required
concept checks, and mentor context.

Validation remains intentionally lightweight in V1. Lesson `validation` metadata
is a placeholder for future richer rule engines; current validation uses
expected stdout, runtime error presence, and simple required concept detection.
