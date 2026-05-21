from fastapi import APIRouter

from app.models.analysis import StaticAnalysisRequest, StaticAnalysisResponse
from app.services.static_analysis import analyze_static

router = APIRouter(prefix="/api/v1/analyze", tags=["analysis"])


@router.post("/static", response_model=StaticAnalysisResponse)
def analyze_static_endpoint(request: StaticAnalysisRequest) -> StaticAnalysisResponse:
    return analyze_static(request)
