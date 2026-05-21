import { useWorkspaceStore } from '../../stores/workspaceStore';

export function AnalysisPanel() {
  const analysisError = useWorkspaceStore((state) => state.analysisError);
  const graphData = useWorkspaceStore((state) => state.graphData);
  const isAnalyzing = useWorkspaceStore((state) => state.isAnalyzing);

  if (isAnalyzing) {
    return (
      <div className="analysis-panel analysis-panel--status">
        <p>Analyzing workspace files...</p>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="analysis-panel analysis-panel--error">
        <p>{analysisError}</p>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="analysis-panel analysis-panel--empty">
        <p>Run static analysis to generate graph-ready JSON.</p>
      </div>
    );
  }

  return (
    <pre className="analysis-panel analysis-panel--result">
      {JSON.stringify(graphData, null, 2)}
    </pre>
  );
}
