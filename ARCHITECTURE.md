# ARCHITECTURE.md

PROJECT OOH-AHH follows a staged learning-runtime pipeline:

```text
Code -> Static Analysis -> Runtime Trace Events -> Visualization Graph -> Validation Overlay -> AI Mentor Feedback
```

## Architectural Stages

### 1. Code

Learners write Python code within a constrained learning workspace. V1 focuses
on fundamentals and multi-file imports, not arbitrary system access or package
installation.

### 2. Static Analysis

Static analysis inspects source code before execution. It should identify
structure such as variables, branches, loops, functions, imports, and possible
beginner misconceptions.

### 3. Runtime Trace Events

Runtime tracing records execution as structured events. Trace events are the
primary contract between the execution layer and all downstream learning views.

Examples of future event categories:

- Variable assignment
- Condition evaluation
- Loop iteration
- Function call and return
- List or dictionary access and mutation
- Import resolution
- Error or exception

### 4. Visualization Graph

Trace and analysis data are transformed into a graph suitable for React Flow.
Graph nodes and edges should represent meaningful execution concepts rather
than raw implementation details.

### 5. Validation Overlay

Validation compares learner code, trace behavior, and lesson expectations.
Feedback should attach to specific nodes, edges, events, or source locations.

### 6. AI Mentor Feedback

The AI mentor uses available code, analysis, trace, graph, and validation
context to provide hints, explanations, and misconception feedback.

## V1 Constraints

- Python only
- No Docker execution
- No arbitrary pip installs
- No full terminal emulation
- No collaborative editing
- No production debugging workflows
- No multi-language runtime abstraction

## Design Biases

- Structured events over ad hoc text logs
- Explicit contracts between stages
- Learner-visible reasoning over hidden automation
- Beginner clarity with engineer-grade correctness
- Small, testable modules when implementation begins
