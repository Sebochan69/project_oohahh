# ROADMAP.md

## Ticket 0: Project Foundation & Governance

Status: In progress

Scope:

- Create root documentation and governance files
- Define V1 boundaries
- Document architecture philosophy
- Document learning philosophy
- Define Git workflow expectations

Out of scope:

- Frontend scaffolding
- Backend scaffolding
- Runtime execution code
- Package installation
- CI/CD configuration

## V1 Roadmap

### Phase 1: Learning Runtime Definition

- Define lesson and exercise data shapes
- Define static analysis output shape
- Define runtime trace event schema
- Define validation overlay model

### Phase 2: Python Fundamentals Runtime

- Support variables, conditions, loops, and functions
- Support lists and dictionaries
- Support constrained multi-file imports
- Emit structured runtime trace events

### Phase 3: Visualization Experience

- Convert analysis and trace events into graph nodes and edges
- Render execution flow with React Flow
- Support replay of runtime events
- Provide beginner and engineer mode views

### Phase 4: Validation and Feedback

- Attach correctness feedback to graph nodes and source locations
- Compare expected behavior with actual trace events
- Identify common misconceptions

### Phase 5: AI Mentor

- Generate hints grounded in source, trace, and validation context
- Provide explanations at beginner and engineer levels
- Detect likely misconceptions and suggest next steps

## Later, Not V1

- Docker execution
- Kubernetes concepts
- Arbitrary package installation
- Collaborative editing
- Full terminal emulation
- Production debugging
- Additional programming languages
