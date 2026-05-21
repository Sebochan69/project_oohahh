import type { RuntimeTraceEvent } from '../../types/trace';

type TimelineEventDetailsProps = {
  event: RuntimeTraceEvent | undefined;
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function TimelineEventDetails({ event }: TimelineEventDetailsProps) {
  if (!event) {
    return (
      <section className="timeline-event timeline-event--empty">
        <p>No runtime event selected.</p>
      </section>
    );
  }

  return (
    <section className="timeline-event" aria-label="Current runtime event details">
      <div className="timeline-event__summary">
        <div>
          <span>Step</span>
          <strong>{event.step}</strong>
        </div>
        <div>
          <span>Type</span>
          <strong>{event.type}</strong>
        </div>
        <div>
          <span>File</span>
          <strong>{event.file_path}</strong>
        </div>
        <div>
          <span>Line</span>
          <strong>{event.line_number ?? 'n/a'}</strong>
        </div>
      </div>
      <div className="timeline-event__json-grid">
        <div>
          <h3>scope</h3>
          <pre>{formatJson(event.scope)}</pre>
        </div>
        <div>
          <h3>payload</h3>
          <pre>{formatJson(event.payload)}</pre>
        </div>
      </div>
    </section>
  );
}
