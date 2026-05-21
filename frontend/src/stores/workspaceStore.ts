import { create } from 'zustand';

const STARTER_CODE = 'print("Welcome to OOH-AHH")';

type WorkspaceState = {
  activeFileName: string;
  files: Record<string, string>;
  updateFileContent: (fileName: string, content: string) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeFileName: 'main.py',
  files: {
    'main.py': STARTER_CODE,
  },
  updateFileContent: (fileName, content) =>
    set((state) => ({
      files: {
        ...state.files,
        [fileName]: content,
      },
    })),
}));
