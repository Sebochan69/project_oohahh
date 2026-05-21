import type { LessonMode } from '../../types/lesson';

type ModeToggleProps = {
  activeMode: LessonMode;
  onModeChange: (mode: LessonMode) => void;
};

export function ModeToggle({ activeMode, onModeChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle" aria-label="Learning mode toggle">
      <button
        className={activeMode === 'beginner' ? 'mode-toggle__option is-active' : 'mode-toggle__option'}
        type="button"
        aria-pressed={activeMode === 'beginner'}
        onClick={() => onModeChange('beginner')}
      >
        Beginner
      </button>
      <button
        className={activeMode === 'engineer' ? 'mode-toggle__option is-active' : 'mode-toggle__option'}
        type="button"
        aria-pressed={activeMode === 'engineer'}
        onClick={() => onModeChange('engineer')}
      >
        Engineer
      </button>
    </div>
  );
}
