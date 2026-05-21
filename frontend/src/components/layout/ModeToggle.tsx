type ModeToggleProps = {
  activeMode: 'beginner' | 'engineer';
};

export function ModeToggle({ activeMode }: ModeToggleProps) {
  return (
    <div className="mode-toggle" aria-label="Learning mode toggle placeholder">
      <button
        className={activeMode === 'beginner' ? 'mode-toggle__option is-active' : 'mode-toggle__option'}
        type="button"
        aria-pressed={activeMode === 'beginner'}
      >
        Beginner
      </button>
      <button
        className={activeMode === 'engineer' ? 'mode-toggle__option is-active' : 'mode-toggle__option'}
        type="button"
        aria-pressed={activeMode === 'engineer'}
      >
        Engineer
      </button>
    </div>
  );
}
