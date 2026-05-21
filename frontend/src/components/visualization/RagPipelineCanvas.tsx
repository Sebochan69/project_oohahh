import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import type { AiRagPipelineNode, AiRagPipelineNodeType, Lesson } from '../../types/lesson';
import {
  VALIDATION_STATE_LABELS,
  type RagValidationResult,
  type ValidationState,
  validationStateClassName,
} from '../../types/validation';
import { validateRagPipelineLesson } from '../../utils/validateRagPipelineLesson';
import { RagPipelineNode, type RagPipelineNodeData } from './nodes/RagPipelineNode';

type RagPipelineCanvasProps = {
  lesson?: Lesson;
};

const nodeTypes: NodeTypes = {
  user_query: RagPipelineNode,
  document: RagPipelineNode,
  chunker: RagPipelineNode,
  embedding_model: RagPipelineNode,
  vector_store: RagPipelineNode,
  retriever: RagPipelineNode,
  context_builder: RagPipelineNode,
  llm: RagPipelineNode,
  response: RagPipelineNode,
  citation_source: RagPipelineNode,
  hallucination_risk: RagPipelineNode,
};

const nodeOrder: AiRagPipelineNodeType[] = [
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

function explanationForType(type: AiRagPipelineNodeType) {
  const beginner: Record<AiRagPipelineNodeType, string> = {
    user_query: 'The learner asks a question.',
    document: 'Trusted source material is available.',
    chunker: 'Documents are split into smaller searchable pieces.',
    embedding_model: 'Text is turned into a search-friendly meaning pattern.',
    vector_store: 'The searchable chunk records are kept together.',
    retriever: 'The system chooses chunks that look relevant.',
    context_builder: 'The question and selected sources are packaged together.',
    llm: 'A future model would answer using the supplied context.',
    response: 'The answer should stay grounded in the selected sources.',
    citation_source: 'Citations show where claims came from.',
    hallucination_risk: 'This marks a place where unsupported claims can appear.',
  };
  const engineer: Record<AiRagPipelineNodeType, string> = {
    user_query: 'Prompt input and user intent entering the retrieval pipeline.',
    document: 'Loaded document metadata and source boundaries.',
    chunker: 'Chunking metadata such as chunk ids and token estimates.',
    embedding_model: 'Embedding model placeholder and vector metadata.',
    vector_store: 'Mock vector collection/index metadata.',
    retriever: 'Retrieval selection with scores and chunk ids.',
    context_builder: 'Assembled prompt context and grounding constraints.',
    llm: 'LLM response generation placeholder using assembled context.',
    response: 'Expected response payload and citation requirements.',
    citation_source: 'Claim-to-source mapping for grounding.',
    hallucination_risk: 'Risk marker for unsupported, weak, or missing grounding.',
  };

  return { beginner: beginner[type], engineer: engineer[type] };
}

function nodePosition(type: AiRagPipelineNodeType, index: number) {
  if (type === 'hallucination_risk') {
    return { x: 1500, y: 300 };
  }

  const orderedIndex = nodeOrder.includes(type) ? nodeOrder.indexOf(type) : index;
  const rowOffset = type === 'document' || type === 'chunker' || type === 'citation_source' ? -70 : 0;

  return {
    x: 40 + Math.min(orderedIndex, 9) * 220,
    y: 140 + rowOffset,
  };
}

function derivedPayload(type: AiRagPipelineNodeType, lesson: Lesson): Record<string, unknown> | undefined {
  const retrievedContext = lesson.retrieved_context ?? [];

  if (type === 'user_query') {
    return { query: lesson.user_query ?? '' };
  }

  if (type === 'document') {
    return { documents: lesson.documents ?? [] };
  }

  if (type === 'chunker') {
    return { chunks: lesson.chunks ?? [] };
  }

  if (type === 'embedding_model') {
    return lesson.embedding_model;
  }

  if (type === 'vector_store') {
    return lesson.vector_store;
  }

  if (type === 'retriever') {
    return { retrieved_context: retrievedContext };
  }

  if (type === 'context_builder') {
    return {
      query: lesson.user_query ?? '',
      context_chunk_ids: retrievedContext.map((item) => item.chunk_id),
    };
  }

  if (type === 'response') {
    return lesson.expected_response && typeof lesson.expected_response === 'object'
      ? (lesson.expected_response as Record<string, unknown>)
      : { response: lesson.expected_response ?? null };
  }

  if (type === 'citation_source') {
    return { citation_sources: lesson.citation_sources ?? [] };
  }

  if (type === 'hallucination_risk') {
    return { hallucination_risk_points: lesson.hallucination_risk_points ?? [] };
  }

  return undefined;
}

function validationStateForNode(
  type: AiRagPipelineNodeType,
  validationResult: RagValidationResult,
): ValidationState {
  if (validationResult.status === 'not_evaluated') {
    return 'not_evaluated';
  }

  if (type === 'hallucination_risk') {
    return validationResult.risk_count > 0 ? 'incorrect' : 'correct';
  }

  const hasFailedRelatedCheck = validationResult.checks.some(
    (check) => check.related_node_type === type && check.state === 'incorrect',
  );

  if (hasFailedRelatedCheck) {
    return type === 'retriever' || type === 'context_builder' ? 'partially_correct' : 'incorrect';
  }

  return 'correct';
}

function riskMessageForNode(type: AiRagPipelineNodeType, validationResult: RagValidationResult) {
  const failedCheck = validationResult.checks.find(
    (check) => check.related_node_type === type && check.state === 'incorrect',
  );

  return failedCheck?.beginner_message;
}

function buildNodes(
  lesson: Lesson,
  validationResult: RagValidationResult,
): Node<RagPipelineNodeData>[] {
  return (lesson.pipeline_nodes ?? []).map((node: AiRagPipelineNode, index) => {
    const explanation = explanationForType(node.type);
    const validationState = validationStateForNode(node.type, validationResult);

    return {
      id: node.id,
      type: node.type,
      position: nodePosition(node.type, index),
      data: {
        type: node.type,
        label: node.label,
        beginnerExplanation: node.beginner_explanation ?? node.description ?? explanation.beginner,
        engineerExplanation: node.engineer_explanation ?? explanation.engineer,
        payload: node.payload ?? derivedPayload(node.type, lesson),
        metadata: {
          lesson_id: lesson.id,
          topic: lesson.topic,
          pipeline_index: index,
          validation_state: validationState,
        },
        validation_state: validationState,
        riskMessage: riskMessageForNode(node.type, validationResult),
      },
    };
  });
}

function buildEdges(nodes: Node<RagPipelineNodeData>[], validationResult: RagValidationResult): Edge[] {
  const mainNodes = nodes.filter((node) => node.data.type !== 'hallucination_risk');
  const edges = mainNodes.slice(1).map((node, index) => {
    const source = mainNodes[index];
    const isWeakRetrievalEdge =
      source.data.type === 'retriever' &&
      (node.data.type === 'context_builder' || validationResult.status !== 'correct');

    return {
      id: `${source.id}-${node.id}`,
      source: source.id,
      target: node.id,
      label: index === 0 ? 'source' : 'next',
      type: 'smoothstep',
      animated: index === 0 || isWeakRetrievalEdge,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: isWeakRetrievalEdge ? '#ca8a04' : '#0f766e', strokeWidth: 2 },
    };
  });
  const riskNode = nodes.find((node) => node.data.type === 'hallucination_risk');
  const responseNode = nodes.find((node) => node.data.type === 'response');
  const retrievalNode = nodes.find((node) => node.data.type === 'retriever');

  if (riskNode && retrievalNode) {
    edges.push({
      id: `${retrievalNode.id}-${riskNode.id}`,
      source: retrievalNode.id,
      target: riskNode.id,
      label: 'risk',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#e11d48', strokeWidth: 2 },
    });
  }

  if (riskNode && responseNode) {
    edges.push({
      id: `${responseNode.id}-${riskNode.id}`,
      source: responseNode.id,
      target: riskNode.id,
      label: 'unsupported claim',
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#e11d48', strokeWidth: 2 },
    });
  }

  return edges;
}

function formatValue(value: unknown, fallback: string) {
  if (value === undefined || value === null) {
    return fallback;
  }

  return JSON.stringify(value);
}

export function RagPipelineCanvas({ lesson }: RagPipelineCanvasProps) {
  const learningMode = useWorkspaceStore((state) => state.learningMode);
  const isEngineerMode = learningMode === 'engineer';
  const validationResult = useMemo(() => validateRagPipelineLesson(lesson ?? null), [lesson]);
  const nodes = useMemo(
    () => (lesson ? buildNodes(lesson, validationResult) : []),
    [lesson, validationResult],
  );
  const edges = useMemo(() => buildEdges(nodes, validationResult), [nodes, validationResult]);

  if (!lesson || lesson.lesson_type !== 'ai_rag_pipeline') {
    return (
      <div className="rag-pipeline-empty">
        <span>AI/RAG pipeline</span>
        <h3>No AI/RAG lesson loaded</h3>
        <p>Load an AI/RAG lesson to render a static pipeline graph from lesson metadata.</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="rag-pipeline-empty">
        <span>AI/RAG pipeline</span>
        <h3>Pipeline data missing</h3>
        <p>This lesson is marked as AI/RAG, but it does not define pipeline_nodes yet.</p>
      </div>
    );
  }

  return (
    <div className="rag-pipeline-workspace">
      <div className="rag-pipeline-canvas">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
          >
            <Background />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <aside className="rag-pipeline-inspector">
        <span>AI/RAG lesson</span>
        <h3>{lesson.title}</h3>
        <p>
          {isEngineerMode
            ? 'This graph is rendered from static lesson metadata. It does not call embeddings, query a vector database, or generate an LLM response.'
            : 'This graph shows how a question can move through sources, retrieval, context, and a grounded answer.'}
        </p>
        <div className={`rag-pipeline-validation ${validationStateClassName(validationResult.status)}`}>
          <span>Validation</span>
          <h4>{VALIDATION_STATE_LABELS[validationResult.status]}</h4>
          <p>{isEngineerMode ? validationResult.engineer_message : validationResult.beginner_message}</p>
          <ul>
            {validationResult.checks.map((item) => (
              <li key={item.id} className={validationStateClassName(item.state)}>
                <strong>{item.label}</strong>
                <span>{isEngineerMode ? item.engineer_message : item.beginner_message}</span>
              </li>
            ))}
          </ul>
        </div>
        <dl>
          <div>
            <dt>Query</dt>
            <dd>{lesson.user_query ?? '(missing query)'}</dd>
          </div>
          <div>
            <dt>Sample chunks</dt>
            <dd>{formatValue(lesson.chunks, '[]')}</dd>
          </div>
          <div>
            <dt>Embedding metadata</dt>
            <dd>{formatValue(lesson.embedding_model, '(missing embedding metadata)')}</dd>
          </div>
          <div>
            <dt>Vector store</dt>
            <dd>{formatValue(lesson.vector_store, '(missing vector store metadata)')}</dd>
          </div>
          <div>
            <dt>Retrieved context</dt>
            <dd>{formatValue(lesson.retrieved_context, '[]')}</dd>
          </div>
          <div>
            <dt>Expected response</dt>
            <dd>{formatValue(lesson.expected_response, '(missing expected response)')}</dd>
          </div>
          <div>
            <dt>Citations</dt>
            <dd>{formatValue(lesson.citation_sources, '[]')}</dd>
          </div>
          <div>
            <dt>Risk notes</dt>
            <dd>{formatValue(lesson.hallucination_risk_points, '[]')}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
