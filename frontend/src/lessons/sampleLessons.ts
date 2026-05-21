import fastApiHelloRouteLesson from '../../../lessons/backend-lifecycle/fastapi-hello-route.lesson.json';
import dictionaryAccessLesson from '../../../lessons/python-foundations/dictionary-access.lesson.json';
import forLoopBasicsLesson from '../../../lessons/python-foundations/for-loop-basics.lesson.json';
import functionReturnValueLesson from '../../../lessons/python-foundations/function-return-value.lesson.json';
import ifStatementBasicsLesson from '../../../lessons/python-foundations/if-statement-basics.lesson.json';
import listFilteringLesson from '../../../lessons/python-foundations/list-filtering.lesson.json';
import printWelcomeMessageLesson from '../../../lessons/python-foundations/print-welcome-message.lesson.json';
import updateAVariableLesson from '../../../lessons/python-foundations/update-a-variable.lesson.json';
import variableAssignmentLesson from '../../../lessons/python-foundations/variable-assignment.lesson.json';
import type { Lesson } from '../types/lesson';

export const SAMPLE_LESSONS = [
  printWelcomeMessageLesson,
  variableAssignmentLesson,
  updateAVariableLesson,
  forLoopBasicsLesson,
  ifStatementBasicsLesson,
  functionReturnValueLesson,
  listFilteringLesson,
  dictionaryAccessLesson,
  fastApiHelloRouteLesson,
] as Lesson[];

export const DEFAULT_SAMPLE_LESSON = SAMPLE_LESSONS[0];
