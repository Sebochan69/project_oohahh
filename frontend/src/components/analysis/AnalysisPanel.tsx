import { useWorkspaceStore } from '../../stores/workspaceStore';
import { RuntimeGraphCanvas } from '../visualization/RuntimeGraphCanvas';
import { StaticGraphCanvas } from '../visualization/StaticGraphCanvas';

export function AnalysisPanel() {
  const analysisError = useWorkspaceStore((state) => state.analysisError);
  const graphData = useWorkspaceStore((state) => state.graphData);
  const isAnalyzing = useWorkspaceStore((state) => state.isAnalyzing);
  const runtimeGraphData = useWorkspaceStore((state) => state.runtimeGraphData);

  if (runtimeGraphData && runtimeGraphData.nodes.length > 0) {
    return <RuntimeGraphCanvas graphData={runtimeGraphData} />;
  }

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
        <p>Run static analysis to render the static graph, or Run / Verify to render runtime flow.</p>
      </div>
    );
  }

  return <StaticGraphCanvas graphData={graphData} />;
}
