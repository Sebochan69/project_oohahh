import { useWorkspaceStore } from '../../stores/workspaceStore';
import { ModeToggle } from './ModeToggle';

export function TopBar() {
  const learningMode = useWorkspaceStore((state) => state.learningMode);
  const setLearningMode = useWorkspaceStore((state) => state.setLearningMode);

  return (
    <header className="top-bar">
      <div>
        <p className="top-bar__eyebrow">Workspace shell</p>
        <h1 className="top-bar__title">PROJECT OOH-AHH</h1>
      </div>
      <ModeToggle activeMode={learningMode} onModeChange={setLearningMode} />
    </header>
  );
}
