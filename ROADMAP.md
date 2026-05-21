# Roadmap

## Current Multi-Track Prototype

The current prototype is a multi-track learning platform with clear boundaries:

- **Python Foundations** is the implemented code execution track.
- **Backend Lifecycle** is a static/mock request lifecycle visualization track.
- **AI/RAG Pipeline** is a static/mock retrieval pipeline visualization track.

## Implemented Now

Python Foundations includes:

- In-memory Python workspace
- Monaco editor
- Python foundations lesson library
- Static AST analysis API
- Controlled runtime trace API
- Static and runtime React Flow graphs
- Timeline playback
- Basic stdout and required-concept validation
- Correctness state overlays
- Beginner/Engineer mode presentation
- AI Mentor API and frontend panel with OpenAI/fallback behavior

Backend Lifecycle includes:

- Lesson-defined request method, path, body, response, status, and lifecycle
  nodes
- Static React Flow visualization for client, route, validation, service,
  repository, mock DB, response, and error concepts
- Placeholder validation for lifecycle metadata completeness
- Beginner/Engineer mode presentation

AI/RAG Pipeline includes:

- Lesson-defined query, documents, chunks, retrieved context, expected response,
  citations, risk points, and pipeline nodes
- Static React Flow visualization for retrieval and response grounding concepts
- Hallucination/risk overlays from lesson-defined mock data
- Placeholder validation for pipeline completeness, citations, weak retrieval,
  and unsupported-answer risks
- Beginner/Engineer mode presentation

Shared platform work includes smoke test and demo flow documentation.

## Current Backend Lifecycle Prototype

The backend lifecycle prototype teaches how a request moves through
`client -> route -> validation -> service -> repository -> mock DB -> response`.
It renders React Flow nodes from backend lifecycle lesson metadata and shows
placeholder validation for required metadata and lifecycle nodes.

Current boundaries:

- No real FastAPI app execution
- No real HTTP requests
- No backend request tracing
- No real database behavior
- No AI mentor changes specific to backend lifecycle lessons

## Current AI/RAG Pipeline Prototype

The AI/RAG prototype teaches how a query moves through
`documents -> chunks -> embeddings -> vector store -> retrieval -> context -> LLM -> response -> citations`.
It renders React Flow nodes from AI/RAG lesson metadata and shows static
validation/risk overlays for citation and grounding concepts.

Current boundaries:

- No real embedding generation
- No vector database dependencies
- No real retrieval over documents
- No RAG backend APIs
- No AI mentor changes specific to AI/RAG lessons

## V1 Remaining Hardening

- Improve runtime trace coverage for functions, loops, and conditionals
- Tighten controlled execution boundaries and document remaining risks
- Add focused automated tests around backend APIs and frontend utilities
- Improve graph layout for larger examples
- Expand lesson validation beyond stdout and simple concept detection

## V2 Learning Platform

- Persist learner work and lesson progress
- Add curriculum navigation and lesson sequencing
- Support richer process validation against trace behavior
- Add misconception-specific mentor flows
- Improve prompt evaluation and response quality checks
- Add instructor-friendly review artifacts
- Expand the backend fundamentals track described in
  [V2 Backend Track](docs/v2-backend-track.md)
- Add controlled FastAPI request execution/tracing only after a separate safety
  design and trace contract
- Plan the AI/RAG learning track described in
  [AI/RAG Track](docs/ai-rag-track.md), with real execution kept separate from
  the current static prototype
- Add real RAG execution only after separate safety, privacy, source-grounding,
  and dependency design work

## Future Debug Mode

Future debug mode is separate from V1 learning mode. It may explore:

- More realistic stack frames and call graphs
- Richer import/module tracing
- Debugger-like stepping semantics
- Larger project inspection
- Production-style debugging concepts

Future debug mode is not a production debugger commitment.

## Later, Not V1

- Docker execution
- Kubernetes concepts
- Arbitrary package installation
- Vector database dependencies
- Real embedding generation
- Collaborative editing
- Full terminal emulation
- Production debugging
- Additional programming languages
