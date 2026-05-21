# Lessons

Lesson metadata, starter files, objectives, expected outputs, and validation
metadata live here.

## Schema

Lessons should follow `../shared/schemas/lesson.schema.json`.

Each lesson includes:

- `id`: stable lesson identifier.
- `title`: learner-facing lesson name.
- `description`: concise task summary.
- `difficulty`: `beginner`, `intermediate`, or `advanced`.
- `topic`: course or concept area.
- `mode_support`: supported learner modes, such as `beginner` and `engineer`.
- `starter_files`: in-memory files with `path` and `content`.
- `learning_objectives`: what the learner should practice.
- `expected_output`: expected stdout, stderr, and optional exit code.
- `required_concepts`: concepts the lesson expects or introduces.
- `validation`: placeholder metadata for future validation rules.
- `hints`: simple learner-facing hints.

## Current Lessons

- `python-foundations/print-welcome-message.lesson.json`: beginner Python task
  for printing `Welcome to OOH-AHH`.

## Boundaries

This folder defines lesson data only. It does not implement lesson navigation,
editor loading, runtime validation, correctness scoring, or AI mentor behavior.
Validation rules are metadata placeholders until a future validation engine
consumes them.
