import { ReactNode } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { TopBar } from './TopBar';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const themeMode = useWorkspaceStore((state) => state.themeMode);

  return (
    <div className="app-shell" data-theme={themeMode}>
      <TopBar />
      {children}
    </div>
  );
}
