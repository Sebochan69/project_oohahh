import type { RuntimeTraceEvent } from '../../types/trace';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { VALIDATION_STATE_LABELS } from '../../types/validation';

type TimelineEventDetailsProps = {
  event: RuntimeTraceEvent | undefined;
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

const EVENT_EXPLANATIONS: Record<string, string> = {
  execution_started: 'Your program started running.',
  line_executed: 'Python ran this line of code.',
  variable_created: 'A new variable was created.',
  variable_updated: 'An existing variable changed value.',
  execution_finished: 'Your program finished running.',
  error_raised: 'Python hit an error while running your code.',
};

function eventExplanation(eventType: string) {
  return EVENT_EXPLANATIONS[eventType] ?? 'A runtime event happened while your program ran.';
}

function payloadValue(payload: Record<string, unknown>, keys: string[]) {
  return keys.map((key) => payload[key]).find((value) => value !== undefined);
}

function variableChangeText(event: RuntimeTraceEvent) {
  if (event.type !== 'variable_created' && event.type !== 'variable_updated') {
    return null;
  }

  const variableName = payloadValue(event.payload, ['name', 'variable', 'variable_name']);
  const oldValue = payloadValue(event.payload, ['old_value', 'oldValue']);
  const newValue = payloadValue(event.payload, ['new_value', 'newValue', 'value']);

  if (!variableName && newValue === undefined) {
    return null;
  }

  if (event.type === 'variable_created') {
    if (typeof newValue === 'string' && newValue.startsWith('<function ') && newValue.endsWith('>')) {
      return `Function ${newValue.replace('<function ', '').replace('>', '')} was defined`;
    }

    return `${String(variableName ?? 'A variable')} became ${formatJson(newValue)}`;
  }

  return `${String(variableName ?? 'A variable')} changed from ${formatJson(oldValue)} to ${formatJson(newValue)}`;
}

export function TimelineEventDetails({ event }: TimelineEventDetailsProps) {
  const learningMode = useWorkspaceStore((state) => state.learningMode);
  const lessonValidationResult = useWorkspaceStore((state) => state.lessonValidationResult);

  if (!event) {
    return (
      <section className="timeline-event timeline-event--empty">
        <span>Timeline</span>
        <h3>No step selected</h3>
        <p>Run your code, then use Next or Play to walk through execution one event at a time.</p>
      </section>
    );
  }

  if (learningMode === 'beginner') {
    const variableChange = variableChangeText(event);

    return (
      <section className="timeline-event timeline-event--beginner" aria-label="Current runtime event details">
        <div className="timeline-event__beginner-main">
          <span>{event.type.replace(/_/g, ' ')}</span>
          <h3>{eventExplanation(event.type)}</h3>
          {event.line_number && <p>Current line: {event.line_number}</p>}
          {variableChange && <p>{variableChange}</p>}
        </div>
        <div className="timeline-event__validation">
          <span>Validation</span>
          <strong>{VALIDATION_STATE_LABELS[lessonValidationResult.status]}</strong>
          <p>{lessonValidationResult.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="timeline-event timeline-event--engineer" aria-label="Current runtime event details">
      <div className="timeline-event__summary">
        <div>
          <span>Event ID</span>
          <strong>{event.id}</strong>
        </div>
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
          <h3>validation</h3>
          <pre>{formatJson(event.validation ?? { status: lessonValidationResult.status })}</pre>
        </div>
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
