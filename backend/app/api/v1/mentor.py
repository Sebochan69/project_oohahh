from fastapi import APIRouter

from app.models.mentor import MentorRequest, MentorResponse
from app.services.mentor import create_mentor_response

router = APIRouter(prefix="/api/v1/mentor", tags=["mentor"])


@router.post("/respond", response_model=MentorResponse)
def mentor_response_endpoint(request: MentorRequest) -> MentorResponse:
    return create_mentor_response(request)
