export const VALIDATION_STATES = [
  'not_evaluated',
  'running',
  'correct',
  'partially_correct',
  'incorrect',
  'inherited_error',
] as const;

export type ValidationState = (typeof VALIDATION_STATES)[number];

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
