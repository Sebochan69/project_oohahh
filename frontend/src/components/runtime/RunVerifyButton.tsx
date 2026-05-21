import { PlayCircle } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

export function RunVerifyButton() {
  const isTracing = useWorkspaceStore((state) => state.isTracing);
  const runRuntimeTrace = useWorkspaceStore((state) => state.runRuntimeTrace);

  return (
    <button className="run-button" type="button" disabled={isTracing} onClick={runRuntimeTrace}>
      <PlayCircle size={16} aria-hidden="true" />
      <span>{isTracing ? 'Running' : 'Run / Verify'}</span>
    </button>
  );
}
