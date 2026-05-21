import type { Lesson } from '../types/lesson';
import type { RuntimeTraceResult } from '../types/trace';
import type {
  ConceptValidationResult,
  LessonValidationResult,
  OutputValidationStatus,
  RequiredConceptKey,
} from '../types/validation';

type ValidationWorkspaceFile = {
  content: string;
};

type ConceptDetector = (source: string) => boolean;

const CONCEPT_ALIASES: Record<string, RequiredConceptKey> = {
  print: 'print_statement',
};

const CONCEPT_DETECTORS: Record<RequiredConceptKey, ConceptDetector> = {
  print_statement: (source) => /\bprint\s*\(/.test(source),
  variable_assignment: (source) => /^\s*[A-Za-z_]\w*\s*=(?!=)/m.test(source),
  for_loop: (source) => /^\s*for\s+.+\s+in\s+.+:/m.test(source),
  if_statement: (source) => /^\s*if\s+.+:/m.test(source),
  function_definition: (source) => /^\s*def\s+[A-Za-z_]\w*\s*\(/m.test(source),
  function_call: (source) => /\b[A-Za-z_]\w*\s*\(/.test(source),
  list_usage: (source) => /\[[\s\S]*\]|\blist\s*\(/.test(source),
  dict_usage: (source) => /\{[\s\S]*:|}\s*$|\bdict\s*\(/m.test(source),
};

function normalizeStdout(stdout: string) {
  return stdout.replace(/\r\n/g, '\n').trimEnd();
}

function normalizeConcept(concept: string): RequiredConceptKey | null {
  const normalizedConcept = concept.trim().toLowerCase();
  const aliasedConcept = CONCEPT_ALIASES[normalizedConcept] ?? normalizedConcept;

  return aliasedConcept in CONCEPT_DETECTORS ? (aliasedConcept as RequiredConceptKey) : null;
}

function validateConcepts(
  lesson: Lesson | null,
  files: Record<string, ValidationWorkspaceFile>,
): ConceptValidationResult {
  const required = lesson?.required_concepts ?? [];
  const source = Object.values(files)
    .map((file) => file.content)
    .join('\n');
  const found: string[] = [];
  const missing: string[] = [];

  for (const concept of required) {
    const normalizedConcept = normalizeConcept(concept);

    if (normalizedConcept && CONCEPT_DETECTORS[normalizedConcept](source)) {
      found.push(concept);
    } else {
      missing.push(concept);
    }
  }

  return {
    required,
    found,
    missing,
  };
}

function runtimeErrorMessages(traceResult: RuntimeTraceResult) {
  return traceResult.errors.map((error) => error.message);
}

function outputStatusForExpectedStdout(expectedStdout: string | undefined, actualStdout: string): OutputValidationStatus {
  if (expectedStdout === undefined) {
    return 'not_evaluated';
  }

  return normalizeStdout(actualStdout) === normalizeStdout(expectedStdout) ? 'correct' : 'incorrect';
}

export function validateLessonOutput(
  lesson: Lesson | null,
  traceResult: RuntimeTraceResult,
  files: Record<string, ValidationWorkspaceFile>,
): LessonValidationResult {
  const expectedStdout = lesson?.expected_output.stdout;
  const concepts = validateConcepts(lesson, files);
  const runtimeErrors = runtimeErrorMessages(traceResult);
  const hasRuntimeError = runtimeErrors.length > 0;

  if (!lesson) {
    return {
      status: 'not_evaluated',
      output_status: 'not_evaluated',
      message: 'No lesson is loaded, so output and concept validation were not evaluated.',
      actual_stdout: traceResult.stdout,
      concepts,
      has_runtime_error: hasRuntimeError,
      runtime_error_messages: runtimeErrors,
    };
  }

  const outputStatus = outputStatusForExpectedStdout(expectedStdout, traceResult.stdout);
  const hasMissingConcepts = concepts.missing.length > 0;
  const hasFoundConcepts = concepts.found.length > 0;

  if (hasRuntimeError) {
    return {
      status: 'incorrect',
      output_status: outputStatus,
      message: 'Runtime error occurred before the lesson could pass.',
      expected_stdout: expectedStdout,
      actual_stdout: traceResult.stdout,
      concepts,
      has_runtime_error: hasRuntimeError,
      runtime_error_messages: runtimeErrors,
    };
  }

  if (outputStatus === 'correct' && !hasMissingConcepts) {
    return {
      status: 'correct',
      output_status: outputStatus,
      message: 'Stdout matches and all required concepts were found.',
      expected_stdout: expectedStdout,
      actual_stdout: traceResult.stdout,
      concepts,
      has_runtime_error: hasRuntimeError,
      runtime_error_messages: runtimeErrors,
    };
  }

  if (outputStatus === 'correct' && hasMissingConcepts) {
    return {
      status: 'partially_correct',
      output_status: outputStatus,
      message: 'Correct output, but lesson goal not met. Some required concepts are missing.',
      expected_stdout: expectedStdout,
      actual_stdout: traceResult.stdout,
      concepts,
      has_runtime_error: hasRuntimeError,
      runtime_error_messages: runtimeErrors,
    };
  }

  if (outputStatus === 'incorrect' && hasFoundConcepts) {
    return {
      status: 'partially_correct',
      output_status: outputStatus,
      message: 'Some required concepts were found, but stdout does not match yet.',
      expected_stdout: expectedStdout,
      actual_stdout: traceResult.stdout,
      concepts,
      has_runtime_error: hasRuntimeError,
      runtime_error_messages: runtimeErrors,
    };
  }

  return {
    status: 'incorrect',
    output_status: outputStatus,
    message:
      outputStatus === 'incorrect'
        ? 'Stdout does not match the loaded lesson expected output.'
        : 'Required concept validation did not pass.',
    expected_stdout: expectedStdout,
    actual_stdout: traceResult.stdout,
    concepts,
    has_runtime_error: hasRuntimeError,
    runtime_error_messages: runtimeErrors,
  };
}
