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

export type LessonType = 'python_foundation' | 'backend_lifecycle' | 'ai_rag_pipeline';

export type BackendLifecycleNodeType =
  | 'client'
  | 'route'
  | 'validation'
  | 'service'
  | 'repository'
  | 'database'
  | 'response'
  | 'error';

export type LessonLifecycleNode = {
  id: string;
  type: BackendLifecycleNodeType;
  label: string;
  description?: string;
  beginner_explanation?: string;
  engineer_explanation?: string;
  file_path?: string;
  line_number?: number;
};

export type AiRagPipelineNodeType =
  | 'user_query'
  | 'document'
  | 'chunker'
  | 'embedding_model'
  | 'vector_store'
  | 'retriever'
  | 'context_builder'
  | 'llm'
  | 'response'
  | 'citation_source'
  | 'hallucination_risk';

export type AiRagPipelineNode = {
  id: string;
  type: AiRagPipelineNodeType;
  label: string;
  description?: string;
  beginner_explanation?: string;
  engineer_explanation?: string;
  payload?: Record<string, unknown>;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  lesson_type?: LessonType;
  difficulty: LessonDifficulty;
  topic: string;
  mode_support: LessonMode[];
  starter_files: LessonStarterFile[];
  learning_objectives: string[];
  expected_output: LessonExpectedOutput;
  request_method?: string;
  request_path?: string;
  request_body?: unknown;
  query_params?: Record<string, string | number | boolean | null>;
  expected_response?: unknown;
  expected_status_code?: number;
  lifecycle_nodes?: LessonLifecycleNode[];
  user_query?: string;
  documents?: Record<string, unknown>[];
  chunks?: Record<string, unknown>[];
  embedding_model?: Record<string, unknown>;
  vector_store?: Record<string, unknown>;
  retrieved_context?: Record<string, unknown>[];
  citation_sources?: Record<string, unknown>[];
  hallucination_risk_points?: Record<string, unknown>[];
  pipeline_nodes?: AiRagPipelineNode[];
  required_concepts: string[];
  validation: {
    strategy: string;
    rules: Record<string, unknown>[];
  };
  hints: string[];
};
