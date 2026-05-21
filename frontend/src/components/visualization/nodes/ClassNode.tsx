import { Handle, Position } from '@xyflow/react';
import type { StaticGraphNodeData } from '../../../types/graph';
import { VALIDATION_STATE_LABELS } from '../../../types/validation';
import { graphNodeValidationClassName } from '../../../utils/nodeValidation';

type StaticNodeProps = {
  data: StaticGraphNodeData;
};

export function ClassNode({ data }: StaticNodeProps) {
  return (
    <div className={`static-node static-node--class ${graphNodeValidationClassName(data)}`}>
      <Handle type="target" position={Position.Left} />
      <div className="static-node__type">Class</div>
      <div className="static-node__label">{data.name}</div>
      {data.line_number && <div className="static-node__meta">line {data.line_number}</div>}
      <div className="node-validation-label">{VALIDATION_STATE_LABELS[data.validation_state]}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
