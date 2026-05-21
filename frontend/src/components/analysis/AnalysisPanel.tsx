import { useWorkspaceStore } from '../../stores/workspaceStore';
import { RuntimeGraphCanvas } from '../visualization/RuntimeGraphCanvas';
import { StaticGraphCanvas } from '../visualization/StaticGraphCanvas';

export function AnalysisPanel() {
  const analysisError = useWorkspaceStore((state) => state.analysisError);
  const graphData = useWorkspaceStore((state) => state.graphData);
  const isAnalyzing = useWorkspaceStore((state) => state.isAnalyzing);
  const isTracing = useWorkspaceStore((state) => state.isTracing);
  const runtimeGraphData = useWorkspaceStore((state) => state.runtimeGraphData);

  if (runtimeGraphData && runtimeGraphData.nodes.length > 0) {
    return <RuntimeGraphCanvas graphData={runtimeGraphData} />;
  }

  if (isAnalyzing) {
    return (
      <div className="analysis-panel analysis-panel--status">
        <div className="empty-state-card">
          <span>Static analysis</span>
          <h3>Reading your workspace</h3>
          <p>OOH-AHH is checking files, imports, functions, and classes so it can draw the static graph.</p>
        </div>
      </div>
    );
  }

  if (isTracing) {
    return (
      <div className="analysis-panel analysis-panel--status">
        <div className="empty-state-card">
          <span>Runtime trace</span>
          <h3>Running your code</h3>
          <p>The runtime graph will appear here after execution events are ready.</p>
        </div>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="analysis-panel analysis-panel--error">
        <div className="empty-state-card empty-state-card--error">
          <span>Analyze needs attention</span>
          <h3>Static analysis did not finish</h3>
          <p>{analysisError}</p>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="analysis-panel analysis-panel--empty">
        <div className="empty-state-card">
          <span>Visualization</span>
          <h3>No graph yet</h3>
          <p>Choose a lesson or write Python, then use Analyze for structure or Run / Verify for execution flow.</p>
        </div>
      </div>
    );
  }

  return <StaticGraphCanvas graphData={graphData} />;
}
