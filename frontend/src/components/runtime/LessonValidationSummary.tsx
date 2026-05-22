import { useWorkspaceStore } from '../../stores/workspaceStore';
import { VALIDATION_STATE_LABELS, validationStateClassName } from '../../types/validation';

export function LessonValidationSummary() {
  const activeLesson = useWorkspaceStore((state) => state.activeLesson);
  const lessonValidationResult = useWorkspaceStore((state) => state.lessonValidationResult);
  const statusClassName = validationStateClassName(lessonValidationResult.status);

  if (!activeLesson) {
    return (
      <section className="lesson-validation-summary lesson-validation-summary--sandbox" aria-label="Sandbox mode">
        <div>
          <span>Sandbox Mode</span>
          <h3>Execution health</h3>
        </div>
        <p>
          Runtime Flow grades whether execution completed cleanly. Load a lesson when you want goal-based
          correctness checks.
        </p>
        <dl>
          <div>
            <dt>Output</dt>
            <dd>Captured</dd>
          </div>
          <div>
            <dt>Runtime errors</dt>
            <dd>{lessonValidationResult.has_runtime_error ? 'Present' : 'None'}</dd>
          </div>
        </dl>
      </section>
    );
  }

  return (
    <section className={`lesson-validation-summary ${statusClassName}`} aria-label="Lesson validation result">
      <div>
        <span>Lesson validation</span>
        <h3>{VALIDATION_STATE_LABELS[lessonValidationResult.status]}</h3>
      </div>
      <p>{lessonValidationResult.message}</p>
      <dl>
        <div>
          <dt>Output</dt>
          <dd>{VALIDATION_STATE_LABELS[lessonValidationResult.output_status]}</dd>
        </div>
        <div>
          <dt>Runtime errors</dt>
          <dd>{lessonValidationResult.has_runtime_error ? 'Present' : 'None'}</dd>
        </div>
      </dl>
      {activeLesson && lessonValidationResult.expected_stdout !== undefined && (
        <dl>
          <div>
            <dt>Expected stdout</dt>
            <dd>{lessonValidationResult.expected_stdout || '(empty)'}</dd>
          </div>
          <div>
            <dt>Actual stdout</dt>
            <dd>{lessonValidationResult.actual_stdout || '(empty)'}</dd>
          </div>
        </dl>
      )}
      {lessonValidationResult.runtime_error_messages.length > 0 && (
        <div className="lesson-validation-summary__errors">
          <span>Runtime error details</span>
          <ul>
            {lessonValidationResult.runtime_error_messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      {activeLesson && lessonValidationResult.concepts.required.length > 0 && (
        <div className="lesson-validation-summary__concepts">
          <div>
            <span>Found concepts</span>
            <ul>
              {lessonValidationResult.concepts.found.length > 0 ? (
                lessonValidationResult.concepts.found.map((concept) => <li key={concept}>{concept}</li>)
              ) : (
                <li>None yet</li>
              )}
            </ul>
          </div>
          <div>
            <span>Missing concepts</span>
            <ul>
              {lessonValidationResult.concepts.missing.length > 0 ? (
                lessonValidationResult.concepts.missing.map((concept) => <li key={concept}>{concept}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
