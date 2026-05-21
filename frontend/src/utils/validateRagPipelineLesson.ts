import type { AiRagPipelineNodeType, Lesson } from '../types/lesson';
import type { LessonValidationStatus, RagValidationCheck, RagValidationResult } from '../types/validation';

const REQUIRED_PIPELINE_NODE_TYPES: AiRagPipelineNodeType[] = [
  'user_query',
  'document',
  'chunker',
  'embedding_model',
  'vector_store',
  'retriever',
  'context_builder',
  'llm',
  'response',
  'citation_source',
  'hallucination_risk',
];

function check(
  id: string,
  label: string,
  passed: boolean,
  beginner_message: string,
  engineer_message: string,
  related_node_type?: AiRagPipelineNodeType,
): RagValidationCheck {
  return {
    id,
    label,
    state: passed ? 'correct' : 'incorrect',
    beginner_message,
    engineer_message,
    related_node_type,
  };
}

function overallStatus(checks: RagValidationCheck[], riskCount: number): LessonValidationStatus {
  if (checks.length === 0) {
    return 'not_evaluated';
  }

  const correctCount = checks.filter((item) => item.state === 'correct').length;

  if (correctCount === checks.length && riskCount === 0) {
    return 'correct';
  }

  return correctCount > 0 ? 'partially_correct' : 'incorrect';
}

function expectedCitationIds(lesson: Lesson) {
  const expectedResponse = lesson.expected_response;

  if (
    expectedResponse &&
    typeof expectedResponse === 'object' &&
    Array.isArray((expectedResponse as { citations?: unknown }).citations)
  ) {
    return (expectedResponse as { citations: unknown[] }).citations.map(String);
  }

  return [];
}

export function validateRagPipelineLesson(lesson: Lesson | null): RagValidationResult {
  if (!lesson || lesson.lesson_type !== 'ai_rag_pipeline') {
    return {
      status: 'not_evaluated',
      beginner_message: 'Load an AI/RAG lesson to inspect grounding and risk signals.',
      engineer_message: 'No ai_rag_pipeline lesson metadata is available for validation.',
      checks: [],
      risk_count: 0,
    };
  }

  const nodeTypes = new Set((lesson.pipeline_nodes ?? []).map((node) => node.type));
  const missingNodeTypes = REQUIRED_PIPELINE_NODE_TYPES.filter((type) => !nodeTypes.has(type));
  const retrievedContext = lesson.retrieved_context ?? [];
  const chunks = lesson.chunks ?? [];
  const citationSources = lesson.citation_sources ?? [];
  const riskPoints = lesson.hallucination_risk_points ?? [];
  const expectedCitations = expectedCitationIds(lesson);
  const citedChunkIds = new Set(citationSources.map((source) => String(source.chunk_id ?? '')));
  const retrievedChunkIds = new Set(retrievedContext.map((item) => String(item.chunk_id ?? '')));
  const missingCitations = expectedCitations.filter((citation) => !citedChunkIds.has(citation));
  const uncitedRetrievedChunks = [...retrievedChunkIds].filter((chunkId) => chunkId && !citedChunkIds.has(chunkId));
  const retrievalScores = retrievedContext
    .map((item) => (typeof item.score === 'number' ? item.score : undefined))
    .filter((score): score is number => score !== undefined);
  const hasWeakScore = retrievalScores.some((score) => score < 0.7);
  const allChunksCovered = chunks.length > 0 && chunks.every((chunk) => retrievedChunkIds.has(String(chunk.id ?? '')));
  const hasUnsupportedAnswer = riskPoints.some((risk) =>
    String(risk.id ?? risk.message ?? '').toLowerCase().includes('unsupported'),
  );

  const checks: RagValidationCheck[] = [
    check(
      'missing-citations',
      'Citation coverage',
      expectedCitations.length > 0 && missingCitations.length === 0,
      missingCitations.length === 0
        ? 'The answer has source links for its expected citations.'
        : 'This answer may be risky because a source citation is missing.',
      missingCitations.length === 0
        ? 'Expected citation ids are represented in citation_sources.'
        : `Missing citation source entries for: ${missingCitations.join(', ') || 'expected response citations'}.`,
      'citation_source',
    ),
    check(
      'weak-retrieval-context',
      'Retrieval strength',
      retrievedContext.length > 0 && !hasWeakScore,
      retrievedContext.length > 0 && !hasWeakScore
        ? 'The retrieved context has enough support for this mock lesson.'
        : 'This answer may be risky because the AI did not retrieve enough supporting information.',
      retrievedContext.length > 0 && !hasWeakScore
        ? 'Retrieved context is present and all numeric scores meet the prototype threshold.'
        : 'The generated response is weakly grounded because retrieved context coverage is insufficient.',
      'retriever',
    ),
    check(
      'hallucination-risk-points',
      'Hallucination risk markers',
      riskPoints.length === 0,
      riskPoints.length === 0
        ? 'No hallucination risk markers are present for this static lesson.'
        : 'A warning is present because the answer could include unsupported claims.',
      riskPoints.length === 0
        ? 'No hallucination_risk_points are defined.'
        : `${riskPoints.length} hallucination risk point(s) are defined in lesson metadata.`,
      'hallucination_risk',
    ),
    check(
      'chunk-coverage',
      'Chunk coverage',
      allChunksCovered,
      allChunksCovered
        ? 'The retrieved context covers the lesson chunk.'
        : 'The retrieved context does not cover every source chunk in this lesson.',
      allChunksCovered
        ? 'Every chunk id is represented in retrieved_context.'
        : `Uncovered chunk count: ${chunks.length - retrievedChunkIds.size}. Uncited retrieved chunks: ${
            uncitedRetrievedChunks.join(', ') || 'none'
          }.`,
      'context_builder',
    ),
    check(
      'unsupported-answer-generation',
      'Unsupported answer generation',
      !hasUnsupportedAnswer,
      hasUnsupportedAnswer
        ? 'The answer may include a claim that is not clearly supported by retrieved sources.'
        : 'The response is linked to the retrieved source in this mock lesson.',
      hasUnsupportedAnswer
        ? 'A lesson risk point flags unsupported answer generation.'
        : 'No unsupported answer risk point was detected in lesson metadata.',
      'response',
    ),
    check(
      'required-pipeline-nodes',
      'Required pipeline nodes',
      missingNodeTypes.length === 0,
      missingNodeTypes.length === 0
        ? 'All major RAG pipeline stages are visible.'
        : 'Some RAG pipeline stages are missing from the graph.',
      missingNodeTypes.length === 0
        ? 'All required pipeline node types are present.'
        : `Missing pipeline node types: ${missingNodeTypes.join(', ')}.`,
    ),
  ];
  const riskCount = riskPoints.length + missingCitations.length + (hasWeakScore ? 1 : 0) + (hasUnsupportedAnswer ? 1 : 0);
  const status = overallStatus(checks, riskCount);

  return {
    status,
    beginner_message:
      status === 'correct'
        ? 'This mock RAG answer is well supported by its lesson sources.'
        : 'This answer may be risky because the AI did not retrieve enough supporting information.',
    engineer_message:
      status === 'correct'
        ? 'RAG metadata shows citation coverage, retrieved context, and required pipeline stages.'
        : 'The generated response is weakly grounded because retrieved context coverage is insufficient.',
    checks,
    risk_count: riskCount,
  };
}
