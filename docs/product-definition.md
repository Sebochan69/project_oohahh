# Product Definition

PROJECT OOH-AHH is a visual runtime learning platform that helps learners
understand software fundamentals through code, execution visualization, payload
inspection, replay, validation feedback, and AI mentorship.

## Target Learners

- Beginners learning Python fundamentals
- Early engineers strengthening runtime reasoning
- Instructors or mentors who want execution-aware explanations

## Core Problem

Many learners can read syntax but cannot yet predict runtime behavior. They may
struggle to understand where data moves, why branches execute, how loops evolve,
or what functions return. OOH-AHH addresses this by turning execution into
inspectable learning artifacts.

## V1 Product Promise

Learners can write Python fundamentals code, run or analyze it in a constrained
learning environment, inspect execution flow visually, replay runtime events,
and receive feedback that explains both what happened and what misconception may
be present.

## Core V1 Capabilities

- Python fundamentals exercises
- Variables, conditions, loops, functions
- Lists and dictionaries
- In-memory multi-file workspace
- Static import detection
- Static analysis
- Runtime trace events
- React Flow visualization
- Node-level correctness feedback
- Beginner mode and engineer mode
- AI mentor hints, explanations, and local misconception detection

## V1 Non-Goals

- Docker execution
- Kubernetes
- Arbitrary pip installs
- Production debugging
- Collaborative editing
- Full terminal emulation
- Multi-language support
- Runtime imports and arbitrary external packages
- Production-grade sandboxing

## Success Criteria

V1 succeeds when learners can:

- Predict and inspect how code executes
- Connect source lines to runtime events
- Understand data movement across variables and structures
- Replay execution flow without relying on a terminal mental model
- Receive feedback that improves understanding, not just correctness
