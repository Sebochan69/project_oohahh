import unittest

from app.models.analysis import AnalysisFile
from app.models.trace import RuntimeTraceRequest
from app.services.runtime_trace import run_runtime_trace


MULTI_FUNCTION_CODE = """def add(a, b):
    return a + b

def double(value):
    return value * 2

def make_message(number):
    return "Result is " + str(number)

total = add(2, 3)
doubled = double(total)
message = make_message(doubled)

print(message)"""


class RuntimeTraceGuardrailTests(unittest.TestCase):
    def run_code(self, code: str):
        request = RuntimeTraceRequest(
            entry_file="main.py",
            files=[AnalysisFile(path="main.py", content=code)],
        )

        response = run_runtime_trace(request)
        self.assertEqual(response.errors, [])
        return response.events

    def test_function_definition_events_use_actual_definition_lines(self):
        events = self.run_code(MULTI_FUNCTION_CODE)
        function_definition_events = {
            event.payload["name"]: event
            for event in events
            if event.type == "variable_created"
            and isinstance(event.payload.get("new_value"), str)
            and event.payload["new_value"].startswith("<function ")
        }

        self.assertEqual(function_definition_events["add"].line_number, 1)
        self.assertEqual(function_definition_events["double"].line_number, 4)
        self.assertEqual(function_definition_events["make_message"].line_number, 7)

    def test_function_scope_does_not_leak_into_module_scope(self):
        events = self.run_code(MULTI_FUNCTION_CODE)

        argument_events = [
            event
            for event in events
            if event.type == "variable_created" and event.payload.get("name") in {"a", "b", "value", "number"}
        ]

        self.assertEqual({event.scope["kind"] for event in argument_events}, {"function"})
        self.assertEqual(
            {event.payload["scope"] for event in argument_events},
            {"add", "double", "make_message"},
        )

    def test_runtime_trace_never_emits_nonexistent_code_lines_for_known_snippet(self):
        events = self.run_code(
            """def add(a, b):
    return a + b

result = add(1, 2)
print(result)"""
        )
        line_numbers = [event.line_number for event in events if event.line_number is not None]

        self.assertTrue(line_numbers)
        self.assertLessEqual(max(line_numbers), 5)


if __name__ == "__main__":
    unittest.main()
