import { Handle, Position } from '@xyflow/react';
import type { StaticGraphNodeData } from '../../../types/graph';
import { VALIDATION_STATE_LABELS } from '../../../types/validation';
import { graphNodeValidationClassName } from '../../../utils/nodeValidation';

type StaticNodeProps = {
  data: StaticGraphNodeData;
};

export function FunctionNode({ data }: StaticNodeProps) {
  const typeLabel =
    data.type === 'top_level' ? 'Top-level' : data.type === 'builtin_call' ? 'Call target' : 'Function';
  const nodeTypeClass =
    data.type === 'top_level'
      ? 'static-node--top-level'
      : data.type === 'builtin_call'
        ? 'static-node--builtin-call'
        : 'static-node--function';

  return (
    <div className={`static-node ${nodeTypeClass} ${graphNodeValidationClassName(data)}`}>
      <Handle type="target" position={Position.Left} />
      <div className="static-node__type">{typeLabel}</div>
      <div className="static-node__label">{data.name}</div>
      {data.line_number && <div className="static-node__meta">line {data.line_number}</div>}
      {data.argument_count !== undefined && <div className="static-node__meta">{data.argument_count} args</div>}
      <div className="node-validation-label">{VALIDATION_STATE_LABELS[data.validation_state]}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
