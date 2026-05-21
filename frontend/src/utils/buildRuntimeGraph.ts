import type {
  RuntimeGraphData,
  RuntimeGraphEdge,
  RuntimeGraphNode,
  RuntimeGraphNodeType,
} from '../types/graph';
import type { RuntimeTraceEvent } from '../types/trace';
import type { ValidationState } from '../types/validation';
import { DEFAULT_VALIDATION_STATE } from '../types/validation';

const SUPPORTED_EVENT_TYPES = new Set<RuntimeGraphNodeType>([
  'execution_started',
  'line_executed',
  'variable_created',
  'variable_updated',
  'execution_finished',
  'error_raised',
]);

function runtimeNodeId(event: RuntimeTraceEvent) {
  return `runtime:${event.step}:${event.id}`;
}

function runtimeNodeType(eventType: string): RuntimeGraphNodeType {
  return SUPPORTED_EVENT_TYPES.has(eventType as RuntimeGraphNodeType)
    ? (eventType as RuntimeGraphNodeType)
    : 'runtime_event';
}

function validationStateForEvent(event: RuntimeTraceEvent, isActive: boolean): ValidationState {
  if (event.type === 'error_raised') {
    return 'incorrect';
  }

  return isActive ? 'running' : DEFAULT_VALIDATION_STATE;
}

export function buildRuntimeGraph(events: RuntimeTraceEvent[], currentEventIndex: number): RuntimeGraphData {
  const normalizedCurrentIndex =
    events.length === 0 ? -1 : Math.min(Math.max(currentEventIndex, 0), events.length - 1);
  const activeEvent = normalizedCurrentIndex >= 0 ? events[normalizedCurrentIndex] : undefined;
  const activeNodeId = activeEvent ? runtimeNodeId(activeEvent) : null;
  const nodes: RuntimeGraphNode[] = events.map((event) => {
    const nodeId = runtimeNodeId(event);
    const isActive = nodeId === activeNodeId;
    const validationState = validationStateForEvent(event, isActive);

    return {
      id: nodeId,
      type: runtimeNodeType(event.type),
      data: {
        event_id: event.id,
        event_type: event.type,
        step: event.step,
        file_path: event.file_path,
        line_number: event.line_number,
        scope: event.scope,
        payload: event.payload,
        is_active: isActive,
        validation_state: validationState,
      },
    };
  });
  const edges: RuntimeGraphEdge[] = events.slice(1).map((event, index) => {
    const previousEvent = events[index];

    return {
      id: `execution_order:${previousEvent.id}:${event.id}`,
      source: runtimeNodeId(previousEvent),
      target: runtimeNodeId(event),
      type: 'execution_order',
      data: {
        type: 'execution_order',
        source_step: previousEvent.step,
        target_step: event.step,
      },
    };
  });

  return {
    nodes,
    edges,
    activeNodeId,
  };
}
