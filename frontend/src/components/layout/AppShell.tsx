import { ReactNode } from 'react';
import { TopBar } from './TopBar';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <TopBar />
      {children}
    </div>
  );
}
