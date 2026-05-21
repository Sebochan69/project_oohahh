import { Handle, Position } from '@xyflow/react';
import type { RuntimeGraphNodeData } from '../../../types/graph';

type RuntimeEventNodeProps = {
  data: RuntimeGraphNodeData;
};

const EVENT_LABELS: Record<string, string> = {
  execution_started: 'Execution Started',
  line_executed: 'Line Executed',
  variable_created: 'Variable Created',
  variable_updated: 'Variable Updated',
  execution_finished: 'Execution Finished',
  error_raised: 'Error Raised',
};

function runtimeNodeClassName(data: RuntimeGraphNodeData) {
  const classNames = ['runtime-node', `runtime-node--${data.event_type}`];

  if (data.is_active) {
    classNames.push('is-active');
  }

  return classNames.join(' ');
}

function eventLabel(eventType: string) {
  return EVENT_LABELS[eventType] ?? 'Runtime Event';
}

export function RuntimeEventNode({ data }: RuntimeEventNodeProps) {
  return (
    <div className={runtimeNodeClassName(data)}>
      <Handle type="target" position={Position.Left} />
      <div className="runtime-node__type">{eventLabel(data.event_type)}</div>
      <div className="runtime-node__label">Step {data.step}</div>
      <div className="runtime-node__meta">
        <span>{data.file_path}</span>
        <span>{data.line_number ? `line ${data.line_number}` : 'no line'}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
