from typing import Literal

from pydantic import BaseModel, Field


class AnalysisFile(BaseModel):
    path: str = Field(..., min_length=1)
    content: str = ""


class StaticAnalysisRequest(BaseModel):
    files: list[AnalysisFile] = Field(default_factory=list)
    entry_file: str = Field(..., min_length=1)


class StaticFileSummary(BaseModel):
    path: str
    line_count: int
    character_count: int
    is_entry: bool


class ImportSummary(BaseModel):
    file_path: str
    module: str
    name: str | None = None
    import_type: Literal["import", "from_import"]
    line_number: int | None = None


class FunctionSummary(BaseModel):
    file_path: str
    name: str
    line_number: int | None = None
    argument_names: list[str] = Field(default_factory=list)


class ClassSummary(BaseModel):
    file_path: str
    name: str
    line_number: int | None = None


class FunctionCallSummary(BaseModel):
    file_path: str
    caller_name: str | None = None
    caller_type: Literal["top_level", "function", "class"] = "top_level"
    callee_name: str
    line_number: int | None = None
    argument_count: int = 0


class AnalysisError(BaseModel):
    file_path: str | None = None
    message: str
    line_number: int | None = None


class StaticAnalysisResponse(BaseModel):
    files: list[StaticFileSummary]
    imports: list[ImportSummary]
    functions: list[FunctionSummary]
    classes: list[ClassSummary]
    calls: list[FunctionCallSummary] = Field(default_factory=list)
    errors: list[AnalysisError]
