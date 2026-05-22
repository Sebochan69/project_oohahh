import type { ThemeMode } from '../../stores/workspaceStore';

type DisplayTogglesProps = {
  onThemeModeChange: (mode: ThemeMode) => void;
  themeMode: ThemeMode;
};

export function DisplayToggles({
  onThemeModeChange,
  themeMode,
}: DisplayTogglesProps) {
  return (
    <div className="display-toggle" aria-label="Theme mode">
      <button
        type="button"
        className={themeMode === 'light' ? 'is-active' : ''}
        aria-pressed={themeMode === 'light'}
        onClick={() => onThemeModeChange('light')}
      >
        Light
      </button>
      <button
        type="button"
        className={themeMode === 'dark' ? 'is-active' : ''}
        aria-pressed={themeMode === 'dark'}
        onClick={() => onThemeModeChange('dark')}
      >
        Dark
      </button>
    </div>
  );
}
