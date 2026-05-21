from app.models.mentor import MentorRequest, MentorResponse


def create_mentor_response(request: MentorRequest) -> MentorResponse:
    """Return a local placeholder response for the future AI mentor service."""
    if request.misconceptions:
        misconception = request.misconceptions[0]
        message = f"{misconception.message} Focus on: {misconception.suggested_focus}"
    elif request.action == "give_hint":
      message = "Try inspecting the current runtime step and compare it with the lesson goal."
    else:
      message = "This selected runtime context is ready for a future AI-generated explanation."

    tone = "technical" if request.mode == "engineer" else "supportive"

    return MentorResponse(
        message=message,
        tone=tone,
        next_suggested_action="Review the selected event, then run the code again after a small change.",
        safety_notes=[
            "Placeholder response only; no external AI model was called.",
            "The mentor will not edit learner code or provide a full solution.",
        ],
        learning_constraints=[
            "Keep guidance tied to the selected event, validation summary, misconceptions, and lesson context.",
        ],
    )
