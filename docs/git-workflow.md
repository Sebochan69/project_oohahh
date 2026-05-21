# Git Workflow

This project uses small, ticket-scoped changes. Each ticket should be easy to
review, test, and explain.

## Branching

Use descriptive ticket branches with a conventional prefix. Current V1 cleanup
and setup work generally uses `chore/`:

```text
chore/frontend-workspace-layout
chore/runtime-trace-api-skeleton
chore/v1-stabilization-pass
chore/v1-docs-architecture-cleanup
```

Use other prefixes only when they better describe the ticket, such as
`feat/`, `fix/`, or `docs/`.

## Commit Style

Prefer concise, imperative commit messages:

```text
docs: update V1 architecture notes
chore: stabilize workspace derived state
fix: reset timeline when files change
```

## Pull Request Expectations

Each pull request should include:

- Ticket goal
- Summary of changes
- V1 boundary notes when relevant
- Verification performed
- Known follow-up work

## Review Priorities

Reviewers should check:

- Scope matches the ticket
- V1 boundaries remain clear
- Documentation does not promise non-goal features
- Frontend and backend contracts still match
- The staged pipeline remains intact:

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```
