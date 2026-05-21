import { Handle, Position } from '@xyflow/react';
import type { StaticGraphNodeData } from '../../../types/graph';

type StaticNodeProps = {
  data: StaticGraphNodeData;
};

export function ClassNode({ data }: StaticNodeProps) {
  return (
    <div className="static-node static-node--class">
      <Handle type="target" position={Position.Left} />
      <div className="static-node__type">Class</div>
      <div className="static-node__label">{data.name}</div>
      {data.line_number && <div className="static-node__meta">line {data.line_number}</div>}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
