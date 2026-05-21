import json
from pathlib import Path
from typing import Any

from app.models.mentor import MentorRequest, MentorResponse
from app.services.llm_client import configured_openai_model, create_openai_client

PROMPT_ROOT = Path(__file__).resolve().parents[2] / "prompts" / "mentor"
ACTION_PROMPTS = {
    "explain_this": "explain_this.md",
    "give_hint": "give_hint.md",
}


def load_prompt_file(file_name: str) -> str:
    """Load a mentor prompt template from `backend/prompts/mentor`.

    Prompt files are static learning constraints. Missing files raise an
    exception so the caller can safely fall back to placeholder behavior.
    """
    return (PROMPT_ROOT / file_name).read_text(encoding="utf-8")


def create_placeholder_mentor_response(request: MentorRequest) -> MentorResponse:
    """Return the safe local response used when OpenAI is unavailable."""
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


def mentor_context_payload(request: MentorRequest) -> str:
    """Serialize mentor context for a single-turn model request."""
    return json.dumps(
        {
            "action": request.action,
            "mode": request.mode,
            "selected_event": request.selected_event,
            "selected_node": request.selected_node,
            "validation_summary": request.validation_summary,
            "misconceptions": [misconception.model_dump() for misconception in request.misconceptions],
            "lesson": request.lesson.model_dump() if request.lesson else None,
        },
        indent=2,
        default=str,
    )


def response_text(response: Any) -> str:
    """Extract text from the OpenAI Responses API result."""
    output_text = getattr(response, "output_text", None)

    if output_text:
        return str(output_text).strip()

    return str(response).strip()


def create_openai_mentor_response(request: MentorRequest) -> MentorResponse | None:
    """Generate a single-turn mentor response with OpenAI when configured.

    This call is guarded by `create_openai_client`; if the API key, SDK, prompt
    files, or request fails, callers should use placeholder mentor behavior.
    """
    client = create_openai_client()

    if client is None:
        return None

    system_prompt = load_prompt_file("system.md")
    action_prompt = load_prompt_file(ACTION_PROMPTS[request.action])
    context = mentor_context_payload(request)
    response = client.responses.create(
        model=configured_openai_model(),
        instructions=f"{system_prompt}\n\n{action_prompt}",
        input=(
            "Use the following OOH-AHH mentor context. Return concise guidance "
            "only, without full solution code.\n\n"
            f"{context}"
        ),
    )
    message = response_text(response)

    if not message:
        return None

    return MentorResponse(
        message=message,
        tone="technical" if request.mode == "engineer" else "supportive",
        next_suggested_action="Inspect the relevant runtime step, then make one small change and run again.",
        safety_notes=[
            "OpenAI-generated response; no code was edited.",
            "The mentor should guide learning without providing a full solution.",
        ],
        learning_constraints=[
            "Response used lesson, selected event/node, validation, and misconception context.",
        ],
    )


def create_mentor_response(request: MentorRequest) -> MentorResponse:
    """Create a mentor response, using OpenAI when configured and fallback otherwise."""
    try:
        openai_response = create_openai_mentor_response(request)
    except Exception:
        openai_response = None

    return openai_response or create_placeholder_mentor_response(request)
