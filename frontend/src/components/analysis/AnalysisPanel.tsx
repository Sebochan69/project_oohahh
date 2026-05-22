import { useWorkspaceStore } from '../../stores/workspaceStore';
import { getLessonTrackKey, getLessonTrackInfo } from '../../lessons/lessonTracks';
import { BackendLifecycleCanvas } from '../visualization/BackendLifecycleCanvas';
import { RagPipelineCanvas } from '../visualization/RagPipelineCanvas';
import { RuntimeGraphCanvas } from '../visualization/RuntimeGraphCanvas';
import { StaticGraphCanvas } from '../visualization/StaticGraphCanvas';

const PYTHON_VISUALIZATION_MODES = [
  {
    key: 'structure',
    label: 'Structure',
    description: 'Files, functions, classes, and imports from static analysis.',
  },
  {
    key: 'call_flow',
    label: 'Call Flow',
    description: 'Top-level code, function calls, and call targets from static analysis.',
  },
  {
    key: 'runtime_flow',
    label: 'Runtime Flow',
    description: 'Executed runtime events from Run / Verify.',
  },
] as const;

export function AnalysisPanel() {
  const analysisError = useWorkspaceStore((state) => state.analysisError);
  const callFlowGraphData = useWorkspaceStore((state) => state.callFlowGraphData);
  const graphData = useWorkspaceStore((state) => state.graphData);
  const isAnalyzing = useWorkspaceStore((state) => state.isAnalyzing);
  const isTracing = useWorkspaceStore((state) => state.isTracing);
  const pythonVisualizationMode = useWorkspaceStore((state) => state.pythonVisualizationMode);
  const runtimeGraphData = useWorkspaceStore((state) => state.runtimeGraphData);
  const setPythonVisualizationMode = useWorkspaceStore((state) => state.setPythonVisualizationMode);
  const activeLesson = useWorkspaceStore((state) => state.activeLesson);
  const activeTrack = activeLesson ? getLessonTrackKey(activeLesson) : 'python_foundation';
  const activeTrackInfo = activeLesson ? getLessonTrackInfo(activeLesson) : null;
  const isBackendLifecycleLesson = activeTrack === 'backend_lifecycle';
  const isAiRagPipelineLesson = activeTrack === 'ai_rag_pipeline';
  const isUnsupportedLesson = activeTrack === 'unsupported';

  function renderPythonVisualization() {
    if (pythonVisualizationMode === 'runtime_flow') {
      if (runtimeGraphData && runtimeGraphData.nodes.length > 0) {
        return <RuntimeGraphCanvas graphData={runtimeGraphData} />;
      }

      return (
        <div className="analysis-panel analysis-panel--empty">
          <div className="empty-state-card">
            <span>Runtime Flow</span>
            <h3>No runtime graph yet</h3>
            <p>Click Run / Verify to collect execution events, then this view will show runtime flow.</p>
          </div>
        </div>
      );
    }

    if (pythonVisualizationMode === 'call_flow') {
      if (callFlowGraphData && callFlowGraphData.nodes.length > 0) {
        return <StaticGraphCanvas graphData={callFlowGraphData} />;
      }

      return (
        <div className="analysis-panel analysis-panel--empty">
          <div className="empty-state-card">
            <span>Call Flow</span>
            <h3>No call graph yet</h3>
            <p>Click Analyze to detect top-level calls, helper functions, and call targets in your Python files.</p>
          </div>
        </div>
      );
    }

    if (!graphData) {
      return (
        <div className="analysis-panel analysis-panel--empty">
          <div className="empty-state-card">
            <span>Structure</span>
            <h3>No graph yet</h3>
            <p>Choose a lesson or write Python, then use Analyze for structure or Run / Verify for execution flow.</p>
          </div>
        </div>
      );
    }

    return <StaticGraphCanvas graphData={graphData} />;
  }

  if (activeLesson && isBackendLifecycleLesson) {
    return (
      <div className="backend-lifecycle-view">
        <div className="backend-lifecycle-view__toolbar">
          <div>
            <span>Backend Lifecycle - static/mock</span>
            <h3>{activeLesson.title}</h3>
            <p>{activeTrackInfo?.description}</p>
          </div>
        </div>
        <BackendLifecycleCanvas lesson={activeLesson} />
      </div>
    );
  }

  if (activeLesson && isAiRagPipelineLesson) {
    return (
      <div className="rag-pipeline-view">
        <div className="rag-pipeline-view__toolbar">
          <div>
            <span>AI/RAG Pipeline - static/mock</span>
            <h3>{activeLesson.title}</h3>
            <p>{activeTrackInfo?.description}</p>
          </div>
        </div>
        <RagPipelineCanvas lesson={activeLesson} />
      </div>
    );
  }

  if (isUnsupportedLesson) {
    return (
      <div className="analysis-panel analysis-panel--empty">
        <div className="empty-state-card">
          <span>{activeTrackInfo?.label ?? 'Unsupported Track'}</span>
          <h3>Lesson type not supported yet</h3>
          <p>
            This lesson uses a track that the current OOH-AHH prototype cannot render. Choose a
            Python Foundations, Backend Lifecycle, or AI/RAG Pipeline lesson.
          </p>
        </div>
      </div>
    );
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

  return (
    <div className="python-visualization-view">
      <div className="python-visualization-toolbar">
        <div>
          <span>Python visualization</span>
          <h3>{PYTHON_VISUALIZATION_MODES.find((mode) => mode.key === pythonVisualizationMode)?.label}</h3>
          <p>{PYTHON_VISUALIZATION_MODES.find((mode) => mode.key === pythonVisualizationMode)?.description}</p>
        </div>
        <div className="python-visualization-toggle" aria-label="Python visualization mode">
          {PYTHON_VISUALIZATION_MODES.map((mode) => (
            <button
              key={mode.key}
              type="button"
              className={mode.key === pythonVisualizationMode ? 'is-active' : ''}
              onClick={() => setPythonVisualizationMode(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      {renderPythonVisualization()}
    </div>
  );
}
