import type { Lesson } from '../types/lesson';

export type LessonTrackKey = 'python_foundation' | 'backend_lifecycle' | 'ai_rag_pipeline' | 'unsupported';

export type LessonTrackInfo = {
  key: LessonTrackKey;
  label: string;
  shortLabel: string;
  description: string;
};

export const LESSON_TRACKS: Record<LessonTrackKey, LessonTrackInfo> = {
  python_foundation: {
    key: 'python_foundation',
    label: 'Python Foundations',
    shortLabel: 'Python',
    description: 'Write Python code, analyze structure, run traces, and validate beginner fundamentals.',
  },
  backend_lifecycle: {
    key: 'backend_lifecycle',
    label: 'Backend Lifecycle',
    shortLabel: 'Backend',
    description: 'Inspect static request flow through route, validation, service, repository, and response nodes.',
  },
  ai_rag_pipeline: {
    key: 'ai_rag_pipeline',
    label: 'AI/RAG Pipeline',
    shortLabel: 'AI/RAG',
    description: 'Explore static retrieval, context, response, citation, and hallucination-risk concepts.',
  },
  unsupported: {
    key: 'unsupported',
    label: 'Unsupported Track',
    shortLabel: 'Unsupported',
    description: 'This lesson type is not supported by the current OOH-AHH prototype.',
  },
};

export const TRACK_ORDER: LessonTrackKey[] = ['python_foundation', 'backend_lifecycle', 'ai_rag_pipeline'];

export function getLessonTrackKey(lesson: Pick<Lesson, 'lesson_type'>): LessonTrackKey {
  if (!lesson.lesson_type || lesson.lesson_type === 'python_foundation') {
    return 'python_foundation';
  }

  if (lesson.lesson_type === 'backend_lifecycle' || lesson.lesson_type === 'ai_rag_pipeline') {
    return lesson.lesson_type;
  }

  return 'unsupported';
}

export function getLessonTrackInfo(lesson: Pick<Lesson, 'lesson_type'>): LessonTrackInfo {
  return LESSON_TRACKS[getLessonTrackKey(lesson)];
}

export function lessonsByTrack(lessons: Lesson[]) {
  return TRACK_ORDER.map((trackKey) => ({
    track: LESSON_TRACKS[trackKey],
    lessons: lessons.filter((lesson) => getLessonTrackKey(lesson) === trackKey),
  })).filter((group) => group.lessons.length > 0);
}
