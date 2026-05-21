import { useWorkspaceStore } from '../../stores/workspaceStore';
import { VALIDATION_STATE_LABELS, validationStateClassName } from '../../types/validation';

export function LessonValidationSummary() {
  const activeLesson = useWorkspaceStore((state) => state.activeLesson);
  const lessonValidationResult = useWorkspaceStore((state) => state.lessonValidationResult);
  const statusClassName = validationStateClassName(lessonValidationResult.status);

  return (
    <section className={`lesson-validation-summary ${statusClassName}`} aria-label="Lesson validation result">
      <div>
        <span>Lesson validation</span>
        <h3>{VALIDATION_STATE_LABELS[lessonValidationResult.status]}</h3>
      </div>
      <p>{lessonValidationResult.message}</p>
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
