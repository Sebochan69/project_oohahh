from pydantic import BaseModel, Field

from app.models.analysis import AnalysisError, AnalysisFile


class RuntimeTraceRequest(BaseModel):
    files: list[AnalysisFile] = Field(default_factory=list)
    entry_file: str = Field(..., min_length=1)


class RuntimeTraceEvent(BaseModel):
    id: str
    type: str
    step: int
    payload: dict = Field(default_factory=dict)


class RuntimeTraceResponse(BaseModel):
    events: list[RuntimeTraceEvent]
    stdout: str
    stderr: str
    errors: list[AnalysisError]
