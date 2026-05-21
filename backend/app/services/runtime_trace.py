from app.models.analysis import AnalysisError
from app.models.trace import RuntimeTraceRequest, RuntimeTraceResponse


def run_runtime_trace(request: RuntimeTraceRequest) -> RuntimeTraceResponse:
    errors: list[AnalysisError] = []

    if request.entry_file not in {file.path for file in request.files}:
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
