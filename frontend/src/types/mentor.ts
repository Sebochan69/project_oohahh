import type { Lesson } from './lesson';
import type { MisconceptionResult } from './misconception';

export type MentorAction = 'explain_this' | 'give_hint';

export type MentorMode = 'beginner' | 'engineer';

export type MentorLessonContext = Pick<
  Lesson,
  'id' | 'title' | 'description' | 'topic' | 'difficulty' | 'learning_objectives' | 'required_concepts'
>;

export type MentorRequest = {
  action: MentorAction;
  mode: MentorMode;
  selected_event?: Record<string, unknown>;
  selected_node?: Record<string, unknown>;
  validation_summary: Record<string, unknown>;
  misconceptions: MisconceptionResult[];
  lesson?: MentorLessonContext;
};

export type MentorResponse = {
  message: string;
  tone: 'supportive' | 'technical' | 'encouraging';
  next_suggested_action: string;
  safety_notes: string[];
  learning_constraints: string[];
};
