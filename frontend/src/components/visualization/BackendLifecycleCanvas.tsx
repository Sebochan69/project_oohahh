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
import { BackendLifecycleNode, type BackendLifecycleNodeData } from './nodes/BackendLifecycleNode';

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

const lifecycleNodes: Node<BackendLifecycleNodeData>[] = [
  {
    id: 'client',
    type: 'client',
    position: { x: 40, y: 120 },
    data: {
      type: 'client',
      label: 'Client request',
      beginnerExplanation: 'A browser or API client asks the backend for data.',
      engineerExplanation: 'Incoming HTTP request with method GET and path /hello.',
      requestPath: 'GET /hello',
      payload: { query_params: {}, request_body: null },
      metadata: { source: 'browser_or_api_client' },
    },
  },
  {
    id: 'route',
    type: 'route',
    position: { x: 300, y: 120 },
    data: {
      type: 'route',
      label: 'Route handler',
      beginnerExplanation: 'FastAPI finds the code that matches this path.',
      engineerExplanation: 'Route decorator @app.get("/hello") selects hello().',
      requestPath: '/hello',
      metadata: { file_path: 'app.py', line_number: 5 },
    },
  },
  {
    id: 'validation',
    type: 'validation',
    position: { x: 560, y: 120 },
    data: {
      type: 'validation',
      label: 'Validation',
      beginnerExplanation: 'The backend checks that the request shape is allowed.',
      engineerExplanation: 'No body is required, so validation produces an empty validated payload.',
      payload: { validated_payload: {} },
      metadata: { model: null },
    },
  },
  {
    id: 'service',
    type: 'service',
    position: { x: 820, y: 120 },
    data: {
      type: 'service',
      label: 'Service logic',
      beginnerExplanation: 'The app decides what message should be returned.',
      engineerExplanation: 'Service placeholder returns a domain value for the response payload.',
      payload: { message: 'Hello from OOH-AHH' },
      metadata: { function_name: 'build_hello_message' },
    },
  },
  {
    id: 'repository',
    type: 'repository',
    position: { x: 1080, y: 60 },
    data: {
      type: 'repository',
      label: 'Repository',
      beginnerExplanation: 'This layer would ask stored data for information.',
      engineerExplanation: 'Repository placeholder isolates data access from service logic.',
      payload: { lookup_key: 'hello_message' },
      metadata: { method: 'get_message' },
    },
  },
  {
    id: 'database',
    type: 'database',
    position: { x: 1340, y: 60 },
    data: {
      type: 'database',
      label: 'Mock DB',
      beginnerExplanation: 'A mock database stands in for stored data.',
      engineerExplanation: 'In-memory mock returns a deterministic record without external persistence.',
      payload: { record: { message: 'Hello from OOH-AHH' } },
      metadata: { storage: 'mock' },
    },
  },
  {
    id: 'response',
    type: 'response',
    position: { x: 1340, y: 220 },
    data: {
      type: 'response',
      label: 'JSON response',
      beginnerExplanation: 'The backend sends a JSON answer back to the client.',
      engineerExplanation: 'Response payload serializes to JSON with HTTP 200.',
      statusCode: 200,
      payload: { message: 'Hello from OOH-AHH' },
      metadata: { media_type: 'application/json' },
    },
  },
  {
    id: 'error',
    type: 'error',
    position: { x: 820, y: 300 },
    data: {
      type: 'error',
      label: 'Error branch',
      beginnerExplanation: 'If validation fails, the request skips normal app logic.',
      engineerExplanation: 'Validation errors would short-circuit to an error response, such as 422.',
      statusCode: 422,
      payload: { detail: 'Validation error placeholder' },
      metadata: { branch: 'validation_failure' },
    },
  },
];

const lifecycleEdges: Edge[] = [
  ['client', 'route', 'request'],
  ['route', 'validation', 'parse'],
  ['validation', 'service', 'valid'],
  ['service', 'repository', 'read'],
  ['repository', 'database', 'query'],
  ['database', 'response', 'data'],
  ['service', 'response', 'payload'],
  ['validation', 'error', 'invalid'],
  ['error', 'response', 'error response'],
].map(([source, target, label]) => ({
  id: `${source}-${target}`,
  source,
  target,
  label,
  type: 'smoothstep',
  animated: source === 'client' || source === 'validation',
  markerEnd: { type: MarkerType.ArrowClosed },
  style: {
    stroke: source === 'error' || target === 'error' ? '#e11d48' : '#2563eb',
    strokeWidth: 2,
  },
}));

export function BackendLifecycleCanvas() {
  const learningMode = useWorkspaceStore((state) => state.learningMode);
  const isEngineerMode = learningMode === 'engineer';
  const nodes = useMemo(() => lifecycleNodes, []);
  const edges = useMemo(() => lifecycleEdges, []);

  return (
    <div className="backend-lifecycle-workspace">
      <div className="backend-lifecycle-canvas">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
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
        <span>Backend lifecycle prototype</span>
        <h3>{isEngineerMode ? 'Engineer details' : 'Beginner view'}</h3>
        <p>
          {isEngineerMode
            ? 'This static graph shows placeholder request path, payload, status, and layer metadata for a future FastAPI lifecycle track.'
            : 'This static graph shows how a request travels from a client to backend code and back as a response.'}
        </p>
        <dl>
          <div>
            <dt>Request body</dt>
            <dd>{isEngineerMode ? 'null' : 'No body needed'}</dd>
          </div>
          <div>
            <dt>Validated payload</dt>
            <dd>{isEngineerMode ? '{}' : 'The request is allowed'}</dd>
          </div>
          <div>
            <dt>Response payload</dt>
            <dd>{'{"message":"Hello from OOH-AHH"}'}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
