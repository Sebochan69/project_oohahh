import { ModeToggle } from './ModeToggle';

export function TopBar() {
  return (
    <header className="top-bar">
      <div>
        <p className="top-bar__eyebrow">Workspace shell</p>
        <h1 className="top-bar__title">PROJECT OOH-AHH</h1>
      </div>
      <ModeToggle activeMode="beginner" />
    </header>
  );
}
