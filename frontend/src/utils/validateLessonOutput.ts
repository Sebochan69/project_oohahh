import type { Lesson } from '../types/lesson';
import type { RuntimeTraceResult } from '../types/trace';
import type { LessonValidationResult } from '../types/validation';

function normalizeStdout(stdout: string) {
  return stdout.replace(/\r\n/g, '\n').trimEnd();
}

export function validateLessonOutput(
  lesson: Lesson | null,
  traceResult: RuntimeTraceResult,
): LessonValidationResult {
  const expectedStdout = lesson?.expected_output.stdout;

  if (!lesson || expectedStdout === undefined) {
    return {
      status: 'not_evaluated',
      message: 'No loaded lesson expected stdout is available for validation.',
      actual_stdout: traceResult.stdout,
    };
  }

  const normalizedExpected = normalizeStdout(expectedStdout);
  const normalizedActual = normalizeStdout(traceResult.stdout);

  if (normalizedActual === normalizedExpected) {
    return {
      status: 'correct',
      message: 'Stdout matches the loaded lesson expected output.',
      expected_stdout: expectedStdout,
      actual_stdout: traceResult.stdout,
    };
  }

  return {
    status: 'incorrect',
    message: 'Stdout does not match the loaded lesson expected output.',
    expected_stdout: expectedStdout,
    actual_stdout: traceResult.stdout,
  };
}
