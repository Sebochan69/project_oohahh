import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';
import { FileTabs } from './FileTabs';
import { useWorkspaceStore } from '../../stores/workspaceStore';

loader.config({ monaco });

export function CodeEditor() {
  const activeFileName = useWorkspaceStore((state) => state.activeFileName);
  const code = useWorkspaceStore((state) => state.files[state.activeFileName]);
  const updateFileContent = useWorkspaceStore((state) => state.updateFileContent);

  return (
    <div className="code-editor">
      <FileTabs activeFileName={activeFileName} />
      <div className="code-editor__surface">
        <Editor
          path={activeFileName}
          language="python"
          value={code}
          theme="vs-dark"
          onChange={(value) => updateFileContent(activeFileName, value ?? '')}
          options={{
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
