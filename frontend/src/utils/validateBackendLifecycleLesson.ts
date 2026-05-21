import type { BackendLifecycleNodeType, Lesson } from '../types/lesson';
import type {
  BackendLifecycleValidationCheck,
  BackendLifecycleValidationResult,
  LessonValidationStatus,
} from '../types/validation';

const REQUIRED_LIFECYCLE_NODE_TYPES: BackendLifecycleNodeType[] = [
  'client',
  'route',
  'validation',
  'service',
  'repository',
  'database',
  'response',
  'error',
];

function check(
  id: string,
  label: string,
  passed: boolean,
  message: string,
  related_node_type?: BackendLifecycleNodeType,
): BackendLifecycleValidationCheck {
  return {
    id,
    label,
    state: passed ? 'correct' : 'incorrect',
    message,
    related_node_type,
  };
}

function overallStatus(checks: BackendLifecycleValidationCheck[]): LessonValidationStatus {
  if (checks.length === 0) {
    return 'not_evaluated';
  }

  const correctCount = checks.filter((item) => item.state === 'correct').length;

  if (correctCount === checks.length) {
    return 'correct';
  }

  return correctCount > 0 ? 'partially_correct' : 'incorrect';
}

export function validateBackendLifecycleLesson(lesson: Lesson | null): BackendLifecycleValidationResult {
  if (!lesson || lesson.lesson_type !== 'backend_lifecycle') {
    return {
      status: 'not_evaluated',
      message: 'Load a backend lifecycle lesson to evaluate request lifecycle metadata.',
      checks: [],
      missing_lifecycle_nodes: [],
    };
  }

  const nodeTypes = new Set((lesson.lifecycle_nodes ?? []).map((node) => node.type));
  const missingLifecycleNodes = REQUIRED_LIFECYCLE_NODE_TYPES.filter((type) => !nodeTypes.has(type));
  const checks: BackendLifecycleValidationCheck[] = [
    check(
      'request-method',
      'Expected request method',
      Boolean(lesson.request_method),
      lesson.request_method ? `Method is ${lesson.request_method}.` : 'No request_method is defined.',
      'client',
    ),
    check(
      'request-path',
      'Expected request path',
      Boolean(lesson.request_path),
      lesson.request_path ? `Path is ${lesson.request_path}.` : 'No request_path is defined.',
      'route',
    ),
    check(
      'expected-status-code',
      'Expected status code',
      typeof lesson.expected_status_code === 'number',
      typeof lesson.expected_status_code === 'number'
        ? `Status code is ${lesson.expected_status_code}.`
        : 'No expected_status_code is defined.',
      'response',
    ),
    check(
      'expected-response',
      'Expected response payload',
      lesson.expected_response !== undefined,
      lesson.expected_response !== undefined
        ? 'Expected response payload is defined.'
        : 'No expected_response payload is defined.',
      'response',
    ),
    check(
      'required-lifecycle-nodes',
      'Required lifecycle nodes',
      missingLifecycleNodes.length === 0,
      missingLifecycleNodes.length === 0
        ? 'All required lifecycle node types are present.'
        : `Missing lifecycle node types: ${missingLifecycleNodes.join(', ')}.`,
    ),
  ];
  const status = overallStatus(checks);

  return {
    status,
    message:
      status === 'correct'
        ? 'Backend lifecycle metadata is complete enough for the static visualization prototype.'
        : 'Backend lifecycle metadata is incomplete; missing fields or node types are listed below.',
    checks,
    missing_lifecycle_nodes: missingLifecycleNodes,
  };
}
