import { BookOpen, RotateCcw } from 'lucide-react';
import { DEFAULT_SAMPLE_LESSON } from '../../lessons/sampleLessons';
import { useWorkspaceStore } from '../../stores/workspaceStore';

export function LessonPanel() {
  const activeLesson = useWorkspaceStore((state) => state.activeLesson);
  const loadLesson = useWorkspaceStore((state) => state.loadLesson);
  const resetLesson = useWorkspaceStore((state) => state.resetLesson);
  const lesson = activeLesson ?? DEFAULT_SAMPLE_LESSON;

  return (
    <section className="lesson-panel" aria-label="Lesson loader">
      <div className="lesson-panel__header">
        <div>
          <span className="lesson-panel__kicker">Sample lesson</span>
          <h3>{lesson.title}</h3>
        </div>
        <div className="lesson-panel__actions">
          <button type="button" onClick={() => loadLesson(DEFAULT_SAMPLE_LESSON)}>
            <BookOpen size={15} aria-hidden="true" />
            <span>{activeLesson ? 'Reload' : 'Load'}</span>
          </button>
          <button type="button" onClick={resetLesson} disabled={!activeLesson}>
            <RotateCcw size={15} aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <p className="lesson-panel__description">{lesson.description}</p>

      <dl className="lesson-panel__meta">
        <div>
          <dt>Difficulty</dt>
          <dd>{lesson.difficulty}</dd>
        </div>
        <div>
          <dt>Topic</dt>
          <dd>{lesson.topic}</dd>
        </div>
      </dl>

      <div className="lesson-panel__objectives">
        <span>Objectives</span>
        <ul>
          {lesson.learning_objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
