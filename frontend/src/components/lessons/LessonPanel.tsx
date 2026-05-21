import { BookOpen, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DEFAULT_SAMPLE_LESSON, SAMPLE_LESSONS } from '../../lessons/sampleLessons';
import { useWorkspaceStore } from '../../stores/workspaceStore';

export function LessonPanel() {
  const activeLesson = useWorkspaceStore((state) => state.activeLesson);
  const loadLesson = useWorkspaceStore((state) => state.loadLesson);
  const resetLesson = useWorkspaceStore((state) => state.resetLesson);
  const [selectedLessonId, setSelectedLessonId] = useState(
    activeLesson?.id ?? DEFAULT_SAMPLE_LESSON.id,
  );
  const lesson = useMemo(
    () =>
      SAMPLE_LESSONS.find((sampleLesson) => sampleLesson.id === selectedLessonId) ??
      activeLesson ??
      DEFAULT_SAMPLE_LESSON,
    [activeLesson, selectedLessonId],
  );
  const isActiveLessonSelected = activeLesson?.id === lesson.id;

  return (
    <section className="lesson-panel" aria-label="Lesson loader">
      <div className="lesson-panel__header">
        <div>
          <span className="lesson-panel__kicker">Lesson library</span>
          <h3>{lesson.title}</h3>
        </div>
        <div className="lesson-panel__actions">
          <button type="button" onClick={() => loadLesson(lesson)}>
            <BookOpen size={15} aria-hidden="true" />
            <span>{isActiveLessonSelected ? 'Reload' : 'Load'}</span>
          </button>
          <button type="button" onClick={resetLesson} disabled={!activeLesson}>
            <RotateCcw size={15} aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <label className="lesson-panel__selector">
        <span>Choose lesson</span>
        <select
          value={selectedLessonId}
          onChange={(event) => setSelectedLessonId(event.target.value)}
        >
          {SAMPLE_LESSONS.map((sampleLesson) => (
            <option key={sampleLesson.id} value={sampleLesson.id}>
              {sampleLesson.title}
            </option>
          ))}
        </select>
      </label>

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
