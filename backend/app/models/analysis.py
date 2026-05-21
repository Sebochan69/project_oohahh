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
    line_number: int | None = None


class FunctionSummary(BaseModel):
    file_path: str
    name: str
    line_number: int | None = None


class AnalysisError(BaseModel):
    file_path: str | None = None
    message: str
    line_number: int | None = None


class StaticAnalysisResponse(BaseModel):
    files: list[StaticFileSummary]
    imports: list[ImportSummary]
    functions: list[FunctionSummary]
    errors: list[AnalysisError]
