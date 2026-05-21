export type RuntimeTraceEvent = {
  id: string;
  type: string;
  timestamp: string;
  step: number;
  file_path: string;
  line_number: number | null;
  scope: Record<string, unknown>;
  payload: Record<string, unknown>;
  visual: Record<string, unknown>;
  validation: Record<string, unknown> | null;
};

export type RuntimeTraceError = {
  file_path: string | null;
  message: string;
  line_number: number | null;
};

export type RuntimeTraceResult = {
  events: RuntimeTraceEvent[];
  stdout: string;
  stderr: string;
  errors: RuntimeTraceError[];
};
