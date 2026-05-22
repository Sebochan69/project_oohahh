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
import { useWorkspaceStore } from '../../stores/workspaceStore';
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
  top_level: FunctionNode,
  builtin_call: FunctionNode,
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

  if (node.type === 'top_level') {
    return { x: 250, y: rowY + 12 };
  }

  if (node.type === 'class') {
    return { x: 480, y: rowY + 56 + index * 6 };
  }

  if (node.type === 'builtin_call') {
    return { x: 700, y: rowY + 36 + index * 10 };
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
    label: edge.type === 'imports' ? 'imports' : edge.type === 'calls' ? 'calls' : undefined,
    type: 'smoothstep',
    animated: edge.type === 'imports' || edge.type === 'calls',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: edge.type === 'imports' ? '#3b82f6' : edge.type === 'calls' ? '#0f766e' : '#94a3b8',
      strokeWidth: edge.type === 'imports' || edge.type === 'calls' ? 2 : 1.5,
    },
    data: edge.data,
  }));
}

export function StaticGraphCanvas({ graphData }: StaticGraphCanvasProps) {
  const [inspectedNode, setInspectedNode] = useState<StaticGraphNodeData | null>(null);
  const setCodeHighlight = useWorkspaceStore((state) => state.setCodeHighlight);
  const initialNodes = useMemo(() => toReactFlowNodes(graphData), [graphData]);
  const initialEdges = useMemo(() => toReactFlowEdges(graphData), [graphData]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setInspectedNode(null);
    setCodeHighlight(null);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [graphData, initialNodes, initialEdges, setCodeHighlight, setEdges, setNodes]);

  function inspectNode(nodeData: StaticGraphNodeData) {
    setInspectedNode(nodeData);

    if (nodeData.file_path && nodeData.line_number) {
      setCodeHighlight({
        filePath: nodeData.file_path,
        lineNumber: nodeData.line_number,
        label: `${nodeData.type.replace(/_/g, ' ')}: ${nodeData.name}`,
      });
      return;
    }

    setCodeHighlight(null);
  }

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
            onNodeClick={(_, node) => inspectNode(node.data as StaticGraphNodeData)}
            onNodeMouseEnter={(_, node) => inspectNode(node.data as StaticGraphNodeData)}
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
