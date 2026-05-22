import { buildRuntimeGraph } from './buildRuntimeGraph.js';
import type { RuntimeTraceEvent } from '../types/trace.js';
import type { LessonValidationResult } from '../types/validation.js';

function assertOk(value: unknown, message: string) {
  if (!value) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${String(expected)}, received ${String(actual)}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown, message?: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(message ?? `Expected ${expectedJson}, received ${actualJson}`);
  }
}

const baseEvent = {
  timestamp: '2026-05-22T00:00:00Z',
  file_path: 'main.py',
  scope: {
    id: 'module:main.py',
    name: 'main.py',
    kind: 'module',
    parent_id: null,
  },
  visual: {},
  validation: null,
};

const multiFunctionCode = `def add(a, b):
    return a + b

def double(value):
    return value * 2

def make_message(number):
    return "Result is " + str(number)

total = add(2, 3)
doubled = double(total)
message = make_message(doubled)

print(message)`;

function event(
  step: number,
  type: string,
  lineNumber: number | null,
  payload: Record<string, unknown> = {},
): RuntimeTraceEvent {
  return {
    ...baseEvent,
    id: `evt-${step}`,
    type,
    step,
    line_number: lineNumber,
    payload,
  };
}

function nodeByPayloadName(events: RuntimeTraceEvent[], name: string) {
  const graph = buildRuntimeGraph(events, 0, null, {
    'main.py': {
      content: multiFunctionCode,
    },
  });

  const node = graph.nodes.find((candidate) => candidate.data.payload.name === name);

  if (!node) {
    throw new Error(`Expected runtime graph node for ${name}`);
  }

  return node.data;
}

function testFunctionDefinitionsUseSourceDefinitionLines() {
  const events = [
    event(1, 'variable_created', 1, { name: 'add', new_value: '<function add>' }),
    event(2, 'variable_created', 7, { name: 'double', new_value: '<function double>' }),
    event(3, 'variable_created', 4, { name: 'make_message', new_value: '<function make_message>' }),
  ];

  assertEqual(nodeByPayloadName(events, 'add').line_number, 1);
  assertDeepEqual(nodeByPayloadName(events, 'add').related_lines, [1, 2]);

  assertEqual(nodeByPayloadName(events, 'double').line_number, 4);
  assertDeepEqual(nodeByPayloadName(events, 'double').related_lines, [4, 5]);

  assertEqual(nodeByPayloadName(events, 'make_message').line_number, 7);
  assertDeepEqual(nodeByPayloadName(events, 'make_message').related_lines, [7, 8]);
}

function testNonexistentSourceLinesAreRejected() {
  const graph = buildRuntimeGraph(
    [event(1, 'line_executed', 99, { line_number: 99 })],
    0,
    null,
    {
      'main.py': {
        content: 'print("only one line")',
      },
    },
  );

  const node = graph.nodes[0];

  assertOk(node, 'Expected runtime graph node');
  assertEqual(node.data.line_number, null);
  assertDeepEqual(node.data.related_lines, []);
}

function testBlockHighlightsSkipTrailingBlankLines() {
  const graph = buildRuntimeGraph(
    [event(1, 'line_executed', 4, { line_number: 4 })],
    0,
    null,
    {
      'main.py': {
        content: multiFunctionCode,
      },
    },
  );

  const node = graph.nodes[0];

  assertOk(node, 'Expected runtime graph node');
  assertDeepEqual(node.data.related_lines, [4, 5]);
}

function lessonValidationResult(status: LessonValidationResult['status']): LessonValidationResult {
  return {
    status,
    output_status: status === 'correct' ? 'correct' : 'incorrect',
    message: 'test validation',
    concepts: {
      required: [],
      found: [],
      missing: [],
    },
    has_runtime_error: false,
    runtime_error_messages: [],
  };
}

function testCorrectLessonStatusColorsRuntimeNodes() {
  const graph = buildRuntimeGraph(
    [
      event(1, 'line_executed', 14, { line_number: 14 }),
      event(2, 'execution_finished', null, { status: 'completed' }),
    ],
    0,
    lessonValidationResult('correct'),
    {
      'main.py': {
        content: multiFunctionCode,
      },
    },
  );

  assertDeepEqual(
    graph.nodes.map((node) => node.data.validation_state),
    ['correct', 'correct'],
  );
}

function testSandboxModeGradesExecutionHealth() {
  const graph = buildRuntimeGraph(
    [
      event(1, 'line_executed', 14, { line_number: 14 }),
      event(2, 'execution_finished', null, { status: 'completed' }),
    ],
    0,
    null,
    {
      'main.py': {
        content: multiFunctionCode,
      },
    },
  );

  assertDeepEqual(
    graph.nodes.map((node) => node.data.validation_state),
    ['running', 'correct'],
  );
}

function testSandboxModeMarksRuntimeErrorsIncorrect() {
  const graph = buildRuntimeGraph(
    [
      event(1, 'line_executed', 14, { line_number: 14 }),
      event(2, 'error_raised', 14, { error_type: 'ZeroDivisionError' }),
      event(3, 'execution_finished', 14, { status: 'failed' }),
    ],
    0,
    null,
    {
      'main.py': {
        content: multiFunctionCode,
      },
    },
  );

  assertDeepEqual(
    graph.nodes.map((node) => node.data.validation_state),
    ['running', 'incorrect', 'incorrect'],
  );
}

testFunctionDefinitionsUseSourceDefinitionLines();
testNonexistentSourceLinesAreRejected();
testBlockHighlightsSkipTrailingBlankLines();
testCorrectLessonStatusColorsRuntimeNodes();
testSandboxModeGradesExecutionHealth();
testSandboxModeMarksRuntimeErrorsIncorrect();

console.log('runtime graph guardrails passed');
