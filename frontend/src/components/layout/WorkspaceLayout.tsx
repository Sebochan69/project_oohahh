export function WorkspaceLayout() {
  return (
    <section className="workspace-layout" aria-label="OOH-AHH workspace layout">
      <aside className="workspace-panel workspace-panel--code" aria-labelledby="code-panel-title">
        <div className="panel-header">
          <span className="panel-kicker">Left panel</span>
          <h2 id="code-panel-title">Code Workspace</h2>
        </div>
        <div className="placeholder-surface">
          <p>Future code editor and file workspace placeholder.</p>
        </div>
      </aside>

      <main className="workspace-panel workspace-panel--visual" aria-labelledby="visual-panel-title">
        <div className="panel-header">
          <span className="panel-kicker">Right panel</span>
          <h2 id="visual-panel-title">Visualization Canvas</h2>
        </div>
        <div className="placeholder-surface placeholder-surface--canvas">
          <p>Future execution graph canvas placeholder.</p>
        </div>
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
