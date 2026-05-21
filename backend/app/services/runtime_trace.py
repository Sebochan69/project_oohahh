import json
import subprocess
import sys
from textwrap import dedent

from app.models.analysis import AnalysisError
from app.models.trace import RuntimeTraceRequest, RuntimeTraceResponse

EXECUTION_TIMEOUT_SECONDS = 2.0
ERROR_MARKER = "__OOH_AHH_ERROR__"

RUNNER_SCRIPT = dedent(
    f"""
    import builtins
    import json
    import sys
    import traceback

    ERROR_MARKER = {ERROR_MARKER!r}
    file_path = sys.argv[1]
    source = sys.stdin.read()

    def emit_error(kind, message, line_number=None):
        payload = {{
            "kind": kind,
            "message": message,
            "line_number": line_number,
        }}
        print(ERROR_MARKER + json.dumps(payload), file=sys.stderr)

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

    try:
        code = compile(source, file_path, "exec")
    except SyntaxError as error:
        emit_error("syntax_error", error.msg, error.lineno)
        traceback.print_exception(error, file=sys.stderr)
        raise SystemExit(1)

    try:
        exec(code, globals_for_exec, globals_for_exec)
    except BaseException as error:
        traceback_summary = traceback.extract_tb(error.__traceback__)
        user_frames = [frame for frame in traceback_summary if frame.filename == file_path]
        line_number = user_frames[-1].lineno if user_frames else None
        emit_error(type(error).__name__, str(error), line_number)
        traceback.print_exception(error, file=sys.stderr)
        raise SystemExit(1)
    """
)


def _extract_marked_errors(file_path: str, stderr: str) -> tuple[str, list[AnalysisError]]:
    errors: list[AnalysisError] = []
    visible_stderr_lines: list[str] = []

    for line in stderr.splitlines():
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

    return visible_stderr, errors


def _ensure_text(value: str | bytes | None) -> str:
    if value is None:
        return ""

    if isinstance(value, bytes):
        return value.decode(errors="replace")

    return value


def run_runtime_trace(request: RuntimeTraceRequest) -> RuntimeTraceResponse:
    """Run the entry file in a constrained prototype subprocess.

    This is not a production sandbox. It avoids writing submitted files to disk,
    disables imports through restricted builtins, captures output, and applies a
    timeout, but it should not be treated as a complete security boundary.
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
        stderr = _ensure_text(error.stderr)
        errors.append(
            AnalysisError(
                file_path=request.entry_file,
                message=f"Execution timed out after {EXECUTION_TIMEOUT_SECONDS:g} seconds.",
            )
        )

        return RuntimeTraceResponse(
            events=[],
            stdout=stdout,
            stderr=stderr,
            errors=errors,
        )

    stderr, execution_errors = _extract_marked_errors(request.entry_file, completed_process.stderr)
    errors.extend(execution_errors)

    if completed_process.returncode != 0 and not execution_errors:
        errors.append(
            AnalysisError(
                file_path=request.entry_file,
                message="Execution failed without a structured runtime error.",
            )
        )

    return RuntimeTraceResponse(
        events=[],
        stdout=completed_process.stdout,
        stderr=stderr,
        errors=errors,
    )
