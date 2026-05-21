# Prompt Library

Prompt files for AI-powered mentor behavior live here.

## Organization

- `mentor/system.md`: baseline mentor identity, safety boundaries, and learning
  philosophy.
- `mentor/explain_this.md`: event-focused explanations for selected runtime or
  graph context.
- `mentor/give_hint.md`: hint generation that nudges without giving complete
  solutions.
- `mentor/misconception.md`: misconception-aware guidance grounded in detected
  validation/runtime patterns.

## Boundaries

These files are prompt templates. The backend mentor service loads them when
`OPENAI_API_KEY` is configured and falls back to placeholder mentor responses
when the key is missing or a request fails.

Mentor responses must stay grounded in provided lesson, runtime, validation,
and misconception context. The mentor should not edit learner code or provide a
full completed lesson solution.
