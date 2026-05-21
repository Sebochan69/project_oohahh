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
import type { RuntimeGraphData, RuntimeGraphNode, RuntimeGraphNodeData } from '../../types/graph';
import { ValidationLegend } from './ValidationLegend';
import { RuntimeEventNode } from './nodes/RuntimeEventNode';

type RuntimeGraphCanvasProps = {
  graphData: RuntimeGraphData;
};

const nodeTypes: NodeTypes = {
  execution_started: RuntimeEventNode,
  line_executed: RuntimeEventNode,
  variable_created: RuntimeEventNode,
  variable_updated: RuntimeEventNode,
  execution_finished: RuntimeEventNode,
  error_raised: RuntimeEventNode,
  runtime_event: RuntimeEventNode,
};

function positionForNode(node: RuntimeGraphNode, index: number) {
  const column = index % 4;
  const row = Math.floor(index / 4);
  const direction = row % 2 === 0 ? column : 3 - column;

  return {
    x: 60 + direction * 260,
    y: 60 + row * 170,
  };
}

function toReactFlowNodes(graphData: RuntimeGraphData): Node<RuntimeGraphNodeData>[] {
  return graphData.nodes.map((node, index) => ({
    id: node.id,
    type: node.type,
    position: positionForNode(node, index),
    data: node.data,
  }));
}

function toReactFlowEdges(graphData: RuntimeGraphData): Edge[] {
  return graphData.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: '#64748b',
      strokeWidth: 1.8,
    },
    data: edge.data,
  }));
}

export function RuntimeGraphCanvas({ graphData }: RuntimeGraphCanvasProps) {
  const nodes = useMemo(() => toReactFlowNodes(graphData), [graphData]);
  const edges = useMemo(() => toReactFlowEdges(graphData), [graphData]);

  return (
    <div className="runtime-graph-workspace">
      <div className="runtime-graph-canvas">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.22 }}
            minZoom={0.25}
          >
            <Background />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <ValidationLegend />

      <details className="graph-debug">
        <summary>Runtime Graph JSON</summary>
        <pre>{JSON.stringify(graphData, null, 2)}</pre>
      </details>
    </div>
  );
}
