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
- Smoke test and demo flow documentation

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
- Plan and build the backend fundamentals track described in
  [V2 Backend Track](docs/v2-backend-track.md)

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
- Collaborative editing
- Full terminal emulation
- Production debugging
- Additional programming languages
