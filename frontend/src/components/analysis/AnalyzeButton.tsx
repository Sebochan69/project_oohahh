import { SearchCode } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

export function AnalyzeButton() {
  const runStaticAnalysis = useWorkspaceStore((state) => state.runStaticAnalysis);
  const isAnalyzing = useWorkspaceStore((state) => state.isAnalyzing);

  return (
    <button className="analyze-button" type="button" disabled={isAnalyzing} onClick={runStaticAnalysis}>
      <SearchCode size={16} aria-hidden="true" />
      <span>{isAnalyzing ? 'Analyzing' : 'Analyze'}</span>
    </button>
  );
}
