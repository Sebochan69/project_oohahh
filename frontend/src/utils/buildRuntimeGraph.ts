import type {
  RuntimeGraphData,
  RuntimeGraphEdge,
  RuntimeGraphNode,
  RuntimeGraphNodeType,
} from '../types/graph';
import type { RuntimeTraceEvent } from '../types/trace';

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

export function buildRuntimeGraph(events: RuntimeTraceEvent[], currentEventIndex: number): RuntimeGraphData {
  const normalizedCurrentIndex =
    events.length === 0 ? -1 : Math.min(Math.max(currentEventIndex, 0), events.length - 1);
  const activeEvent = normalizedCurrentIndex >= 0 ? events[normalizedCurrentIndex] : undefined;
  const activeNodeId = activeEvent ? runtimeNodeId(activeEvent) : null;
  const nodes: RuntimeGraphNode[] = events.map((event) => {
    const nodeId = runtimeNodeId(event);

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
        is_active: nodeId === activeNodeId,
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
