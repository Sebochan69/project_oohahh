# Backend Lifecycle Demo

This demo shows the V2 backend track prototype without executing FastAPI code,
sending HTTP requests, or touching a database. The graph is rendered from lesson
metadata only.

Recommended lesson:

- `lessons/backend-lifecycle/fastapi-hello-route.lesson.json`

## Demo Steps

1. Start the backend and frontend as described in `docs/demo-flow.md`.

   Expected outcome: the OOH-AHH workspace opens locally.

2. In the lesson selector, choose **FastAPI Request Lifecycle** and press Load.

   Expected outcome: the lesson panel shows `POST /messages`, status `200`, and
   the expected JSON response.

3. Look at the visualization panel.

   Expected outcome: the backend lifecycle graph renders these nodes:
   `client -> route -> validation -> service -> repository -> database ->
   response`, with an error branch from validation.

4. Point out the request and response payload placeholders.

   Expected outcome: the inspector shows the request body, query params,
   validated payload, expected response payload, and expected status code.

5. Toggle Beginner Mode.

   Expected outcome: nodes use shorter explanations focused on what each step
   means for a learner.

6. Toggle Engineer Mode.

   Expected outcome: nodes show more technical route, payload, status, and
   metadata details.

7. Show the validation summary.

   Expected outcome: the placeholder validation checks confirm method, path,
   status code, response payload, and required lifecycle nodes from lesson
   metadata.

## Presenter Notes

- This is a static visualization prototype, not a FastAPI executor.
- The mock database node represents a future repository/database lesson path.
- The error node is a placeholder for future validation and exception flows.
- Existing Python lessons still use the Python analysis, runtime trace,
  validation, timeline, graph, and mentor flows.

## Troubleshooting

- If the backend graph does not appear, confirm the loaded lesson has
  `lesson_type: backend_lifecycle`.
- If validation is incomplete, inspect the lesson JSON for `request_method`,
  `request_path`, `expected_status_code`, `expected_response`, and all required
  lifecycle node types.
- Analyze and Run / Verify are still Python-focused in this prototype; the
  backend lifecycle demo does not perform real execution.
