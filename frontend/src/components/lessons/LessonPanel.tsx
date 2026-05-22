import { BookOpen, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getLessonTrackInfo, lessonsByTrack } from '../../lessons/lessonTracks';
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
  const isBackendLifecycleLesson = lesson.lesson_type === 'backend_lifecycle';
  const isAiRagPipelineLesson = lesson.lesson_type === 'ai_rag_pipeline';
  const trackInfo = getLessonTrackInfo(lesson);
  const lessonGroups = useMemo(() => lessonsByTrack(SAMPLE_LESSONS), []);

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
        <span>Choose track and lesson</span>
        <select
          value={selectedLessonId}
          onChange={(event) => setSelectedLessonId(event.target.value)}
        >
          {lessonGroups.map((group) => (
            <optgroup key={group.track.key} label={group.track.label}>
              {group.lessons.map((sampleLesson) => (
                <option key={sampleLesson.id} value={sampleLesson.id}>
                  {`${group.track.shortLabel} - ${sampleLesson.title}`}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="lesson-panel__track-list" aria-label="Available learning tracks">
        {lessonGroups.map((group) => (
          <div
            key={group.track.key}
            className={`lesson-panel__track-pill ${group.track.key === trackInfo.key ? 'is-active' : ''}`}
          >
            <strong>{group.track.label}</strong>
            <span>{group.track.description}</span>
          </div>
        ))}
      </div>

      {!activeLesson && (
        <div className="lesson-panel__empty-state">
          No lesson loaded yet. Pick one from the library and press Load to replace the in-memory
          files.
        </div>
      )}

      <p className="lesson-panel__description">{lesson.description}</p>

      <div className="lesson-panel__track-card">
        <div className="lesson-panel__track-card-header">
          <span>Current track</span>
          <em>{trackInfo.behaviorLabel}</em>
        </div>
        <strong>{trackInfo.label}</strong>
        <p>{trackInfo.description}</p>
        {trackInfo.isStaticPrototype && (
          <small>This track uses lesson-defined mock data. It does not run a real service or pipeline.</small>
        )}
      </div>

      {isBackendLifecycleLesson && (
        <dl className="lesson-panel__backend-meta">
          <div>
            <dt>Request</dt>
            <dd>{`${lesson.request_method ?? 'GET'} ${lesson.request_path ?? '(missing path)'}`}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{lesson.expected_status_code ?? '(missing)'}</dd>
          </div>
          <div>
            <dt>Expected response</dt>
            <dd>{lesson.expected_response ? JSON.stringify(lesson.expected_response) : '(missing)'}</dd>
          </div>
        </dl>
      )}

      {isAiRagPipelineLesson && (
        <dl className="lesson-panel__backend-meta">
          <div>
            <dt>Query</dt>
            <dd>{lesson.user_query ?? '(missing query)'}</dd>
          </div>
          <div>
            <dt>Documents</dt>
            <dd>{lesson.documents?.length ?? 0}</dd>
          </div>
          <div>
            <dt>Pipeline nodes</dt>
            <dd>{lesson.pipeline_nodes?.length ?? 0}</dd>
          </div>
        </dl>
      )}

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
