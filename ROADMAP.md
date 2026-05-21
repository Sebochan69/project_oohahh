# Roadmap

## V1 Prototype: Current Stabilization Target

V1 establishes the learning loop:

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
- Static backend lifecycle visualization from lesson-defined mock data
- Static AI/RAG pipeline visualization with hallucination risk overlays from
  lesson-defined mock data
- Smoke test and demo flow documentation

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
  [AI/RAG Track](docs/ai-rag-track.md), with implementation kept separate from
  the current prototype

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
