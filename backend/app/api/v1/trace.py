from fastapi import APIRouter

from app.models.trace import RuntimeTraceRequest, RuntimeTraceResponse
from app.services.runtime_trace import run_runtime_trace

router = APIRouter(prefix="/api/v1/trace", tags=["trace"])


@router.post("/run", response_model=RuntimeTraceResponse)
def run_trace_endpoint(request: RuntimeTraceRequest) -> RuntimeTraceResponse:
    return run_runtime_trace(request)
