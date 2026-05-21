import { useWorkspaceStore } from '../../stores/workspaceStore';

function outputText(value: string) {
  return value || '(empty)';
}

export function RuntimeOutputPanel() {
  const isTracing = useWorkspaceStore((state) => state.isTracing);
  const traceError = useWorkspaceStore((state) => state.traceError);
  const traceResult = useWorkspaceStore((state) => state.traceResult);

  if (isTracing) {
    return (
      <div className="runtime-output runtime-output--status">
        <p>Running controlled trace...</p>
      </div>
    );
  }

  if (traceError) {
    return (
      <div className="runtime-output runtime-output--error">
        <p>{traceError}</p>
      </div>
    );
  }

  if (!traceResult) {
    return (
      <div className="runtime-output runtime-output--empty">
        <p>Run / Verify to inspect stdout, stderr, errors, and runtime events.</p>
      </div>
    );
  }

  return (
    <div className="runtime-output runtime-output--result">
      <section className="runtime-output__section">
        <h3>stdout</h3>
        <pre>{outputText(traceResult.stdout)}</pre>
      </section>
      <section className="runtime-output__section">
        <h3>stderr</h3>
        <pre>{outputText(traceResult.stderr)}</pre>
      </section>
      <section className="runtime-output__section">
        <h3>errors</h3>
        <pre>{JSON.stringify(traceResult.errors, null, 2)}</pre>
      </section>
      <section className="runtime-output__section runtime-output__section--events">
        <h3>events</h3>
        <pre>{JSON.stringify(traceResult.events, null, 2)}</pre>
      </section>
    </div>
  );
}
