# SKILLS.md

PROJECT OOH-AHH teaches programming as a set of connected skills, not isolated
syntax facts.

## Learning Philosophy

Learners should see what code does, not only whether it passes. OOH-AHH makes
runtime behavior visible so beginners can connect source code, control flow,
data movement, and program output.

The product should support two complementary learning modes:

- Beginner mode: plain-language explanations, small steps, and confidence
  building.
- Engineer mode: precise vocabulary, trace inspection, graph structure, and
  deeper debugging habits.

Mode changes should alter explanation depth, not the underlying facts. Beginner
Mode should be calm and readable; Engineer Mode should expose the technical
details needed to build debugging habits.

## Core Skills V1 Should Develop

- Reading code before running it
- Predicting variable state changes
- Following conditional branches
- Tracing loop iterations
- Understanding function calls and returns
- Inspecting list and dictionary mutations
- Understanding imports across multiple files
- Comparing expected and actual execution flow
- Using visual graphs to reason about program behavior
- Responding to feedback without losing ownership of the solution

Current V1 validation is intentionally simple: expected stdout, runtime error
presence, and required concept detection. It should be framed as learning
feedback, not as proof that a program is semantically complete.

## AI Mentor Principles

The AI mentor should:

- Ask learners to predict before explaining when appropriate.
- Point to specific code, trace events, or graph nodes.
- Detect likely misconceptions, not just wrong answers.
- Offer progressive hints before complete solutions.
- Explain why behavior happened, not only what happened.
- Respect the learner's current mode and vocabulary level.
- Fall back safely when OpenAI is unavailable.
- Avoid auto-editing learner code.

## Feedback Principles

Feedback should be specific, local, and actionable. A learner should understand:

- Which node, line, event, or data value is relevant
- What expectation was violated
- What misconception may have caused the issue
- What next step will improve their understanding
