export type LessonMode = 'beginner' | 'engineer';

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LessonStarterFile = {
  path: string;
  content: string;
};

export type LessonExpectedOutput = {
  stdout?: string;
  stderr?: string;
  exit_code?: number;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  difficulty: LessonDifficulty;
  topic: string;
  mode_support: LessonMode[];
  starter_files: LessonStarterFile[];
  learning_objectives: string[];
  expected_output: LessonExpectedOutput;
  required_concepts: string[];
  validation: {
    strategy: string;
    rules: Record<string, unknown>[];
  };
  hints: string[];
};
