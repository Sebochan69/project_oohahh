import { useWorkspaceStore } from '../../stores/workspaceStore';
import { StaticGraphCanvas } from '../visualization/StaticGraphCanvas';

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
        <p>Run static analysis to render the static graph.</p>
      </div>
    );
  }

  return <StaticGraphCanvas graphData={graphData} />;
}
