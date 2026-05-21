# AGENTS.md

This file guides Codex and other AI coding agents working on PROJECT OOH-AHH.

## Project North Star

OOH-AHH helps learners build durable mental models of software execution. The
system should reveal how code becomes runtime behavior through static analysis,
runtime trace events, visual graphs, validation feedback, and AI mentorship.

## Current V1 Boundary

The V1 prototype includes a React/FastAPI learning loop for Python
fundamentals. Keep changes small, ticket-scoped, and aligned with:

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```

V1 supports:

- In-memory Python files and Monaco editing
- Static AST analysis
- Controlled entry-file execution with runtime trace events
- React Flow static/runtime visualization
- Timeline playback
- Lesson loading and basic validation
- Beginner Mode and Engineer Mode
- AI Mentor responses through OpenAI when configured, with safe fallback

V1 does not support Docker execution, Kubernetes, arbitrary pip installs,
network access from learner code, production debugging, collaborative editing,
terminal emulation, or multiple programming languages.

## Agent Rules

- Respect the active ticket boundary.
- Do not add major features during cleanup or stabilization tickets.
- Do not claim unsupported runtime behavior in docs.
- Treat trace events and shared schemas as contracts.
- Keep learner safety and agency central: hints guide thinking and should not
  auto-write full solutions.
- Keep OpenAI usage optional and fallback-safe. Never commit secrets.
- Prefer small, reviewable changes over broad rewrites.

## Documentation Standards

- Keep docs concise but specific.
- Distinguish implemented behavior from planned behavior.
- Update architecture, roadmap, and smoke/demo docs when flows change.
- Preserve V1 non-goals and known limitations.
