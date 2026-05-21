from app.models.analysis import (
    AnalysisError,
    StaticAnalysisRequest,
    StaticAnalysisResponse,
    StaticFileSummary,
)


def analyze_static(request: StaticAnalysisRequest) -> StaticAnalysisResponse:
    file_summaries = [
        StaticFileSummary(
            path=file.path,
            line_count=len(file.content.splitlines()),
            character_count=len(file.content),
            is_entry=file.path == request.entry_file,
        )
        for file in request.files
    ]

    errors: list[AnalysisError] = []

    if request.entry_file not in {file.path for file in request.files}:
        errors.append(
            AnalysisError(
                file_path=request.entry_file,
                message="Entry file was not found in submitted files.",
            )
        )

    return StaticAnalysisResponse(
        files=file_summaries,
        imports=[],
        functions=[],
        errors=errors,
    )
