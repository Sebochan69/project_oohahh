import json
import subprocess
import sys
from datetime import UTC, datetime
from textwrap import dedent

from app.models.analysis import AnalysisError
from app.models.trace import RuntimeTraceEvent, RuntimeTraceRequest, RuntimeTraceResponse

EXECUTION_TIMEOUT_SECONDS = 2.0
ERROR_MARKER = "__OOH_AHH_ERROR__"
EVENT_MARKER = "__OOH_AHH_EVENT__"
MAX_TRACE_EVENTS = 500

RUNNER_SCRIPT = dedent(
    f"""
    import builtins
    import datetime
    import json
    import sys
    import traceback

    ERROR_MARKER = {ERROR_MARKER!r}
    EVENT_MARKER = {EVENT_MARKER!r}
    MAX_TRACE_EVENTS = {MAX_TRACE_EVENTS}
    file_path = sys.argv[1]
    source = sys.stdin.read()
    step = 0
    tracing_suppressed = False
    last_line_numbers = {{}}
    locals_snapshots = {{}}
    last_executed_line_number = None

    def now_iso():
        return datetime.datetime.now(datetime.UTC).isoformat().replace("+00:00", "Z")

    def scope_for_frame(frame):
        if frame.f_code.co_name == "<module>":
            return {{
                "id": f"module:{{file_path}}",
                "name": file_path,
                "kind": "module",
                "parent_id": None,
            }}

        return {{
            "id": f"function:{{frame.f_code.co_name}}",
            "name": frame.f_code.co_name,
            "kind": "function",
            "parent_id": f"module:{{file_path}}",
        }}

    def make_event(event_type, line_number=None, payload=None, visual=None, validation=None, scope=None):
        global step
        event = {{
            "id": f"evt-{{step:04d}}-{{event_type}}",
            "type": event_type,
            "timestamp": now_iso(),
            "step": step,
            "file_path": file_path,
            "line_number": line_number,
            "scope": scope or {{
                "id": f"module:{{file_path}}",
                "name": file_path,
                "kind": "module",
                "parent_id": None,
            }},
            "payload": payload or {{}},
            "visual": visual or {{}},
            "validation": validation,
        }}
        step += 1
        return event

    def emit_event(event_type, line_number=None, payload=None, visual=None, validation=None, scope=None):
        print(
            EVENT_MARKER + json.dumps(make_event(event_type, line_number, payload, visual, validation, scope)),
            file=sys.stderr,
        )

    def emit_error(kind, message, line_number=None):
        payload = {{
            "kind": kind,
            "message": message,
            "line_number": line_number,
        }}
        print(ERROR_MARKER + json.dumps(payload), file=sys.stderr)

    def safe_value(value):
        if callable(value):
            name = getattr(value, "__name__", type(value).__name__)
            return f"<function {{name}}>"

        try:
            json.dumps(value)
        except (TypeError, ValueError):
            return repr(value)

        if value is None or isinstance(value, (str, int, float, bool, list, dict)):
            return value

        return repr(value)

    def snapshot_locals(frame):
        ignored_names = {{"__builtins__", "__name__", "__file__"}}
        return {{
            name: safe_value(value)
            for name, value in frame.f_locals.items()
            if not name.startswith("__") and name not in ignored_names
        }}

    def emit_variable_changes(frame, completed_line_number):
        frame_key = id(frame)
        last_locals_snapshot = locals_snapshots.get(frame_key, {{}})
        current_snapshot = snapshot_locals(frame)
        scope = scope_for_frame(frame)
        scope_name = scope["name"]

        for name, new_value in current_snapshot.items():
            if name not in last_locals_snapshot:
                emit_event(
                    "variable_created",
                    completed_line_number,
                    {{"name": name, "old_value": None, "new_value": new_value, "scope": scope_name}},
                    {{"category": "data", "label": f"Created {{name}}", "emphasis": "highlight"}},
                    scope=scope,
                )
                continue

            old_value = last_locals_snapshot[name]
            if old_value != new_value:
                emit_event(
                    "variable_updated",
                    completed_line_number,
                    {{"name": name, "old_value": old_value, "new_value": new_value, "scope": scope_name}},
                    {{"category": "data", "label": f"Updated {{name}}", "emphasis": "highlight"}},
                    scope=scope,
                )

        locals_snapshots[frame_key] = current_snapshot

    def trace_lines(frame, event, arg):
        global last_executed_line_number, tracing_suppressed
        if frame.f_code.co_filename != file_path:
            return trace_lines

        frame_key = id(frame)
        scope = scope_for_frame(frame)

        if event == "line":
            previous_line_number = last_line_numbers.get(frame_key)
            if previous_line_number is not None:
                emit_variable_changes(frame, previous_line_number)

            if step >= MAX_TRACE_EVENTS:
                if not tracing_suppressed:
                    tracing_suppressed = True
                    emit_event(
                        "line_executed",
                        frame.f_lineno,
                        {{"line_number": frame.f_lineno, "truncated": True}},
                        {{"category": "execution", "label": "Trace event limit reached", "emphasis": "muted"}},
                        scope=scope,
                    )
                return None

            last_executed_line_number = frame.f_lineno
            last_line_numbers[frame_key] = frame.f_lineno
            emit_event(
                "line_executed",
                frame.f_lineno,
                {{"line_number": frame.f_lineno}},
                {{"category": "execution", "label": f"Line {{frame.f_lineno}}", "emphasis": "normal"}},
                scope=scope,
            )

        if event == "return":
            previous_line_number = last_line_numbers.pop(frame_key, None)
            if previous_line_number is not None:
                emit_variable_changes(frame, previous_line_number)

        return trace_lines

    def blocked_import(*args, **kwargs):
        raise ImportError("Imports are disabled in the prototype runtime.")

    safe_builtin_names = [
        "abs",
        "all",
        "any",
        "bool",
        "dict",
        "enumerate",
        "float",
        "int",
        "len",
        "list",
        "max",
        "min",
        "print",
        "range",
        "repr",
        "round",
        "set",
        "str",
        "sum",
        "tuple",
        "zip",
    ]
    safe_builtins = {{name: getattr(builtins, name) for name in safe_builtin_names}}
    safe_builtins["__import__"] = blocked_import

    globals_for_exec = {{
        "__builtins__": safe_builtins,
        "__name__": "__main__",
        "__file__": file_path,
    }}

    emit_event(
        "execution_started",
        None,
        {{"entry_file": file_path}},
        {{"category": "system", "label": "Execution started", "emphasis": "highlight"}},
    )

    try:
        code = compile(source, file_path, "exec")
    except SyntaxError as error:
        emit_event(
            "error_raised",
            error.lineno,
            {{"error_type": "SyntaxError", "error_message": error.msg}},
            {{"category": "error", "label": "Syntax error", "emphasis": "highlight"}},
        )
        emit_event(
            "execution_finished",
            error.lineno,
            {{"status": "failed"}},
            {{"category": "system", "label": "Execution failed", "emphasis": "highlight"}},
        )
        emit_error("syntax_error", error.msg, error.lineno)
        traceback.print_exception(error, file=sys.stderr)
        raise SystemExit(1)

    try:
        sys.settrace(trace_lines)
        exec(code, globals_for_exec, globals_for_exec)
    except BaseException as error:
        sys.settrace(None)
        traceback_summary = traceback.extract_tb(error.__traceback__)
        user_frames = [frame for frame in traceback_summary if frame.filename == file_path]
        line_number = user_frames[-1].lineno if user_frames else None
        emit_event(
            "error_raised",
            line_number,
            {{"error_type": type(error).__name__, "error_message": str(error)}},
            {{"category": "error", "label": type(error).__name__, "emphasis": "highlight"}},
        )
        emit_event(
            "execution_finished",
            line_number,
            {{"status": "failed"}},
            {{"category": "system", "label": "Execution failed", "emphasis": "highlight"}},
        )
        emit_error(type(error).__name__, str(error), line_number)
        traceback.print_exception(error, file=sys.stderr)
        raise SystemExit(1)
    finally:
        sys.settrace(None)

    emit_event(
        "execution_finished",
        last_executed_line_number,
        {{"status": "completed"}},
        {{"category": "system", "label": "Execution finished", "emphasis": "highlight"}},
    )
    """
)


def _fallback_event(event_type: str, step: int, file_path: str, line_number: int | None, payload: dict) -> RuntimeTraceEvent:
    return RuntimeTraceEvent(
        id=f"evt-{step:04d}-{event_type}",
        type=event_type,
        timestamp=_utc_timestamp(),
        step=step,
        file_path=file_path,
        line_number=line_number,
        scope={
            "id": f"module:{file_path}",
            "name": file_path,
            "kind": "module",
            "parent_id": None,
        },
        payload=payload,
        visual={},
        validation=None,
    )


def _extract_marked_output(file_path: str, stderr: str) -> tuple[str, list[RuntimeTraceEvent], list[AnalysisError]]:
    """Split runner stderr into user-visible stderr, trace events, and errors."""
    events: list[RuntimeTraceEvent] = []
    errors: list[AnalysisError] = []
    visible_stderr_lines: list[str] = []

    for line in stderr.splitlines():
        if line.startswith(EVENT_MARKER):
            try:
                events.append(RuntimeTraceEvent(**json.loads(line.removeprefix(EVENT_MARKER))))
            except (json.JSONDecodeError, ValueError):
                visible_stderr_lines.append(line)
            continue

        if line.startswith(ERROR_MARKER):
            try:
                payload = json.loads(line.removeprefix(ERROR_MARKER))
            except json.JSONDecodeError:
                visible_stderr_lines.append(line)
                continue

            kind = payload.get("kind", "runtime_error")
            message = payload.get("message") or "Runtime error occurred."
            errors.append(
                AnalysisError(
                    file_path=file_path,
                    message=f"{kind}: {message}",
                    line_number=payload.get("line_number"),
                )
            )
            continue

        visible_stderr_lines.append(line)

    visible_stderr = "\n".join(visible_stderr_lines)
    if visible_stderr:
        visible_stderr += "\n"

    return visible_stderr, events, errors


def _ensure_text(value: str | bytes | None) -> str:
    if value is None:
        return ""

    if isinstance(value, bytes):
        return value.decode(errors="replace")

    return value


def _utc_timestamp() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def run_runtime_trace(request: RuntimeTraceRequest) -> RuntimeTraceResponse:
    """Run the entry file and emit basic schema-shaped runtime events.

    This is not a production sandbox. It avoids writing submitted files to disk,
    disables imports through restricted builtins, captures output, and applies a
    timeout. Tracing currently uses Python's line tracing hook for entry-file
    line events and simple module-level variable snapshots. Function-call and
    loop-specific events are intentionally out of scope for this prototype.
    """
    errors: list[AnalysisError] = []
    files_by_path = {file.path: file for file in request.files}
    entry_file = files_by_path.get(request.entry_file)

    if entry_file is None:
        errors.append(
            AnalysisError(
                file_path=request.entry_file,
                message="Entry file was not found in submitted files.",
            )
        )

        return RuntimeTraceResponse(
            events=[],
            stdout="",
            stderr="",
            errors=errors,
        )

    try:
        completed_process = subprocess.run(
            [sys.executable, "-I", "-S", "-c", RUNNER_SCRIPT, request.entry_file],
            input=entry_file.content,
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT_SECONDS,
            check=False,
        )
    except subprocess.TimeoutExpired as error:
        stdout = _ensure_text(error.stdout)
        stderr, events, execution_errors = _extract_marked_output(request.entry_file, _ensure_text(error.stderr))
        errors.extend(execution_errors)
        errors.append(
            AnalysisError(
                file_path=request.entry_file,
                message=f"Execution timed out after {EXECUTION_TIMEOUT_SECONDS:g} seconds.",
            )
        )

        return RuntimeTraceResponse(
            events=[
                *events,
                _fallback_event(
                    "error_raised",
                    len(events),
                    request.entry_file,
                    None,
                    {"error_type": "TimeoutError", "error_message": f"Execution timed out after {EXECUTION_TIMEOUT_SECONDS:g} seconds."},
                ),
                _fallback_event(
                    "execution_finished",
                    len(events) + 1,
                    request.entry_file,
                    None,
                    {"status": "failed"},
                ),
            ],
            stdout=stdout,
            stderr=stderr,
            errors=errors,
        )

    stderr, events, execution_errors = _extract_marked_output(request.entry_file, completed_process.stderr)
    errors.extend(execution_errors)

    if completed_process.returncode != 0 and not execution_errors:
        errors.append(
            AnalysisError(
                file_path=request.entry_file,
                message="Execution failed without a structured runtime error.",
            )
        )

    return RuntimeTraceResponse(
        events=events,
        stdout=completed_process.stdout,
        stderr=stderr,
        errors=errors,
    )
