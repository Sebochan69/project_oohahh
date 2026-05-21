export type StaticAnalysisFileSummary = {
  path: string;
  line_count: number;
  character_count: number;
  is_entry: boolean;
};

export type StaticAnalysisImport = {
  file_path: string;
  module: string;
  name?: string | null;
  import_type?: string;
  line_number: number | null;
};

export type StaticAnalysisFunction = {
  file_path: string;
  name: string;
  line_number: number | null;
  argument_names?: string[];
};

export type StaticAnalysisClass = {
  file_path: string;
  name: string;
  line_number: number | null;
};

export type StaticAnalysisError = {
  file_path: string | null;
  message: string;
  line_number: number | null;
};

export type StaticAnalysisResult = {
  files: StaticAnalysisFileSummary[];
  imports: StaticAnalysisImport[];
  functions: StaticAnalysisFunction[];
  classes?: StaticAnalysisClass[];
  errors: StaticAnalysisError[];
};
