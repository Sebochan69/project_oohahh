import { useWorkspaceStore } from '../../stores/workspaceStore';
import { LessonValidationSummary } from './LessonValidationSummary';
import { TimelineControls } from '../timeline/TimelineControls';
import { TimelineEventDetails } from '../timeline/TimelineEventDetails';

function outputText(value: string) {
  return value || '(empty)';
}

export function RuntimeOutputPanel() {
  const isTracing = useWorkspaceStore((state) => state.isTracing);
  const traceError = useWorkspaceStore((state) => state.traceError);
  const traceResult = useWorkspaceStore((state) => state.traceResult);
  const currentEventIndex = useWorkspaceStore((state) => state.currentEventIndex);
  const runtimeGraphData = useWorkspaceStore((state) => state.runtimeGraphData);

  if (isTracing) {
    return (
      <div className="runtime-output runtime-output--status">
        <div className="empty-state-card">
          <span>Run / Verify</span>
          <h3>Executing safely</h3>
          <p>Capturing stdout, errors, variable changes, and timeline events.</p>
        </div>
      </div>
    );
  }

  if (traceError) {
    return (
      <div className="runtime-output runtime-output--error">
        <div className="empty-state-card empty-state-card--error">
          <span>Run needs attention</span>
          <h3>Runtime request did not finish</h3>
          <p>{traceError}</p>
        </div>
      </div>
    );
  }

  if (!traceResult) {
    return (
      <div className="runtime-output runtime-output--result">
        <div className="runtime-output__timeline">
          <TimelineControls />
          <TimelineEventDetails event={undefined} />
        </div>
        <div className="runtime-output__empty-message">
          <span>Runtime output</span>
          <h3>No trace yet</h3>
          <p>
            Press Run / Verify to see stdout, stderr, execution-health grading, and step-by-step
            events. Load a lesson when you want goal-based correctness validation.
          </p>
        </div>
      </div>
    );
  }

  const currentEvent = traceResult.events[currentEventIndex];

  return (
    <div className="runtime-output runtime-output--result">
      <div className="runtime-output__timeline">
        <TimelineControls />
        <TimelineEventDetails event={currentEvent} />
      </div>
      <LessonValidationSummary />
      <div className="runtime-output__streams">
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
        <section className="runtime-output__section runtime-output__section--runtime-graph">
          <h3>runtime graph</h3>
          <pre>{JSON.stringify(runtimeGraphData, null, 2)}</pre>
        </section>
      </div>
    </div>
  );
}
