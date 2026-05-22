import { create } from 'zustand';
import { runRuntimeTrace as requestRuntimeTrace } from '../api/runtimeTrace';
import { analyzeStatic } from '../api/staticAnalysis';
import type { StaticAnalysisResult } from '../types/analysis';
import type { RuntimeGraphData, StaticGraphData } from '../types/graph';
import type { Lesson, LessonMode } from '../types/lesson';
import type { RuntimeTraceResult } from '../types/trace';
import type { LessonValidationResult } from '../types/validation';
import { buildCallFlowGraph } from '../utils/buildCallFlowGraph';
import { buildRuntimeGraph } from '../utils/buildRuntimeGraph';
import { buildStaticGraph } from '../utils/buildStaticGraph';
import { validateLessonOutput } from '../utils/validateLessonOutput';

const STARTER_CODE = 'print("Welcome to OOH-AHH")';

export type WorkspaceFile = {
  name: string;
  content: string;
};

export type CodeHighlight = {
  filePath: string;
  lineNumber: number;
  endLineNumber?: number;
  lineNumbers?: number[];
  label?: string;
};

export type PythonVisualizationMode = 'structure' | 'call_flow' | 'runtime_flow';
export type ThemeMode = 'light' | 'dark';

type WorkspaceState = {
  activeFileName: string;
  analysisError: string | null;
  analysisResult: StaticAnalysisResult | null;
  callFlowGraphData: StaticGraphData | null;
  files: Record<string, WorkspaceFile>;
  graphData: StaticGraphData | null;
  pythonVisualizationMode: PythonVisualizationMode;
  themeMode: ThemeMode;
  currentEventIndex: number;
  codeHighlight: CodeHighlight | null;
  activeLesson: Lesson | null;
  activeLessonStarterFiles: Record<string, WorkspaceFile> | null;
  learningMode: LessonMode;
  isAnalyzing: boolean;
  isTimelinePlaying: boolean;
  isTracing: boolean;
  traceError: string | null;
  traceResult: RuntimeTraceResult | null;
  runtimeGraphData: RuntimeGraphData | null;
  lessonValidationResult: LessonValidationResult;
  createFile: () => void;
  deleteFile: (fileName: string) => void;
  goToNextTimelineEvent: () => void;
  goToPreviousTimelineEvent: () => void;
  pauseTimeline: () => void;
  playTimeline: () => void;
  loadLesson: (lesson: Lesson) => void;
  renameFile: (oldName: string, nextName: string) => boolean;
  resetLesson: () => void;
  resetTimeline: () => void;
  runRuntimeTrace: () => Promise<void>;
  runStaticAnalysis: () => Promise<void>;
  selectFile: (fileName: string) => void;
  setCodeHighlight: (highlight: CodeHighlight | null) => void;
  setLearningMode: (mode: LessonMode) => void;
  setPythonVisualizationMode: (mode: PythonVisualizationMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  startSandboxMode: () => void;
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

function notEvaluatedLessonValidation(message: string): LessonValidationResult {
  return {
    status: 'not_evaluated',
    output_status: 'not_evaluated',
    message,
    concepts: {
      required: [],
      found: [],
      missing: [],
    },
    has_runtime_error: false,
    runtime_error_messages: [],
  };
}

function resetDerivedWorkspaceState(message = 'Run / Verify to evaluate the current workspace.') {
  return {
    analysisError: null,
    analysisResult: null,
    callFlowGraphData: null,
    codeHighlight: null,
    currentEventIndex: 0,
    graphData: null,
    isTimelinePlaying: false,
    lessonValidationResult: notEvaluatedLessonValidation(message),
    runtimeGraphData: null,
    traceError: null,
    traceResult: null,
  };
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeFileName: 'main.py',
  analysisError: null,
  analysisResult: null,
  callFlowGraphData: null,
  files: {
    'main.py': {
      name: 'main.py',
      content: STARTER_CODE,
    },
  },
  graphData: null,
  pythonVisualizationMode: 'structure',
  themeMode: 'light',
  currentEventIndex: 0,
  codeHighlight: null,
  activeLesson: null,
  activeLessonStarterFiles: null,
  learningMode: 'beginner',
  isAnalyzing: false,
  isTimelinePlaying: false,
  isTracing: false,
  traceError: null,
  traceResult: null,
  runtimeGraphData: null,
  lessonValidationResult: notEvaluatedLessonValidation('Run / Verify to evaluate a loaded lesson.'),
  createFile: () =>
    set((state) => {
      const fileName = createUntitledFileName(state.files);

      return {
        activeFileName: fileName,
        ...resetDerivedWorkspaceState(),
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
        ...resetDerivedWorkspaceState(),
        files: remainingFiles,
      };
    }),
  goToNextTimelineEvent: () =>
    set((state) => {
      const eventCount = state.traceResult?.events.length ?? 0;

      if (eventCount === 0) {
        return {
          codeHighlight: null,
          currentEventIndex: 0,
          isTimelinePlaying: false,
          runtimeGraphData: buildRuntimeGraph([], 0, undefined, state.files),
        };
      }

      const nextIndex = Math.min(state.currentEventIndex + 1, eventCount - 1);
      const events = state.traceResult?.events ?? [];

      return {
        codeHighlight: null,
        currentEventIndex: nextIndex,
        isTimelinePlaying: nextIndex < eventCount - 1 ? state.isTimelinePlaying : false,
        runtimeGraphData: buildRuntimeGraph(events, nextIndex, state.lessonValidationResult, state.files),
      };
    }),
  goToPreviousTimelineEvent: () =>
    set((state) => {
      const previousIndex = Math.max(state.currentEventIndex - 1, 0);
      const events = state.traceResult?.events ?? [];

      return {
        codeHighlight: null,
        currentEventIndex: previousIndex,
        isTimelinePlaying: false,
        runtimeGraphData: buildRuntimeGraph(events, previousIndex, state.lessonValidationResult, state.files),
      };
    }),
  pauseTimeline: () =>
    set({
      isTimelinePlaying: false,
    }),
  playTimeline: () =>
    set((state) => {
      const eventCount = state.traceResult?.events.length ?? 0;

      if (eventCount === 0 || state.currentEventIndex >= eventCount - 1) {
        return {
          isTimelinePlaying: false,
        };
      }

      return {
        isTimelinePlaying: true,
      };
    }),
  loadLesson: (lesson) => {
    const starterFiles = lesson.starter_files.reduce<Record<string, WorkspaceFile>>((files, starterFile) => {
      files[starterFile.path] = {
        name: starterFile.path,
        content: starterFile.content,
      };

      return files;
    }, {});
    const activeFileName = lesson.starter_files[0]?.path ?? 'main.py';

    set({
      activeFileName,
      activeLesson: lesson,
      activeLessonStarterFiles: starterFiles,
      analysisError: null,
      analysisResult: null,
      callFlowGraphData: null,
      codeHighlight: null,
      currentEventIndex: 0,
      files: starterFiles,
      graphData: null,
      isTimelinePlaying: false,
      lessonValidationResult: notEvaluatedLessonValidation('Run / Verify to evaluate this lesson.'),
      runtimeGraphData: null,
      traceError: null,
      traceResult: null,
    });
  },
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
        ...resetDerivedWorkspaceState(),
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
    const { activeFileName, activeLesson, files } = useWorkspaceStore.getState();

    set({
      codeHighlight: null,
      currentEventIndex: 0,
      isTimelinePlaying: false,
      isTracing: true,
      pythonVisualizationMode: 'runtime_flow',
      runtimeGraphData: null,
      lessonValidationResult: notEvaluatedLessonValidation('Runtime execution is in progress.'),
      traceError: null,
    });

    try {
      const traceResult = await requestRuntimeTrace({
        entryFile: activeFileName,
        files: Object.values(files),
      });
      const lessonValidationResult = validateLessonOutput(activeLesson, traceResult, files);

      set({
        codeHighlight: null,
        currentEventIndex: 0,
        isTimelinePlaying: false,
        isTracing: false,
        lessonValidationResult,
        runtimeGraphData: buildRuntimeGraph(traceResult.events, 0, lessonValidationResult, files),
        traceResult,
      });
    } catch (error) {
      set({
        isTimelinePlaying: false,
        isTracing: false,
        lessonValidationResult: notEvaluatedLessonValidation(
          'Runtime execution did not complete, so lesson validation was not evaluated.',
        ),
        runtimeGraphData: null,
        traceError: error instanceof Error ? error.message : 'Runtime trace request failed.',
      });
    }
  },
  resetTimeline: () =>
    set((state) => ({
      codeHighlight: null,
      currentEventIndex: 0,
      isTimelinePlaying: false,
      runtimeGraphData: buildRuntimeGraph(
        state.traceResult?.events ?? [],
        0,
        state.lessonValidationResult,
        state.files,
      ),
    })),
  resetLesson: () =>
    set((state) => {
      if (!state.activeLessonStarterFiles) {
        return state;
      }

      const files = Object.fromEntries(
        Object.entries(state.activeLessonStarterFiles).map(([fileName, file]) => [
          fileName,
          {
            ...file,
          },
        ]),
      );

      return {
        activeFileName: state.activeLesson?.starter_files[0]?.path ?? Object.keys(files)[0] ?? 'main.py',
        analysisError: null,
        analysisResult: null,
        callFlowGraphData: null,
        codeHighlight: null,
        currentEventIndex: 0,
        files,
        graphData: null,
        isTimelinePlaying: false,
        lessonValidationResult: notEvaluatedLessonValidation('Run / Verify to evaluate this lesson.'),
        runtimeGraphData: null,
        traceError: null,
        traceResult: null,
      };
    }),
  runStaticAnalysis: async () => {
    const { activeFileName, files } = useWorkspaceStore.getState();

    set({
      analysisError: null,
      callFlowGraphData: null,
      codeHighlight: null,
      graphData: null,
      isAnalyzing: true,
      isTimelinePlaying: false,
      runtimeGraphData: null,
    });

    try {
      const analysisResult = await analyzeStatic({
        entryFile: activeFileName,
        files: Object.values(files),
      });
      const graphData = buildStaticGraph(analysisResult);
      const callFlowGraphData = buildCallFlowGraph(analysisResult);

      set({
        analysisResult,
        callFlowGraphData,
        graphData,
        isAnalyzing: false,
      });
    } catch (error) {
      set({
        analysisError: error instanceof Error ? error.message : 'Static analysis request failed.',
        callFlowGraphData: null,
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
  setCodeHighlight: (highlight) =>
    set((state) => ({
      activeFileName: highlight?.filePath && state.files[highlight.filePath] ? highlight.filePath : state.activeFileName,
      codeHighlight: highlight,
    })),
  setLearningMode: (mode) =>
    set({
      learningMode: mode,
    }),
  setPythonVisualizationMode: (mode) =>
    set({
      pythonVisualizationMode: mode,
    }),
  setThemeMode: (mode) =>
    set({
      themeMode: mode,
    }),
  startSandboxMode: () =>
    set({
      activeLesson: null,
      activeLessonStarterFiles: null,
      lessonValidationResult: notEvaluatedLessonValidation(
        'Sandbox Mode is active. Run / Verify will grade execution health and show runtime flow, stdout, and errors.',
      ),
      runtimeGraphData: null,
      traceError: null,
      traceResult: null,
    }),
  updateFileContent: (fileName, content) =>
    set((state) => {
      const file = state.files[fileName];

      if (!file) {
        return state;
      }

      return {
        ...resetDerivedWorkspaceState(),
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
