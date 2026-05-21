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
  `backend_lifecycle` or `ai_rag_pipeline`. Existing V1 Python lessons may omit
  this field.
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
- `lifecycle_nodes`: static visualization nodes for `client`, `route`,
  `validation`, `service`, `repository`, `database`, `response`, or `error`.
- `beginner_explanation`: optional learner-friendly text for a lifecycle node.
- `engineer_explanation`: optional technical text for a lifecycle node.

These fields are optional and are not used by the V1 Python runtime validator.
They drive the current backend lifecycle prototype, which renders mock
lesson-defined request flow without executing FastAPI code or sending HTTP
requests.

## Optional AI/RAG Pipeline Fields

AI/RAG lessons may include planning metadata for future mock pipeline
visualization:

- `user_query`: learner question or prompt input.
- `documents`: source documents with id, title, path, type, and content.
- `chunks`: chunk metadata derived from documents.
- `embedding_model`: descriptive embedding model metadata. No embedding call is
  made by the current app.
- `vector_store`: descriptive vector store/index metadata. No vector database
  dependency is used by the current app.
- `retrieved_context`: mock retrieved chunks, scores, and previews.
- `expected_response`: expected grounded answer shape.
- `citation_sources`: links between answer claims and source chunks.
- `hallucination_risk_points`: visible risk markers for weak or unsupported
  responses.
- `pipeline_nodes`: future graph nodes such as `user_query`, `document`,
  `chunker`, `embedding_model`, `vector_store`, `retriever`,
  `context_builder`, `llm`, `response`, `citation_source`, and
  `hallucination_risk`.

These fields are optional and are not used by the current frontend lesson
selector, runtime runner, OpenAI mentor endpoint, or any RAG execution path.
They exist as schema groundwork and planning/reference lesson data only.

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
- `backend-lifecycle/fastapi-hello-route.lesson.json`: static FastAPI request
  lifecycle demo lesson loaded by the current frontend lesson selector.
- `ai-rag/rag-pipeline-overview.lesson.json`: planning/reference sample for a
  future RAG pipeline lesson. It is not wired into the current frontend lesson
  selector.

## Boundaries

This folder defines lesson data only. Frontend code consumes this data for
lesson selection, editor injection, reset behavior, stdout validation, required
concept checks, and mentor context.

Validation remains intentionally lightweight in V1. Lesson `validation` metadata
is a placeholder for future richer rule engines; current validation uses
expected stdout, runtime error presence, and simple required concept detection.
