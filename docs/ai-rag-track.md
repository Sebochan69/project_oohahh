# AI/RAG Track

This document plans a future PROJECT OOH-AHH learning track for AI and
retrieval-augmented generation. It is planning only. It does not implement RAG
visualization, embedding calls, vector databases, retrieval, or new frontend
features.

## Track Goal

The AI/RAG track should help learners understand how a grounded AI answer is
assembled from user input and retrieved source material:

```text
Prompt -> Documents -> Chunks -> Embeddings -> Vector Store -> Retrieval -> Context -> LLM -> Response -> Citations
```

The track should make risk points visible, especially where hallucinations can
enter the flow:

```text
Weak query -> Bad chunks -> Poor retrieval -> Missing context -> Unsupported response
```

## Concepts

1. **Prompt input**
   Show how the learner's question enters the system and shapes downstream
   retrieval and response behavior.

2. **Document loading**
   Introduce source documents as explicit inputs, including titles, paths, and
   content boundaries.

3. **Chunking**
   Explain why long documents are split and how chunk size or overlap can affect
   what gets retrieved.

4. **Embedding generation**
   Show embeddings as numeric representations used for similarity search, not
   as human-readable summaries.

5. **Vector store indexing**
   Show how chunks and metadata are stored so they can be searched later.

6. **Query embedding**
   Show that the user query is embedded into the same vector space as document
   chunks.

7. **Retrieval**
   Explain how the system chooses candidate chunks based on similarity and
   filters.

8. **Context assembly**
   Show retrieved chunks being packaged into a prompt context with instructions
   and source metadata.

9. **LLM response generation**
   Show that the model generates an answer from the prompt, retrieved context,
   and system constraints.

10. **Citation/source grounding**
    Connect answer claims back to retrieved chunks and visible source metadata.

11. **Hallucination risk points**
    Highlight where unsupported answers can appear: missing documents, poor
    chunking, weak retrieval, stale context, ambiguous prompts, or ignored
    citations.

## Visual Node Mapping

- `user query node`: the learner's prompt or question.
- `document node`: a loaded source document with title, path, and content type.
- `chunker node`: the split step that creates retrievable text chunks.
- `embedding model node`: turns text into vectors for similarity search.
- `vector store node`: indexed chunks plus metadata.
- `retriever node`: selects candidate chunks for the query.
- `context builder node`: assembles instructions, query, and retrieved chunks.
- `LLM node`: generates the answer from assembled context.
- `response node`: final answer shown to the user.
- `citation/source node`: source references tied to response claims.
- `warning/risk node`: visible risk marker for unsupported or weakly grounded
  behavior.

Each node should preserve:

- stable node id
- stage type
- input/output payload summary
- source ids or chunk ids when relevant
- validation or risk state
- beginner explanation
- engineer metadata

## Beginner Mode Style

Beginner Mode should explain RAG as a research workflow:

- "The user asks a question."
- "The system looks through trusted documents."
- "Documents are split into smaller pieces."
- "The closest pieces are brought into the answer."
- "The model writes an answer using those pieces."
- "Citations show where the answer came from."

Keep language concrete. Avoid introducing embeddings as math too early. Say
"meaning fingerprint" or "search-friendly number pattern" before moving into
vector terminology.

Beginner Mode should make risk visible without fear:

- "The answer may be weak if the right document was not retrieved."
- "A citation helps you check whether the answer is supported."
- "If the source does not say it, the model should not claim it."

## Engineer Mode Style

Engineer Mode should expose implementation details:

- prompt text and role/instruction boundaries
- document id, path, title, content type, and loader metadata
- chunk id, byte/character range, token estimate, and overlap
- embedding model name and vector dimension placeholder
- vector store collection/index name
- query embedding metadata
- retrieval `top_k`, score, filters, and selected chunk ids
- assembled context order and token budget
- model name, response metadata, and grounding constraints
- citation span/source mapping
- risk labels for missing, low-score, stale, or uncited context

Engineer Mode should distinguish between observed values and placeholders. It
should never imply an embedding or model call happened when the lesson is using
mock data.

## Node Payload Examples

User query:

```json
{
  "query": "What does OOH-AHH teach about runtime traces?",
  "mode": "beginner"
}
```

Document:

```json
{
  "document_id": "doc-architecture",
  "title": "Architecture",
  "path": "ARCHITECTURE.md",
  "content_type": "markdown"
}
```

Chunk:

```json
{
  "chunk_id": "doc-architecture:chunk-03",
  "document_id": "doc-architecture",
  "text_preview": "Runtime trace events capture line execution...",
  "token_estimate": 86,
  "overlap_previous": 20
}
```

Embedding:

```json
{
  "model": "placeholder-embedding-model",
  "dimension": 1536,
  "input_id": "doc-architecture:chunk-03",
  "vector_preview": [0.012, -0.044, 0.108]
}
```

Retrieval:

```json
{
  "top_k": 3,
  "matches": [
    {
      "chunk_id": "doc-architecture:chunk-03",
      "score": 0.84
    }
  ]
}
```

Context builder:

```json
{
  "context_chunk_ids": ["doc-architecture:chunk-03"],
  "token_budget": 1200,
  "grounding_rule": "Answer only from retrieved sources."
}
```

Response and citation:

```json
{
  "answer": "OOH-AHH uses runtime trace events to make execution visible.",
  "citations": [
    {
      "chunk_id": "doc-architecture:chunk-03",
      "claim": "runtime trace events make execution visible"
    }
  ]
}
```

Warning/risk:

```json
{
  "risk_type": "unsupported_claim",
  "severity": "medium",
  "message": "The response includes a claim that is not tied to a retrieved chunk."
}
```

## Validation Ideas

Early validation should stay simple and explainable:

- Required stages are present in the graph.
- Every response claim has at least one citation/source link.
- Retrieved chunks include the expected source document.
- Retrieval scores are above a lesson-defined threshold.
- Context assembly does not exceed a lesson-defined token budget.
- Warning nodes appear when retrieval returns no useful chunks.
- Beginner Mode feedback explains the missing support in plain language.
- Engineer Mode feedback shows chunk ids, scores, and missing citation links.

Validation should not grade "answer quality" broadly until there is a concrete
lesson rubric. Prefer checking visible structure, source grounding, and whether
the response stays within supplied context.

## Possible Lesson List

1. **Ask A Grounded Question**
   Show a user query flowing into a simple answer with one source.

2. **Load A Source Document**
   Identify document metadata and explain why sources matter.

3. **Split A Document Into Chunks**
   Compare too-large, too-small, and reasonable chunks.

4. **Create Embeddings**
   Explain embeddings as search representations using mock vector payloads.

5. **Index Chunks In A Vector Store**
   Show chunk ids and metadata being stored for future retrieval.

6. **Embed The Query**
   Compare document embeddings with query embeddings.

7. **Retrieve Relevant Chunks**
   Select top matches and inspect scores.

8. **Build Context For The LLM**
   Assemble instructions, query, and retrieved chunks under a token budget.

9. **Generate A Grounded Answer**
   Show how the response depends on retrieved context.

10. **Add Citations**
    Link answer claims to source chunks.

11. **Find Hallucination Risks**
    Detect unsupported claims, missing sources, and low-quality retrieval.

12. **Full RAG Lifecycle**
    Replay query to citation with warning nodes for risk points.

## Non-Goals

- Real embedding generation in the planning phase
- OpenAI embedding calls
- Vector database dependencies
- RAG visualization implementation
- Production RAG architecture
- Autonomous web crawling
- Private document ingestion
- Multi-user knowledge bases
- Fine-tuning
- Agentic tool use
- Full prompt evaluation platform
- Legal, medical, or financial answer certification

## Risks And Complexity Notes

- RAG can look magical if embeddings and retrieval are hidden. The track should
  show intermediate artifacts, even when they are simplified.
- Embeddings are hard to explain visually. Beginner Mode should focus on
  similarity search before exposing vector dimensions.
- Chunking choices can dominate retrieval quality. Lessons should make chunk
  boundaries visible.
- Citation UI can imply stronger confidence than the source supports. Validation
  should distinguish "has a citation" from "the citation supports the claim."
- Retrieval scores are model- and store-dependent. Treat thresholds as lesson
  scaffolding, not universal truth.
- Token budgets and context ordering can be confusing. Engineer Mode should show
  enough metadata to explain why something was omitted.
- Hallucination warnings should teach grounded skepticism without implying all
  model output is wrong.
- Any future real document ingestion must consider privacy, secrets, and source
  permissions.

## Current Boundary

This document is a track plan only. Implementation should happen in separate
tickets for schemas, lesson data, mock graph rendering, validation, and any
future guarded model or embedding calls.
