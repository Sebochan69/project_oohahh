export type MisconceptionType =
  | 'correct_output_missing_concepts'
  | 'condition_mismatch'
  | 'runtime_error_present'
  | 'variable_updated_unexpectedly';

export type MisconceptionSeverity = 'info' | 'warning' | 'error';

export type MisconceptionResult = {
  id: string;
  type: MisconceptionType;
  severity: MisconceptionSeverity;
  message: string;
  related_event_id?: string;
  suggested_focus: string;
};
