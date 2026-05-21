import { create } from 'zustand';
import { runRuntimeTrace as requestRuntimeTrace } from '../api/runtimeTrace';
import { analyzeStatic } from '../api/staticAnalysis';
import type { StaticAnalysisResult } from '../types/analysis';
import type { StaticGraphData } from '../types/graph';
import type { RuntimeTraceResult } from '../types/trace';
import { buildStaticGraph } from '../utils/buildStaticGraph';

const STARTER_CODE = 'print("Welcome to OOH-AHH")';

export type WorkspaceFile = {
  name: string;
  content: string;
};

type WorkspaceState = {
  activeFileName: string;
  analysisError: string | null;
  analysisResult: StaticAnalysisResult | null;
  files: Record<string, WorkspaceFile>;
  graphData: StaticGraphData | null;
  isAnalyzing: boolean;
  isTracing: boolean;
  traceError: string | null;
  traceResult: RuntimeTraceResult | null;
  createFile: () => void;
  deleteFile: (fileName: string) => void;
  renameFile: (oldName: string, nextName: string) => boolean;
  runRuntimeTrace: () => Promise<void>;
  runStaticAnalysis: () => Promise<void>;
  selectFile: (fileName: string) => void;
  updateFileContent: (fileName: string, content: string) => void;
};

function createUntitledFileName(files: Record<string, WorkspaceFile>) {
  let index = 1;
  let fileName = 'untitled.py';

  while (files[fileName]) {
    index += 1;
    fileName = `untitled-${index}.py`;
  }

  return fileName;
}

function normalizePythonFileName(fileName: string) {
  const trimmedName = fileName.trim();

  if (!trimmedName) {
    return '';
  }

  return trimmedName.endsWith('.py') ? trimmedName : `${trimmedName}.py`;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeFileName: 'main.py',
  analysisError: null,
  analysisResult: null,
  files: {
    'main.py': {
      name: 'main.py',
      content: STARTER_CODE,
    },
  },
  graphData: null,
  isAnalyzing: false,
  isTracing: false,
  traceError: null,
  traceResult: null,
  createFile: () =>
    set((state) => {
      const fileName = createUntitledFileName(state.files);

      return {
        activeFileName: fileName,
        files: {
          ...state.files,
          [fileName]: {
            name: fileName,
            content: '',
          },
        },
      };
    }),
  deleteFile: (fileName) =>
    set((state) => {
      if (!state.files[fileName] || Object.keys(state.files).length === 1) {
        return state;
      }

      const { [fileName]: _deletedFile, ...remainingFiles } = state.files;
      const activeFileName =
        state.activeFileName === fileName ? Object.keys(remainingFiles)[0] : state.activeFileName;

      return {
        activeFileName,
        files: remainingFiles,
      };
    }),
  renameFile: (oldName, nextName) => {
    let didRename = false;

    set((state) => {
      const normalizedName = normalizePythonFileName(nextName);

      if (!normalizedName || !state.files[oldName] || state.files[normalizedName]) {
        return state;
      }

      const { [oldName]: currentFile, ...remainingFiles } = state.files;
      didRename = true;

      return {
        activeFileName: state.activeFileName === oldName ? normalizedName : state.activeFileName,
        files: {
          ...remainingFiles,
          [normalizedName]: {
            ...currentFile,
            name: normalizedName,
          },
        },
      };
    });

    return didRename;
  },
  runRuntimeTrace: async () => {
    const { activeFileName, files } = useWorkspaceStore.getState();

    set({
      isTracing: true,
      traceError: null,
    });

    try {
      const traceResult = await requestRuntimeTrace({
        entryFile: activeFileName,
        files: Object.values(files),
      });

      set({
        isTracing: false,
        traceResult,
      });
    } catch (error) {
      set({
        isTracing: false,
        traceError: error instanceof Error ? error.message : 'Runtime trace request failed.',
      });
    }
  },
  runStaticAnalysis: async () => {
    const { activeFileName, files } = useWorkspaceStore.getState();

    set({
      analysisError: null,
      graphData: null,
      isAnalyzing: true,
    });

    try {
      const analysisResult = await analyzeStatic({
        entryFile: activeFileName,
        files: Object.values(files),
      });
      const graphData = buildStaticGraph(analysisResult);

      set({
        analysisResult,
        graphData,
        isAnalyzing: false,
      });
    } catch (error) {
      set({
        analysisError: error instanceof Error ? error.message : 'Static analysis request failed.',
        graphData: null,
        isAnalyzing: false,
      });
    }
  },
  selectFile: (fileName) =>
    set((state) => {
      if (!state.files[fileName]) {
        return state;
      }

      return {
        activeFileName: fileName,
      };
    }),
  updateFileContent: (fileName, content) =>
    set((state) => {
      const file = state.files[fileName];

      if (!file) {
        return state;
      }

      return {
        files: {
          ...state.files,
          [fileName]: {
            ...file,
            content,
          },
        },
      };
    }),
}));
