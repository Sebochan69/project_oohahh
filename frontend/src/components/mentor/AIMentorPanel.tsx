import { Lightbulb, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { requestMentorResponse } from '../../api/mentor';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import type { MentorAction, MentorResponse as BackendMentorResponse } from '../../types/mentor';
import type { RuntimeTraceEvent } from '../../types/trace';
import { detectMisconceptions } from '../../utils/detectMisconceptions';

type MentorResponseKind = 'explanation' | 'hint';

type MentorResponse = {
  kind: MentorResponseKind;
  message: string;
  backendResponse?: BackendMentorResponse;
  source: 'backend' | 'local_fallback';
};

const EVENT_EXPLANATIONS: Record<string, string> = {
  execution_started: 'Your program began running from the selected entry file.',
  line_executed: 'Python executed this line and moved the program forward.',
  variable_created: 'A new variable appeared in memory with its first value.',
  variable_updated: 'A variable changed because the program assigned it a new value.',
  execution_finished: 'Your program reached the end of execution.',
  error_raised: 'Python stopped because it encountered an error.',
};

function payloadValue(event: RuntimeTraceEvent | undefined, keys: string[]) {
  return keys.map((key) => event?.payload[key]).find((value) => value !== undefined);
}

function explainEvent(event: RuntimeTraceEvent | undefined) {
  if (!event) {
    return 'Run your code, then choose a timeline step so I can explain what happened.';
  }

  if (event.type === 'variable_updated') {
    const variableName = payloadValue(event, ['name', 'variable', 'variable_name']);
    return `This variable was updated because execution reached another assignment for ${String(
      variableName ?? 'that value',
    )}.`;
  }

  if (event.type === 'variable_created') {
    const variableName = payloadValue(event, ['name', 'variable', 'variable_name']);
    return `Python created ${String(variableName ?? 'a variable')} when this assignment ran.`;
  }

  return EVENT_EXPLANATIONS[event.type] ?? 'This runtime event records one step of your program execution.';
}

function hintFromContext(
  event: RuntimeTraceEvent | undefined,
  missingConcepts: string[],
  hasRuntimeError: boolean,
  outputStatus: string,
) {
  if (hasRuntimeError) {
    return 'Start with the runtime error. Read the line number, then check the expression or name used there.';
  }

  if (missingConcepts.length > 0) {
    return `Your output may be close, but the lesson still expects: ${missingConcepts.join(', ')}.`;
  }

  if (outputStatus === 'incorrect') {
    return 'Compare your printed text with the expected stdout. Spelling, capitalization, and extra text matter.';
  }

  if (event?.type === 'line_executed') {
    return 'Look at this line and ask what value it produces or changes before the next step.';
  }

  return 'Check whether the current step supports the lesson goal before changing more code.';
}

export function AIMentorPanel() {
  const activeLesson = useWorkspaceStore((state) => state.activeLesson);
  const currentEventIndex = useWorkspaceStore((state) => state.currentEventIndex);
  const learningMode = useWorkspaceStore((state) => state.learningMode);
  const lessonValidationResult = useWorkspaceStore((state) => state.lessonValidationResult);
  const runtimeGraphData = useWorkspaceStore((state) => state.runtimeGraphData);
  const traceResult = useWorkspaceStore((state) => state.traceResult);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<MentorResponse | null>(null);
  const currentEvent = traceResult?.events[currentEventIndex];
  const activeRuntimeNode = useMemo(
    () => runtimeGraphData?.nodes.find((node) => node.id === runtimeGraphData.activeNodeId),
    [runtimeGraphData],
  );
  const misconceptions = useMemo(
    () =>
      detectMisconceptions({
        currentEvent,
        lessonValidationResult,
        activeRuntimeNode: activeRuntimeNode?.data,
      }),
    [activeRuntimeNode, currentEvent, lessonValidationResult],
  );
  const hasRuntimeContext = Boolean(currentEvent || activeRuntimeNode);

  function lessonContext() {
    if (!activeLesson) {
      return undefined;
    }

    return {
      id: activeLesson.id,
      title: activeLesson.title,
      description: activeLesson.description,
      topic: activeLesson.topic,
      difficulty: activeLesson.difficulty,
      learning_objectives: activeLesson.learning_objectives,
      required_concepts: activeLesson.required_concepts,
    };
  }

  function localFallback(action: MentorAction) {
    return action === 'explain_this'
      ? explainEvent(currentEvent)
      : hintFromContext(
          currentEvent,
          lessonValidationResult.concepts.missing,
          lessonValidationResult.has_runtime_error,
          lessonValidationResult.output_status,
        );
  }

  async function askMentor(action: MentorAction) {
    const kind: MentorResponseKind = action === 'explain_this' ? 'explanation' : 'hint';

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const backendResponse = await requestMentorResponse({
        action,
        mode: learningMode,
        selected_event: currentEvent,
        selected_node: activeRuntimeNode?.data,
        validation_summary: lessonValidationResult,
        misconceptions,
        lesson: lessonContext(),
      });

      setResponse({
        kind,
        message: backendResponse.message,
        backendResponse,
        source: 'backend',
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Mentor request failed.');
      setResponse({
        kind,
        message: localFallback(action),
        source: 'local_fallback',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <aside className="ai-mentor-panel" aria-label="AI Mentor panel">
      <div className="ai-mentor-panel__header">
        <div>
          <span>AI Mentor</span>
          <h3>Local guidance</h3>
        </div>
        <div className="ai-mentor-panel__actions">
          <button type="button" onClick={() => void askMentor('explain_this')} disabled={isLoading}>
            <MessageCircle size={15} aria-hidden="true" />
            <span>Explain This</span>
          </button>
          <button type="button" onClick={() => void askMentor('give_hint')} disabled={isLoading}>
            <Lightbulb size={15} aria-hidden="true" />
            <span>Give Hint</span>
          </button>
        </div>
      </div>

      <div className="ai-mentor-panel__context">
        <span>{activeLesson ? activeLesson.title : 'No lesson loaded'}</span>
        <span>
          {hasRuntimeContext ? `Step ${currentEvent?.step ?? activeRuntimeNode?.data.step}` : 'No runtime step yet'}
        </span>
        <span>{lessonValidationResult.status.replace(/_/g, ' ')}</span>
      </div>

      {isLoading && <div className="ai-mentor-panel__status">Preparing a focused mentor response...</div>}
      {errorMessage && (
        <div className="ai-mentor-panel__error">
          Mentor backend was unavailable: {errorMessage}. Showing local guidance instead.
        </div>
      )}

      <div className="ai-mentor-panel__response">
        {response ? (
          <>
            <span>{response.kind} - {response.source === 'backend' ? 'backend' : 'local fallback'}</span>
            <p>{response.message}</p>
            {response.backendResponse && <small>{response.backendResponse.next_suggested_action}</small>}
          </>
        ) : (
          <>
            <span>Waiting for a question</span>
            <p>
              Run code, select a timeline step, then ask for an explanation or a hint. The mentor
              will use the current lesson, validation result, and selected event.
            </p>
          </>
        )}
      </div>

      <div className="ai-mentor-panel__misconceptions">
        <span>Possible misconceptions</span>
        {misconceptions.length > 0 ? (
          <ul>
            {misconceptions.map((misconception) => (
              <li key={misconception.id} className={`ai-mentor-panel__misconception is-${misconception.severity}`}>
                <strong>{misconception.message}</strong>
                <p>{misconception.suggested_focus}</p>
                {misconception.related_event_id && <small>Related event: {misconception.related_event_id}</small>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No local misconception pattern detected yet.</p>
        )}
      </div>
    </aside>
  );
}
