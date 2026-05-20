# PROJECT OOH-AHH

PROJECT OOH-AHH is a visual runtime learning platform for software fundamentals.
Learners write code, visualize execution flow, inspect payload and data movement,
replay runtime events, and receive AI-guided hints and misconception feedback.

## V1 Scope

V1 focuses on Python fundamentals:

- Variables
- Conditions
- Loops
- Functions
- Lists and dictionaries
- Multi-file imports
- Static analysis
- Runtime trace events
- React Flow visualization
- Node-level correctness feedback
- Beginner mode and engineer mode
- AI mentor hints, explanations, and misconception detection

## V1 Non-Goals

The first version intentionally excludes:

- Docker execution
- Kubernetes
- Arbitrary pip installs
- Production debugging
- Collaborative editing
- Full terminal emulation
- Multi-language support

## Architecture Philosophy

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```

OOH-AHH should make invisible runtime behavior visible without hiding the
discipline of reading, reasoning about, and improving code.

## Repository Status

Ticket 0 establishes project documentation and governance only. No frontend,
backend, runtime, or infrastructure code should be added as part of this ticket.

## Documentation

- [Product Definition](docs/product-definition.md)
- [Architecture](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)
- [Git Workflow](docs/git-workflow.md)
- [Codex Guidance](AGENTS.md)
- [Learning Philosophy](SKILLS.md)
