import { useWorkspaceStore } from '../../stores/workspaceStore';

export function FileTabs() {
  const activeFileName = useWorkspaceStore((state) => state.activeFileName);

  return (
    <div className="file-tabs" aria-label="Open files">
      <button className="file-tab is-active" type="button" aria-current="page">
        {activeFileName}
      </button>
    </div>
  );
}
