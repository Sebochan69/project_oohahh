# V2 Backend Track

This document plans a future V2 learning track for backend fundamentals in
PROJECT OOH-AHH. It is planning only. It does not implement FastAPI
visualization, backend execution changes, or new frontend features.

## Track Goal

The V2 backend track should help learners understand how an HTTP request moves
through a small FastAPI-style backend:

```text
Client -> Route -> Validation -> Service -> Repository -> Mock DB -> Response
```

When something fails, learners should see where the request path changes:

```text
Client -> Route -> Validation/Error -> Response
```

## Concepts

1. **What is an HTTP request?**
   Introduce method, path, headers, query params, body, and response status.

2. **FastAPI route basics**
   Show how a route function receives a request and returns a response.

3. **Request body and query params**
   Compare URL-level input with JSON body input.

4. **Pydantic validation**
   Show how input is parsed, typed, accepted, or rejected before business logic.

5. **Service layer**
   Introduce application logic as a separate step from route handling.

6. **Repository layer**
   Explain data-access boundaries without requiring a real database.

7. **Mock database interaction**
   Use deterministic in-memory/mock DB examples for create/read/update flows.

8. **Response generation**
   Show how return values become JSON responses with status codes.

9. **Error handling**
   Visualize validation errors, not found errors, and service/repository errors.

10. **Full request lifecycle visualization**
    Combine all concepts into a request path learners can replay step by step.

## Visual Node Mapping

- `client node`: browser, API client, or test caller that starts the request.
- `route node`: FastAPI route function selected by method and path.
- `validation node`: Pydantic model parsing request body/query params.
- `service node`: business rule or orchestration function.
- `repository node`: data access interface or adapter.
- `database/mock DB node`: deterministic mock storage interaction.
- `response node`: final status code and JSON payload.
- `error node`: validation, not found, conflict, or unexpected error branch.

Each node should preserve:

- request id or trace id
- method and path when relevant
- input payload snapshot when safe
- output payload snapshot when safe
- status or validation state
- source file and line number when available

## Lesson Schema Metadata

Future backend lessons can use optional lesson schema fields to describe the
request lifecycle without requiring execution support yet:

- `lesson_type: backend_lifecycle`
- `request_method`
- `request_path`
- `request_body`
- `query_params`
- `expected_response`
- `expected_status_code`
- `lifecycle_nodes`

The first planning/reference lesson is
`lessons/backend-lifecycle/fastapi-hello-route.lesson.json`.

## Beginner Mode Style

Beginner Mode should explain the request as a story:

- "The client asks for something."
- "The route decides which code should handle it."
- "Validation checks whether the input shape is allowed."
- "The service applies the app rule."
- "The repository talks to stored data."
- "The response is what the client gets back."

Keep language concrete, avoid framework jargon until the learner has seen the
node behavior, and emphasize cause and effect.

## Engineer Mode Style

Engineer Mode should expose implementation details:

- HTTP method, path, query params, headers, and body
- route function name, module, and line number
- Pydantic model name, field results, and validation errors
- service function call and return value
- repository method and mock DB operation
- response status code, payload, and error type
- trace/event ids linking request lifecycle steps

Engineer Mode can use terms like dependency boundary, data access layer,
serialization, validation error, and exception handler.

## Possible Lesson List

1. **Send Your First Request**
   Trace a `GET /health`-style request and response.

2. **Add a Simple Route**
   Map a path to a route function and return JSON.

3. **Read Query Params**
   Accept a query param and show how it affects the response.

4. **Validate a Request Body**
   Use a Pydantic model to accept valid JSON and reject invalid JSON.

5. **Move Logic Into a Service**
   Refactor route logic into a service function and visualize the handoff.

6. **Read From a Repository**
   Route -> service -> repository -> mock DB -> response.

7. **Create a Mock Record**
   Accept a body, validate it, store it in mock DB, and return created data.

8. **Handle Not Found**
   Show an error branch from repository/service to response.

9. **Handle Validation Errors**
   Show request rejection before service logic runs.

10. **Full Request Lifecycle**
    Replay a complete successful request and a complete error request.

## Non-Goals For V2 Backend Track

- Production FastAPI deployment
- Docker or Kubernetes
- Real database setup or migrations
- Authentication and authorization
- Background jobs
- WebSockets
- RAG, vector databases, or LLM app architecture
- Full observability stack
- Production debugging
- Arbitrary external API calls

## Risks And Complexity Notes

- Backend visualization can become abstract quickly. Lessons should stay tied
  to tiny concrete request/response examples.
- Real databases add setup friction and nondeterminism. V2 should use mock or
  in-memory storage first.
- Pydantic errors are detailed; Beginner Mode needs a simplified explanation.
- Service/repository boundaries can feel artificial in small apps. Lessons
  should explain the purpose without implying every small route needs every
  layer.
- Request body snapshots must avoid teaching learners to expose secrets.
- Error visualization should separate expected learning errors from system
  failures.
- The V1 runtime tracer is Python-code focused; backend request lifecycle
  tracing may need a separate event model or carefully extended trace events.

## Documentation Boundary

This plan defines a future track shape only. Implementation should happen in
separate tickets for schemas, backend trace contracts, frontend graph rendering,
lesson content, and validation behavior.
