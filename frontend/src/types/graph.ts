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
