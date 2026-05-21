import { Handle, Position } from '@xyflow/react';
import type { StaticGraphNodeData } from '../../../types/graph';

type StaticNodeProps = {
  data: StaticGraphNodeData;
};

export function FileNode({ data }: StaticNodeProps) {
  const typeLabel = data.type === 'external_module' ? 'Module' : 'File';

  return (
    <div className="static-node static-node--file">
      <Handle type="target" position={Position.Left} />
      <div className="static-node__type">{typeLabel}</div>
      <div className="static-node__label">{data.name}</div>
      {data.is_entry && <div className="static-node__meta">entry</div>}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
