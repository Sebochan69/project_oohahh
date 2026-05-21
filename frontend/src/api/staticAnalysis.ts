import type { WorkspaceFile } from '../stores/workspaceStore';
import type { StaticAnalysisResult } from '../types/analysis';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

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
