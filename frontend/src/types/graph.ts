export type StaticGraphNodeType = 'file' | 'function' | 'class' | 'external_module';

export type StaticGraphEdgeType = 'contains' | 'imports';

export type StaticGraphNodeData = {
  file_path?: string;
  line_number?: number | null;
  name: string;
  type: StaticGraphNodeType;
  is_entry?: boolean;
  import_type?: string;
};

export type StaticGraphEdgeData = {
  file_path?: string;
  line_number?: number | null;
  module?: string;
  name?: string | null;
  type: StaticGraphEdgeType;
};

export type StaticGraphNode = {
  id: string;
  type: StaticGraphNodeType;
  data: StaticGraphNodeData;
};

export type StaticGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: StaticGraphEdgeType;
  data: StaticGraphEdgeData;
};

export type StaticGraphData = {
  nodes: StaticGraphNode[];
  edges: StaticGraphEdge[];
};

export type RuntimeGraphNodeType =
  | 'execution_started'
  | 'line_executed'
  | 'variable_created'
  | 'variable_updated'
  | 'execution_finished'
  | 'error_raised'
  | 'runtime_event';

export type RuntimeGraphEdgeType = 'execution_order';

export type RuntimeGraphNodeData = {
  event_id: string;
  event_type: string;
  step: number;
  file_path: string;
  line_number: number | null;
  scope: Record<string, unknown>;
  payload: Record<string, unknown>;
  is_active: boolean;
};

export type RuntimeGraphEdgeData = {
  type: RuntimeGraphEdgeType;
  source_step: number;
  target_step: number;
};

export type RuntimeGraphNode = {
  id: string;
  type: RuntimeGraphNodeType;
  data: RuntimeGraphNodeData;
};

export type RuntimeGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: RuntimeGraphEdgeType;
  data: RuntimeGraphEdgeData;
};

export type RuntimeGraphData = {
  nodes: RuntimeGraphNode[];
  edges: RuntimeGraphEdge[];
  activeNodeId: string | null;
};
