import type {
  RuntimeGraphData,
  RuntimeGraphEdge,
  RuntimeGraphNode,
  RuntimeGraphNodeType,
} from '../types/graph';
import type { RuntimeTraceEvent } from '../types/trace';
import type { LessonValidationResult, ValidationState } from '../types/validation';
import { DEFAULT_VALIDATION_STATE } from '../types/validation';

type RuntimeGraphFiles = Record<string, { content: string }>;

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

function isTerminalExecutionEvent(event: RuntimeTraceEvent) {
  return event.type === 'execution_finished' || event.type === 'error_raised';
}

function indentation(line: string) {
  return line.match(/^\s*/)?.[0].replace(/\t/g, '    ').length ?? 0;
}

function isBlockHeader(line: string) {
  const trimmedLine = line.trim();

  return Boolean(trimmedLine) && !trimmedLine.startsWith('#') && trimmedLine.endsWith(':');
}

function lineRange(startLine: number, endLine: number) {
  return Array.from({ length: Math.max(endLine - startLine + 1, 1) }, (_, index) => startLine + index);
}

function blockEndLine(lines: string[], headerLineNumber: number) {
  const headerIndex = headerLineNumber - 1;
  const headerIndent = indentation(lines[headerIndex] ?? '');
  let endLineNumber = headerLineNumber;

  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim()) {
      continue;
    }

    if (indentation(line) <= headerIndent) {
      break;
    }

    endLineNumber = index + 1;
  }

  return endLineNumber;
}

function sourceLinesForEvent(event: RuntimeTraceEvent, files?: RuntimeGraphFiles) {
  const source = files?.[event.file_path]?.content;

  return source ? source.split(/\r?\n/) : null;
}

function serializedFunctionName(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const match = value.match(/^<function (.+)>$/);

  return match?.[1] ?? null;
}

function functionDefinitionLineNumber(functionName: string, lines: string[]) {
  const definitionPattern = new RegExp(`^\\s*def\\s+${functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`);
  const definitionIndex = lines.findIndex((line) => definitionPattern.test(line));

  return definitionIndex >= 0 ? definitionIndex + 1 : null;
}

function validLineNumberForEvent(event: RuntimeTraceEvent, files?: RuntimeGraphFiles) {
  if (!event.line_number) {
    return null;
  }

  const lines = sourceLinesForEvent(event, files);

  if (!lines) {
    return event.line_number;
  }

  const definedFunctionName =
    event.type === 'variable_created' ? serializedFunctionName(event.payload.new_value) : null;

  if (definedFunctionName) {
    return functionDefinitionLineNumber(definedFunctionName, lines) ?? event.line_number;
  }

  const lineIndex = event.line_number - 1;

  return lineIndex >= 0 && lineIndex < lines.length ? event.line_number : null;
}

function eventWithFallbackLine(event: RuntimeTraceEvent, fallbackLineNumber: number | null): RuntimeTraceEvent {
  if (event.line_number || event.type !== 'execution_finished' || event.payload.status !== 'completed') {
    return event;
  }

  return {
    ...event,
    line_number: fallbackLineNumber,
  };
}

function relatedLinesForEvent(event: RuntimeTraceEvent, lineNumber: number | null, files?: RuntimeGraphFiles) {
  if (!lineNumber) {
    return [];
  }

  const lines = sourceLinesForEvent(event, files);

  if (!lines) {
    return [lineNumber];
  }

  const lineIndex = lineNumber - 1;

  const currentLine = lines[lineIndex] ?? '';

  if (isBlockHeader(currentLine)) {
    return lineRange(lineNumber, blockEndLine(lines, lineNumber));
  }

  const currentIndent = indentation(currentLine);

  for (let index = lineIndex - 1; index >= 0; index -= 1) {
    const candidate = lines[index] ?? '';

    if (!candidate.trim() || !isBlockHeader(candidate)) {
      continue;
    }

    if (indentation(candidate) < currentIndent) {
      return lineRange(index + 1, blockEndLine(lines, index + 1));
    }
  }

  return [lineNumber];
}

function validationStateForEvent(
  event: RuntimeTraceEvent,
  isActive: boolean,
  isValidatedTerminalEvent: boolean,
  lessonValidationResult?: LessonValidationResult | null,
): ValidationState {
  if (event.type === 'error_raised') {
    return 'incorrect';
  }

  if (!lessonValidationResult || lessonValidationResult.status === 'not_evaluated') {
    if (event.type === 'execution_finished') {
      return event.payload.status === 'failed' ? 'incorrect' : 'correct';
    }

    return isActive ? 'running' : 'correct';
  }

  if (isValidatedTerminalEvent) {
    return lessonValidationResult.status;
  }

  if (lessonValidationResult.status === 'correct') {
    return 'correct';
  }

  if (lessonValidationResult.status === 'partially_correct') {
    return event.type === 'execution_finished' ? 'partially_correct' : 'correct';
  }

  if (lessonValidationResult.status === 'incorrect') {
    return event.type === 'execution_finished' ? 'incorrect' : DEFAULT_VALIDATION_STATE;
  }

  return isActive ? 'running' : DEFAULT_VALIDATION_STATE;
}

export function buildRuntimeGraph(
  events: RuntimeTraceEvent[],
  currentEventIndex: number,
  lessonValidationResult?: LessonValidationResult | null,
  files?: RuntimeGraphFiles,
): RuntimeGraphData {
  const normalizedCurrentIndex =
    events.length === 0 ? -1 : Math.min(Math.max(currentEventIndex, 0), events.length - 1);
  const activeEvent = normalizedCurrentIndex >= 0 ? events[normalizedCurrentIndex] : undefined;
  const activeNodeId = activeEvent ? runtimeNodeId(activeEvent) : null;
  const terminalValidationEvent = [...events].reverse().find(isTerminalExecutionEvent);
  let previousValidLineNumber: number | null = null;
  const nodes: RuntimeGraphNode[] = events.map((event) => {
    const normalizedEvent = eventWithFallbackLine(event, previousValidLineNumber);
    const nodeId = runtimeNodeId(event);
    const lineNumber = validLineNumberForEvent(normalizedEvent, files);
    const isActive = nodeId === activeNodeId;
    const isValidatedTerminalEvent = Boolean(terminalValidationEvent && event.id === terminalValidationEvent.id);
    const validationState = validationStateForEvent(
      event,
      isActive,
      isValidatedTerminalEvent,
      lessonValidationResult,
    );

    if (lineNumber) {
      previousValidLineNumber = lineNumber;
    }

    return {
      id: nodeId,
      type: runtimeNodeType(event.type),
      data: {
        event_id: event.id,
        event_type: event.type,
        step: event.step,
        file_path: event.file_path,
        line_number: lineNumber,
        related_lines: relatedLinesForEvent(normalizedEvent, lineNumber, files),
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
