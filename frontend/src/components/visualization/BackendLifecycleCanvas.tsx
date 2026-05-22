import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import type { BackendLifecycleNodeType, Lesson } from '../../types/lesson';
import { VALIDATION_STATE_LABELS, type BackendLifecycleValidationResult, type ValidationState, validationStateClassName } from '../../types/validation';
import { validateBackendLifecycleLesson } from '../../utils/validateBackendLifecycleLesson';
import { ValidationLegend } from './ValidationLegend';
import { BackendLifecycleNode, type BackendLifecycleNodeData } from './nodes/BackendLifecycleNode';

type BackendLifecycleCanvasProps = {
  lesson?: Lesson;
};

const nodeTypes: NodeTypes = {
  client: BackendLifecycleNode,
  route: BackendLifecycleNode,
  validation: BackendLifecycleNode,
  service: BackendLifecycleNode,
  repository: BackendLifecycleNode,
  database: BackendLifecycleNode,
  response: BackendLifecycleNode,
  error: BackendLifecycleNode,
};

const nodeOrder: BackendLifecycleNodeType[] = [
  'client',
  'route',
  'validation',
  'service',
  'repository',
  'database',
  'response',
  'error',
];

function nodePosition(type: BackendLifecycleNodeType, index: number) {
  if (type === 'error') {
    return { x: 820, y: 300 };
  }

  const orderedIndex = nodeOrder.includes(type) ? nodeOrder.indexOf(type) : index;
  const rowOffset = type === 'repository' || type === 'database' ? -60 : 0;

  return {
    x: 40 + Math.min(orderedIndex, 6) * 250,
    y: 140 + rowOffset,
  };
}

function explanationForType(type: BackendLifecycleNodeType) {
  const beginner: Record<BackendLifecycleNodeType, string> = {
    client: 'A browser or API client asks the backend for data.',
    route: 'FastAPI finds the code that matches this request.',
    validation: 'The backend checks that the request shape is allowed.',
    service: 'The app decides what should happen next.',
    repository: 'This layer would ask stored data for information.',
    database: 'A mock database stands in for stored data.',
    response: 'The backend sends an answer back to the client.',
    error: 'If something fails, the request follows an error path.',
  };
  const engineer: Record<BackendLifecycleNodeType, string> = {
    client: 'Incoming HTTP request context for the lifecycle trace.',
    route: 'Route metadata maps method/path to a handler function.',
    validation: 'Validated payload placeholder produced before business logic.',
    service: 'Service layer placeholder for application orchestration.',
    repository: 'Repository placeholder for data access boundaries.',
    database: 'Mock DB placeholder for deterministic storage interaction.',
    response: 'Response placeholder with serialized payload and status code.',
    error: 'Error branch placeholder for validation or lifecycle failures.',
  };

  return { beginner: beginner[type], engineer: engineer[type] };
}

function payloadForType(type: BackendLifecycleNodeType, lesson: Lesson) {
  if (type === 'client') {
    return {
      request_body: lesson.request_body ?? null,
      query_params: lesson.query_params ?? {},
    };
  }

  if (type === 'validation') {
    return {
      validated_payload: lesson.request_body ?? {},
      query_params: lesson.query_params ?? {},
    };
  }

  if (type === 'response') {
    return lesson.expected_response && typeof lesson.expected_response === 'object'
      ? (lesson.expected_response as Record<string, unknown>)
      : { response: lesson.expected_response ?? null };
  }

  if (type === 'error') {
    return { detail: 'Error branch placeholder' };
  }

  return undefined;
}

function validationStateForNode(
  type: BackendLifecycleNodeType,
  validationResult: BackendLifecycleValidationResult,
): ValidationState {
  if (validationResult.status === 'not_evaluated') {
    return 'not_evaluated';
  }

  const hasFailedRelatedCheck = validationResult.checks.some(
    (check) => check.related_node_type === type && check.state === 'incorrect',
  );

  return hasFailedRelatedCheck ? 'incorrect' : 'correct';
}

function buildNodes(
  lesson: Lesson,
  validationResult: BackendLifecycleValidationResult,
): Node<BackendLifecycleNodeData>[] {
  return (lesson.lifecycle_nodes ?? []).map((node, index) => {
    const explanation = explanationForType(node.type);

    return {
      id: node.id,
      type: node.type,
      position: nodePosition(node.type, index),
      data: {
        type: node.type,
        label: node.label,
        beginnerExplanation: node.beginner_explanation ?? node.description ?? explanation.beginner,
        engineerExplanation: node.engineer_explanation ?? node.description ?? explanation.engineer,
        requestPath:
          node.type === 'client' || node.type === 'route'
            ? `${lesson.request_method ?? 'GET'} ${lesson.request_path ?? '(missing path)'}`
            : undefined,
        statusCode: node.type === 'response' ? lesson.expected_status_code : node.type === 'error' ? 422 : undefined,
        payload: payloadForType(node.type, lesson),
        metadata: {
          file_path: node.file_path,
          line_number: node.line_number,
          lesson_id: lesson.id,
        },
        validation_state: validationStateForNode(node.type, validationResult),
      },
    };
  });
}

function buildEdges(nodes: Node<BackendLifecycleNodeData>[]): Edge[] {
  const normalNodes = nodes.filter((node) => node.data.type !== 'error');
  const edges = normalNodes.slice(1).map((node, index) => {
    const source = normalNodes[index];

    return {
      id: `${source.id}-${node.id}`,
      source: source.id,
      target: node.id,
      label: index === 0 ? 'request' : 'next',
      type: 'smoothstep',
      animated: index === 0,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#2563eb', strokeWidth: 2 },
    };
  });
  const validationNode = nodes.find((node) => node.data.type === 'validation');
  const errorNode = nodes.find((node) => node.data.type === 'error');
  const responseNode = nodes.find((node) => node.data.type === 'response');

  if (validationNode && errorNode) {
    edges.push({
      id: `${validationNode.id}-${errorNode.id}`,
      source: validationNode.id,
      target: errorNode.id,
      label: 'invalid',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#e11d48', strokeWidth: 2 },
    });
  }

  if (errorNode && responseNode) {
    edges.push({
      id: `${errorNode.id}-${responseNode.id}`,
      source: errorNode.id,
      target: responseNode.id,
      label: 'error response',
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#e11d48', strokeWidth: 2 },
    });
  }

  return edges;
}

function formatValue(value: unknown, fallback: string) {
  if (value === undefined) {
    return fallback;
  }

  return JSON.stringify(value);
}

export function BackendLifecycleCanvas({ lesson }: BackendLifecycleCanvasProps) {
  const learningMode = useWorkspaceStore((state) => state.learningMode);
  const isEngineerMode = learningMode === 'engineer';
  const validationResult = useMemo(() => validateBackendLifecycleLesson(lesson ?? null), [lesson]);
  const initialNodes = useMemo(
    () => (lesson ? buildNodes(lesson, validationResult) : []),
    [lesson, validationResult],
  );
  const initialEdges = useMemo(() => buildEdges(initialNodes), [initialNodes]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setEdges, setNodes]);

  if (!lesson || lesson.lesson_type !== 'backend_lifecycle') {
    return (
      <div className="backend-lifecycle-empty">
        <span>Backend lifecycle</span>
        <h3>No backend lifecycle lesson loaded</h3>
        <p>Load a backend lifecycle lesson to render request lifecycle nodes from lesson metadata.</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="backend-lifecycle-empty">
        <span>Backend lifecycle</span>
        <h3>Lifecycle data missing</h3>
        <p>This lesson is marked as backend lifecycle, but it does not define lifecycle_nodes yet.</p>
      </div>
    );
  }

  return (
    <div className="backend-lifecycle-workspace">
      <div className="backend-lifecycle-canvas">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.25}
          >
            <Background />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <aside className="backend-lifecycle-inspector">
        <span>Backend lifecycle lesson - static/mock</span>
        <h3>{lesson.title}</h3>
        <p>
          {isEngineerMode
            ? 'This graph is rendered from static lesson metadata. It does not execute FastAPI code or send an HTTP request.'
            : 'This graph shows how the lesson request moves through backend lifecycle steps.'}
        </p>
        <dl className="track-summary-grid">
          <div>
            <dt>Request</dt>
            <dd>{`${lesson.request_method ?? 'GET'} ${lesson.request_path ?? '(missing path)'}`}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{lesson.expected_status_code ?? '(missing status)'}</dd>
          </div>
        </dl>
        <div className={`backend-lifecycle-validation ${validationStateClassName(validationResult.status)}`}>
          <span>Validation</span>
          <h4>{VALIDATION_STATE_LABELS[validationResult.status]}</h4>
          <p>{validationResult.message}</p>
          {validationResult.checks.length > 0 && (
            <ul>
              {validationResult.checks.map((item) => (
                <li key={item.id} className={validationStateClassName(item.state)}>
                  <strong>{item.label}</strong>
                  <span>{item.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {isEngineerMode && (
          <dl>
            <div>
              <dt>Request body</dt>
              <dd>{formatValue(lesson.request_body, 'null')}</dd>
            </div>
            <div>
              <dt>Query params</dt>
              <dd>{formatValue(lesson.query_params, '{}')}</dd>
            </div>
            <div>
              <dt>Validated payload</dt>
              <dd>{formatValue(lesson.request_body ?? lesson.query_params, '{}')}</dd>
            </div>
            <div>
              <dt>Response payload</dt>
              <dd>{formatValue(lesson.expected_response, '(missing expected response)')}</dd>
            </div>
          </dl>
        )}
      </aside>
      <ValidationLegend />
    </div>
  );
}
