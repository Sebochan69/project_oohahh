# Backend Lifecycle Demo

This demo shows the current backend lifecycle prototype. It teaches request
flow visually using lesson-defined/mock lifecycle data only.

The demo does not:

- execute a real FastAPI app
- send an HTTP request
- trace a backend process
- read or write a real database

Recommended lesson:

- `lessons/backend-lifecycle/fastapi-hello-route.lesson.json`

## Demo Steps

1. Start the backend and frontend as described in `docs/demo-flow.md`.

   Expected outcome: the PROJECT OOH-AHH workspace opens locally.

2. In the lesson selector, choose **FastAPI Request Lifecycle** and press Load.

   Expected outcome: the lesson panel shows `POST /messages`, status `200`,
   and the expected JSON response.

3. Inspect the visualization panel.

   Expected outcome: OOH-AHH renders a backend lifecycle graph from lesson
   metadata, including client, route, validation, service, repository, mock DB,
   response, and error path nodes when those nodes are defined by the lesson.

4. Review the validation summary.

   Expected outcome: placeholder validation checks the lesson metadata for
   method, path, expected status code, expected response payload, and required
   lifecycle node types.

5. Toggle Beginner Mode.

   Expected outcome: node text emphasizes the simple story of how the request
   moves through the backend.

6. Toggle Engineer Mode.

   Expected outcome: the inspector and nodes show deeper lifecycle metadata,
   including request path, payload placeholders, status code, file path, and
   line number when available.

## Presenter Notes

- Say "this graph is mocked from lesson data" before discussing nodes.
- Use the route node to explain how method and path select backend code.
- Use the validation node to explain where request shape checks belong.
- Use service, repository, and mock DB nodes as conceptual boundaries, not as
  proof that code executed.
- Use the response node to connect backend return values to JSON responses.

## Future Work

Future backend tickets may add controlled FastAPI execution, real request
instrumentation, backend trace events, and richer validation based on observed
request behavior. Those capabilities are not part of the current prototype.
