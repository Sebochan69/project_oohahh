# AGENTS.md

This file guides Codex and other AI coding agents working on PROJECT OOH-AHH.

## Current Ticket Boundary

Ticket 0 is documentation-only. Do not create frontend, backend, runtime,
infrastructure, package manager, or build system files yet.

Allowed work for Ticket 0:

- Root governance and documentation files
- Documentation under `docs/`
- Small wording improvements that clarify V1 boundaries

Disallowed work for Ticket 0:

- React, Python, API, database, or runtime implementation files
- Dependency installation or lockfiles
- Generated scaffolds
- CI configuration
- Docker or Kubernetes files

## Project North Star

OOH-AHH helps learners build durable mental models of software execution.
The system should reveal how code becomes runtime behavior through analysis,
trace events, visual graphs, validation feedback, and AI mentorship.

## V1 Boundaries

V1 supports Python fundamentals only:

- Variables, conditions, loops, functions
- Lists and dictionaries
- Multi-file imports within a constrained workspace
- Static analysis and runtime trace events
- React Flow-based visualization
- Node-level correctness feedback
- Beginner mode and engineer mode
- AI mentor hints, explanations, and misconception detection

V1 does not support Docker execution, Kubernetes, arbitrary pip installs,
production debugging, collaborative editing, terminal emulation, or multiple
programming languages.

## Implementation Guidance

When implementation begins in later tickets:

- Prefer explicit, inspectable data models over opaque magic.
- Treat trace events as the contract between execution and visualization.
- Keep beginner-facing concepts simple without making engineer mode inaccurate.
- Separate analysis, execution tracing, graph construction, validation, and AI
  feedback as distinct concerns.
- Make every AI feature explainable and grounded in code, trace events, or
  validation state.
- Preserve learner agency: hints should guide thinking before revealing answers.

## Documentation Standards

- Keep docs concise but specific.
- State assumptions and boundaries clearly.
- Avoid promising features outside the accepted V1 scope.
- Update roadmap and architecture docs when scope changes.
