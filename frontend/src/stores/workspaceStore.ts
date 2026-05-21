import { create } from 'zustand';
import { analyzeStatic } from '../api/staticAnalysis';
import type { StaticAnalysisResult } from '../api/staticAnalysis';

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
  isAnalyzing: boolean;
  createFile: () => void;
  deleteFile: (fileName: string) => void;
  renameFile: (oldName: string, nextName: string) => boolean;
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
  isAnalyzing: false,
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
  runStaticAnalysis: async () => {
    const { activeFileName, files } = useWorkspaceStore.getState();

    set({
      analysisError: null,
      isAnalyzing: true,
    });

    try {
      const analysisResult = await analyzeStatic({
        entryFile: activeFileName,
        files: Object.values(files),
      });

      set({
        analysisResult,
        isAnalyzing: false,
      });
    } catch (error) {
      set({
        analysisError: error instanceof Error ? error.message : 'Static analysis request failed.',
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
