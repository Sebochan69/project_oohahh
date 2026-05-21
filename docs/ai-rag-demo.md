# AI/RAG Demo

This demo shows the current AI/RAG static visualization track. It teaches the
shape of retrieval-augmented generation using lesson-defined mock data only.

The demo does not:

- call embedding APIs
- use a vector database
- retrieve live documents
- call an LLM as part of the RAG pipeline visualization
- add backend RAG APIs or tracing

Recommended lesson:

- `lessons/ai-rag/rag-pipeline-overview.lesson.json`

## Demo Steps

1. Start the backend and frontend as described in `docs/demo-flow.md`.

   Expected outcome: the PROJECT OOH-AHH workspace opens locally.

2. In the lesson selector, choose **RAG Pipeline Overview** and press Load.

   Expected outcome: the lesson panel shows the query, document count, and
   pipeline node count.

3. Inspect the visualization panel.

   Expected outcome: the RAG graph renders the static flow:
   `query -> documents -> chunks -> embeddings -> retrieval -> context ->
   LLM response -> citations`, plus a hallucination risk node.

4. Review the validation panel.

   Expected outcome: the panel explains citation coverage, retrieval strength,
   chunk coverage, unsupported answer risk, and hallucination risk points from
   lesson metadata.

5. Point out the risk overlay.

   Expected outcome: the hallucination risk node is visually distinct, and weak
   grounding paths are highlighted without implying a real RAG run occurred.

6. Toggle Beginner Mode.

   Expected outcome: node text explains the pipeline in plain language, such as
   "The system picks the source chunk that best matches the question."

7. Toggle Engineer Mode.

   Expected outcome: nodes and the inspector show deeper metadata such as chunk
   ids, retrieval score placeholders, context chunk ids, expected response, and
   citation/source mappings.

## Presenter Notes

- Say "this is static lesson data" before discussing embeddings or retrieval.
- Use the chunker node to explain why long documents are split before search.
- Use the retriever and context builder nodes to show how source material gets
  selected before the answer step.
- Use the citation node to show why grounded answers need source links.
- Use the risk node to explain hallucination risk as unsupported or weakly
  supported claims, not as proof that a live model failed.

## Troubleshooting

- If the RAG graph does not appear, confirm the loaded lesson has
  `lesson_type: ai_rag_pipeline`.
- If validation appears risky, that is expected for this demo: the lesson
  intentionally includes hallucination risk metadata so the overlay is visible.
- Analyze and Run / Verify remain Python-focused in this prototype.
- The AI Mentor panel is unchanged by this track. It may call OpenAI for a
  mentor response if configured, but it does not perform RAG.
