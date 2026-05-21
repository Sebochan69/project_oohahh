import { AnalysisPanel } from '../analysis/AnalysisPanel';
import { AnalyzeButton } from '../analysis/AnalyzeButton';
import { CodeEditor } from '../editor/CodeEditor';
import { FileExplorer } from '../editor/FileExplorer';

export function WorkspaceLayout() {
  return (
    <section className="workspace-layout" aria-label="OOH-AHH workspace layout">
      <aside className="workspace-panel workspace-panel--code" aria-labelledby="code-panel-title">
        <div className="panel-header">
          <span className="panel-kicker">Left panel</span>
          <h2 id="code-panel-title">Code Workspace</h2>
        </div>
        <div className="code-workspace">
          <FileExplorer />
          <CodeEditor />
        </div>
      </aside>

      <main className="workspace-panel workspace-panel--visual" aria-labelledby="visual-panel-title">
        <div className="panel-header panel-header--with-action">
          <div>
            <span className="panel-kicker">Right panel</span>
            <h2 id="visual-panel-title">Static Graph</h2>
          </div>
          <AnalyzeButton />
        </div>
        <AnalysisPanel />
      </main>

      <section className="workspace-panel workspace-panel--timeline" aria-labelledby="timeline-panel-title">
        <div className="panel-header">
          <span className="panel-kicker">Bottom panel</span>
          <h2 id="timeline-panel-title">Timeline / Output</h2>
        </div>
        <div className="placeholder-surface placeholder-surface--timeline">
          <p>Future timeline replay and output placeholder.</p>
        </div>
      </section>
    </section>
  );
}
