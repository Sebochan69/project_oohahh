import { useWorkspaceStore } from '../../stores/workspaceStore';
import { DisplayToggles } from './DisplayToggles';
import { ModeToggle } from './ModeToggle';

export function TopBar() {
  const learningMode = useWorkspaceStore((state) => state.learningMode);
  const setLearningMode = useWorkspaceStore((state) => state.setLearningMode);
  const setThemeMode = useWorkspaceStore((state) => state.setThemeMode);
  const themeMode = useWorkspaceStore((state) => state.themeMode);

  return (
    <header className="top-bar">
      <div>
        <p className="top-bar__eyebrow">Workspace shell</p>
        <h1 className="top-bar__title">PROJECT OOH-AHH</h1>
      </div>
      <div className="top-bar__controls">
        <DisplayToggles
          onThemeModeChange={setThemeMode}
          themeMode={themeMode}
        />
        <ModeToggle activeMode={learningMode} onModeChange={setLearningMode} />
      </div>
    </header>
  );
}
