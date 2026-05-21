# Prompt Library

Prompt files for future AI-powered mentor behavior live here.

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

These files are prompt templates only. They are not wired into an OpenAI client,
do not call an LLM, and do not edit learner code. Future API work should load
these prompts explicitly and keep mentor responses grounded in provided lesson,
runtime, validation, and misconception context.
