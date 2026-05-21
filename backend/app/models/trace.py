from pydantic import BaseModel, Field

from app.models.analysis import AnalysisError, AnalysisFile


class RuntimeTraceRequest(BaseModel):
    files: list[AnalysisFile] = Field(default_factory=list)
    entry_file: str = Field(..., min_length=1)


class RuntimeTraceEvent(BaseModel):
    id: str
    type: str
    timestamp: str
    step: int
    file_path: str
    line_number: int | None
    scope: dict
    payload: dict = Field(default_factory=dict)
    visual: dict = Field(default_factory=dict)
    validation: dict | None = None


class RuntimeTraceResponse(BaseModel):
    events: list[RuntimeTraceEvent]
    stdout: str
    stderr: str
    errors: list[AnalysisError]
