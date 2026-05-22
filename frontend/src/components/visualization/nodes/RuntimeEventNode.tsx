import { Handle, Position } from '@xyflow/react';
import type { RuntimeGraphNodeData } from '../../../types/graph';
import { VALIDATION_STATE_LABELS } from '../../../types/validation';
import { graphNodeValidationClassName } from '../../../utils/nodeValidation';

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
  const classNames = ['runtime-node', `runtime-node--${data.event_type}`, graphNodeValidationClassName(data)];

  if (data.is_active) {
    classNames.push('is-active');
  }

  return classNames.join(' ');
}

function eventLabel(eventType: string) {
  return EVENT_LABELS[eventType] ?? 'Runtime Event';
}

function runtimeValidationLabel(data: RuntimeGraphNodeData) {
  if (data.validation_state === 'running') {
    return 'Current step';
  }

  if (data.validation_state === 'not_evaluated') {
    return 'Not checked';
  }

  return VALIDATION_STATE_LABELS[data.validation_state];
}

function formatPayloadValue(value: unknown) {
  if (value === undefined) {
    return 'unknown';
  }

  return typeof value === 'string' ? value : JSON.stringify(value);
}

function functionNameFromSerializedValue(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const match = value.match(/^<function (.+)>$/);

  return match?.[1] ?? null;
}

function readableRuntimeStep(data: RuntimeGraphNodeData) {
  const variableName = data.payload.name ?? data.payload.variable ?? data.payload.variable_name;
  const newValue = data.payload.new_value ?? data.payload.newValue ?? data.payload.value;

  if (data.event_type === 'variable_created') {
    const functionName = functionNameFromSerializedValue(newValue);

    if (functionName) {
      return `Function ${functionName} is defined`;
    }

    return `${String(variableName ?? 'variable')} starts as ${formatPayloadValue(newValue)}`;
  }

  if (data.event_type === 'variable_updated') {
    return `${String(variableName ?? 'variable')} becomes ${formatPayloadValue(newValue)}`;
  }

  if (data.event_type === 'line_executed' && data.line_number) {
    return `Line ${data.line_number} runs`;
  }

  if (data.event_type === 'error_raised') {
    return String(data.payload.error_message ?? 'Runtime error');
  }

  if (data.event_type === 'execution_finished') {
    return data.payload.status === 'failed' ? 'Execution stops with an error' : 'Execution finishes';
  }

  return `Step ${data.step}`;
}

function relatedLinesLabel(data: RuntimeGraphNodeData) {
  const relatedLines = data.related_lines ?? [];

  if (!relatedLines.length) {
    return data.line_number ? `code line ${data.line_number}` : 'no code line';
  }

  const firstLine = relatedLines[0];
  const lastLine = relatedLines[relatedLines.length - 1];

  return firstLine === lastLine ? `code line ${firstLine}` : `code lines ${firstLine}-${lastLine}`;
}

export function RuntimeEventNode({ data }: RuntimeEventNodeProps) {
  return (
    <div className={runtimeNodeClassName(data)}>
      <Handle type="target" position={Position.Left} />
      <div className="runtime-node__type">{eventLabel(data.event_type)}</div>
      <div className="runtime-node__label">{readableRuntimeStep(data)}</div>
      <div className="runtime-node__meta">
        <span>event step {data.step}</span>
        <span>{data.file_path}</span>
        <span>{relatedLinesLabel(data)}</span>
      </div>
      <div className="node-validation-label">{runtimeValidationLabel(data)}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
