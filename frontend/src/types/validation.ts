export const VALIDATION_STATES = [
  'not_evaluated',
  'running',
  'correct',
  'partially_correct',
  'incorrect',
  'inherited_error',
] as const;

export type ValidationState = (typeof VALIDATION_STATES)[number];

export type LessonValidationStatus = Extract<
  ValidationState,
  'not_evaluated' | 'correct' | 'partially_correct' | 'incorrect'
>;

export type OutputValidationStatus = Extract<ValidationState, 'not_evaluated' | 'correct' | 'incorrect'>;

export type RequiredConceptKey =
  | 'print_statement'
  | 'variable_assignment'
  | 'for_loop'
  | 'if_statement'
  | 'function_definition'
  | 'function_call'
  | 'list_usage'
  | 'dict_usage';

export type ConceptValidationResult = {
  required: string[];
  found: string[];
  missing: string[];
};

export type LessonValidationResult = {
  status: LessonValidationStatus;
  message: string;
  expected_stdout?: string;
  actual_stdout?: string;
  output_status: OutputValidationStatus;
  concepts: ConceptValidationResult;
  has_runtime_error: boolean;
  runtime_error_messages: string[];
};

export type BackendLifecycleValidationCheck = {
  id: string;
  label: string;
  state: LessonValidationStatus;
  message: string;
  related_node_type?: string;
};

export type BackendLifecycleValidationResult = {
  status: LessonValidationStatus;
  message: string;
  checks: BackendLifecycleValidationCheck[];
  missing_lifecycle_nodes: string[];
};

export type RagValidationCheck = {
  id: string;
  label: string;
  state: LessonValidationStatus;
  beginner_message: string;
  engineer_message: string;
  related_node_type?: string;
};

export type RagValidationResult = {
  status: LessonValidationStatus;
  beginner_message: string;
  engineer_message: string;
  checks: RagValidationCheck[];
  risk_count: number;
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
