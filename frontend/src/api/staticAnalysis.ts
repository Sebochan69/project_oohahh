import type { WorkspaceFile } from '../stores/workspaceStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

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

type AnalyzeStaticRequest = {
  files: WorkspaceFile[];
  entryFile: string;
};

export async function analyzeStatic({ files, entryFile }: AnalyzeStaticRequest): Promise<StaticAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze/static`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entry_file: entryFile,
      files: files.map((file) => ({
        path: file.name,
        content: file.content,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Static analysis failed with status ${response.status}`);
  }

  return (await response.json()) as StaticAnalysisResult;
}
