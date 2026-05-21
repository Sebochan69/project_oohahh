export const VALIDATION_STATES = [
  'not_evaluated',
  'running',
  'correct',
  'partially_correct',
  'incorrect',
  'inherited_error',
] as const;

export type ValidationState = (typeof VALIDATION_STATES)[number];

export type LessonValidationStatus = Extract<ValidationState, 'not_evaluated' | 'correct' | 'incorrect'>;

export type LessonValidationResult = {
  status: LessonValidationStatus;
  message: string;
  expected_stdout?: string;
  actual_stdout?: string;
};

export const DEFAULT_VALIDATION_STATE: ValidationState = 'not_evaluated';

export const VALIDATION_STATE_LABELS: Record<ValidationState, string> = {
  not_evaluated: 'Not evaluated',
  running: 'Running',
  correct: 'Correct',
  partially_correct: 'Partially correct',
  incorrect: 'Incorrect',
  inherited_error: 'Inherited error',
};

export function validationStateClassName(validation_state: ValidationState) {
  return `validation-state--${validation_state}`;
}
