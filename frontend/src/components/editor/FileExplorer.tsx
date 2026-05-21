import { FormEvent, useState } from 'react';
import { FilePlus, Pencil, Trash2 } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

export function FileExplorer() {
  const activeFileName = useWorkspaceStore((state) => state.activeFileName);
  const files = useWorkspaceStore((state) => state.files);
  const createFile = useWorkspaceStore((state) => state.createFile);
  const deleteFile = useWorkspaceStore((state) => state.deleteFile);
  const renameFile = useWorkspaceStore((state) => state.renameFile);
  const selectFile = useWorkspaceStore((state) => state.selectFile);
  const [renamingFileName, setRenamingFileName] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const fileList = Object.values(files).sort((a, b) => a.name.localeCompare(b.name));
  const canDelete = fileList.length > 1;

  function startRename(fileName: string) {
    setRenamingFileName(fileName);
    setDraftName(fileName);
  }

  function finishRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!renamingFileName) {
      return;
    }

    const renamed = renameFile(renamingFileName, draftName);

    if (renamed || draftName.trim() === renamingFileName) {
      setRenamingFileName(null);
      setDraftName('');
    }
  }

  function cancelRename() {
    setRenamingFileName(null);
    setDraftName('');
  }

  return (
    <div className="file-explorer">
      <div className="file-explorer__header">
        <span>Files</span>
        <button className="icon-button" type="button" aria-label="Create new Python file" onClick={createFile}>
          <FilePlus size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="file-explorer__list" role="list" aria-label="Workspace files">
        {fileList.map((file) => {
          const isActive = file.name === activeFileName;
          const isRenaming = file.name === renamingFileName;

          return (
            <div className={isActive ? 'file-row is-active' : 'file-row'} key={file.name} role="listitem">
              {isRenaming ? (
                <form className="rename-form" onSubmit={finishRename}>
                  <input
                    aria-label={`Rename ${file.name}`}
                    autoFocus
                    value={draftName}
                    onBlur={cancelRename}
                    onChange={(event) => setDraftName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        cancelRename();
                      }
                    }}
                  />
                </form>
              ) : (
                <button
                  className="file-row__name"
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => selectFile(file.name)}
                >
                  {file.name}
                </button>
              )}

              {!isRenaming && (
                <div className="file-row__actions">
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Rename ${file.name}`}
                    onClick={() => startRename(file.name)}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Delete ${file.name}`}
                    disabled={!canDelete}
                    onClick={() => deleteFile(file.name)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
