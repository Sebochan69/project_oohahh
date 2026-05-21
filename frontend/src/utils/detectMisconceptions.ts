import type { RuntimeGraphNodeData } from '../types/graph';
import type { MisconceptionResult } from '../types/misconception';
import type { RuntimeTraceEvent } from '../types/trace';
import type { LessonValidationResult } from '../types/validation';

type DetectMisconceptionsInput = {
  currentEvent: RuntimeTraceEvent | undefined;
  lessonValidationResult: LessonValidationResult;
  activeRuntimeNode: RuntimeGraphNodeData | undefined;
};

function eventIdFromContext(currentEvent: RuntimeTraceEvent | undefined, activeRuntimeNode: RuntimeGraphNodeData | undefined) {
  return currentEvent?.id ?? activeRuntimeNode?.event_id;
}

export function detectMisconceptions({
  currentEvent,
  lessonValidationResult,
  activeRuntimeNode,
}: DetectMisconceptionsInput): MisconceptionResult[] {
  const misconceptions: MisconceptionResult[] = [];
  const relatedEventId = eventIdFromContext(currentEvent, activeRuntimeNode);

  if (lessonValidationResult.has_runtime_error) {
    misconceptions.push({
      id: 'runtime-error-present',
      type: 'runtime_error_present',
      severity: 'error',
      message: 'A runtime error is stopping the program before it can satisfy the lesson.',
      related_event_id: relatedEventId,
      suggested_focus: 'Read the error message and inspect the line that raised it.',
    });
  }

  if (lessonValidationResult.output_status === 'correct' && lessonValidationResult.concepts.missing.length > 0) {
    misconceptions.push({
      id: 'correct-output-missing-concepts',
      type: 'correct_output_missing_concepts',
      severity: 'warning',
      message: 'The output is correct, but the solution is missing required lesson concepts.',
      related_event_id: relatedEventId,
      suggested_focus: `Practice using: ${lessonValidationResult.concepts.missing.join(', ')}.`,
    });
  }

  if (
    lessonValidationResult.output_status === 'incorrect' &&
    lessonValidationResult.concepts.required.includes('if_statement') &&
    currentEvent?.type === 'line_executed'
  ) {
    misconceptions.push({
      id: 'condition-mismatch',
      type: 'condition_mismatch',
      severity: 'warning',
      message: 'The condition may not match the lesson goal yet.',
      related_event_id: relatedEventId,
      suggested_focus: 'Check the comparison or boolean expression that decides this branch.',
    });
  }

  if (
    currentEvent?.type === 'variable_updated' &&
    lessonValidationResult.output_status === 'incorrect'
  ) {
    misconceptions.push({
      id: `variable-updated-unexpectedly-${currentEvent.id}`,
      type: 'variable_updated_unexpectedly',
      severity: 'info',
      message: 'A variable changed while the final output is still incorrect.',
      related_event_id: currentEvent.id,
      suggested_focus: 'Trace the old value and new value to see whether this update supports the expected output.',
    });
  }

  return misconceptions;
}
