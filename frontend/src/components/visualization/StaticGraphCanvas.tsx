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
import { useEffect, useMemo, useState } from 'react';
import type { StaticGraphData, StaticGraphNode, StaticGraphNodeData } from '../../types/graph';
import { NodeInspectionPanel } from './NodeInspectionPanel';
import { ValidationLegend } from './ValidationLegend';
import { ClassNode } from './nodes/ClassNode';
import { FileNode } from './nodes/FileNode';
import { FunctionNode } from './nodes/FunctionNode';

type StaticGraphCanvasProps = {
  graphData: StaticGraphData;
};

const nodeTypes: NodeTypes = {
  file: FileNode,
  function: FunctionNode,
  class: ClassNode,
  external_module: FileNode,
};

function positionForNode(node: StaticGraphNode, index: number, fileIndexes: Map<string, number>) {
  const filePath = node.data.file_path ?? node.data.name;
  const fileIndex = fileIndexes.get(filePath) ?? index;
  const rowY = fileIndex * 170;

  if (node.type === 'file') {
    return { x: 24, y: rowY };
  }

  if (node.type === 'function') {
    return { x: 250, y: rowY + 12 + index * 6 };
  }

  if (node.type === 'class') {
    return { x: 480, y: rowY + 56 + index * 6 };
  }

  return { x: 700, y: 28 + index * 110 };
}

function toReactFlowNodes(graphData: StaticGraphData): Node<StaticGraphNodeData>[] {
  const fileIndexes = new Map<string, number>();

  graphData.nodes
    .filter((node) => node.type === 'file')
    .forEach((node, index) => fileIndexes.set(node.data.file_path ?? node.data.name, index));

  return graphData.nodes.map((node, index) => ({
    id: node.id,
    type: node.type,
    position: positionForNode(node, index, fileIndexes),
    data: node.data,
  }));
}

function toReactFlowEdges(graphData: StaticGraphData): Edge[] {
  return graphData.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.type === 'imports' ? 'imports' : undefined,
    type: 'smoothstep',
    animated: edge.type === 'imports',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: edge.type === 'imports' ? '#3b82f6' : '#94a3b8',
      strokeWidth: edge.type === 'imports' ? 2 : 1.5,
    },
    data: edge.data,
  }));
}

export function StaticGraphCanvas({ graphData }: StaticGraphCanvasProps) {
  const [inspectedNode, setInspectedNode] = useState<StaticGraphNodeData | null>(null);
  const initialNodes = useMemo(() => toReactFlowNodes(graphData), [graphData]);
  const initialEdges = useMemo(() => toReactFlowEdges(graphData), [graphData]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setInspectedNode(null);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [graphData, initialNodes, initialEdges, setEdges, setNodes]);

  return (
    <div className="static-graph-workspace">
      <div className="static-graph-canvas">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.08 }}
            minZoom={0.35}
            onNodeClick={(_, node) => setInspectedNode(node.data as StaticGraphNodeData)}
            onNodeMouseEnter={(_, node) => setInspectedNode(node.data as StaticGraphNodeData)}
          >
            <Background />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <NodeInspectionPanel nodeData={inspectedNode} />
      <ValidationLegend />

      <details className="graph-debug">
        <summary>Graph JSON</summary>
        <pre>{JSON.stringify(graphData, null, 2)}</pre>
      </details>
    </div>
  );
}
