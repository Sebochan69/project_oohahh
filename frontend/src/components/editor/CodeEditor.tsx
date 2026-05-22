import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';
import { useEffect, useMemo, useRef } from 'react';
import { FileTabs } from './FileTabs';
import { useWorkspaceStore } from '../../stores/workspaceStore';

loader.config({ monaco });

function lineRange(startLineNumber: number, endLineNumber: number) {
  return Array.from(
    { length: Math.max(endLineNumber - startLineNumber + 1, 1) },
    (_, index) => startLineNumber + index,
  );
}

export function CodeEditor() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
  const activeFileName = useWorkspaceStore((state) => state.activeFileName);
  const activeFile = useWorkspaceStore((state) => state.files[state.activeFileName]);
  const codeHighlight = useWorkspaceStore((state) => state.codeHighlight);
  const currentEventIndex = useWorkspaceStore((state) => state.currentEventIndex);
  const runtimeGraphData = useWorkspaceStore((state) => state.runtimeGraphData);
  const traceResult = useWorkspaceStore((state) => state.traceResult);
  const updateFileContent = useWorkspaceStore((state) => state.updateFileContent);
  const activeRuntimeEvent = traceResult?.events[currentEventIndex];
  const activeRuntimeNode = runtimeGraphData?.activeNodeId
    ? runtimeGraphData.nodes.find((node) => node.id === runtimeGraphData.activeNodeId)
    : undefined;
  const effectiveHighlight = useMemo(() => {
    if (codeHighlight) {
      return codeHighlight;
    }

    if (activeRuntimeNode?.data.file_path && activeRuntimeNode.data.line_number) {
      return {
        filePath: activeRuntimeNode.data.file_path,
        lineNumber: activeRuntimeNode.data.line_number,
        lineNumbers: activeRuntimeNode.data.related_lines ?? [],
        label: activeRuntimeNode.data.event_type.replace(/_/g, ' '),
      };
    }

    if (activeRuntimeEvent?.file_path && activeRuntimeEvent.line_number) {
      return {
        filePath: activeRuntimeEvent.file_path,
        lineNumber: activeRuntimeEvent.line_number,
        label: activeRuntimeEvent.type.replace(/_/g, ' '),
      };
    }

    return null;
  }, [activeRuntimeEvent, activeRuntimeNode, codeHighlight]);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    if (!decorationsRef.current) {
      decorationsRef.current = editor.createDecorationsCollection();
    }

    if (
      !effectiveHighlight ||
      effectiveHighlight.filePath !== activeFileName ||
      effectiveHighlight.lineNumber < 1
    ) {
      decorationsRef.current.clear();
      return;
    }

    const model = editor.getModel();
    const lastLineNumber = model?.getLineCount() ?? effectiveHighlight.lineNumber;
    const highlightLineNumbers =
      effectiveHighlight.lineNumbers && effectiveHighlight.lineNumbers.length > 0
        ? effectiveHighlight.lineNumbers
        : lineRange(
            effectiveHighlight.lineNumber,
            effectiveHighlight.endLineNumber ?? effectiveHighlight.lineNumber,
          );
    const normalizedLineNumbers = [...new Set(highlightLineNumbers)]
      .filter((lineNumber) => lineNumber >= 1 && lineNumber <= lastLineNumber)
      .sort((firstLine, secondLine) => firstLine - secondLine);
    const firstHighlightedLine = normalizedLineNumbers[0] ?? Math.min(effectiveHighlight.lineNumber, lastLineNumber);

    decorationsRef.current.set(
      normalizedLineNumbers.map((lineNumber) => ({
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          className: 'code-editor-line-highlight',
          hoverMessage: effectiveHighlight.label ? { value: effectiveHighlight.label } : undefined,
          isWholeLine: true,
          linesDecorationsClassName: 'code-editor-line-highlight-marker',
          overviewRuler: {
            color: '#f59e0b',
            position: monaco.editor.OverviewRulerLane.Full,
          },
        },
      })),
    );
    editor.revealLineInCenterIfOutsideViewport(firstHighlightedLine);
  }, [activeFileName, effectiveHighlight]);

  return (
    <div className="code-editor">
      <FileTabs />
      <div className="code-editor__surface">
        <Editor
          path={activeFileName}
          language="python"
          value={activeFile?.content ?? ''}
          theme="vs-dark"
          onChange={(value) => updateFileContent(activeFileName, value ?? '')}
          onMount={(editor) => {
            editorRef.current = editor;
            decorationsRef.current = editor.createDecorationsCollection();
          }}
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
