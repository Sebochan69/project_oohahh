# Git Workflow

This project uses small, ticket-scoped changes. Each ticket should be easy to
review, test, and explain.

## Branching

Use descriptive ticket branches:

```text
ticket-0-foundation-governance
ticket-1-runtime-schema
ticket-2-static-analysis
```

## Commit Style

Prefer concise, imperative commit messages:

```text
docs: add project foundation
runtime: define trace event schema
visualization: add graph mapping model
```

## Pull Request Expectations

Each pull request should include:

- Ticket goal
- Summary of changes
- V1 boundary notes when relevant
- Verification performed
- Known follow-up work

## Ticket 0 Rule

Ticket 0 is documentation-only. Do not include frontend, backend, package,
runtime, CI, Docker, or infrastructure scaffolding in the same change.

## Review Priorities

Reviewers should check:

- Scope matches the ticket
- V1 boundaries remain clear
- Documentation does not promise non-goal features
- Architecture language preserves the staged pipeline:

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```
