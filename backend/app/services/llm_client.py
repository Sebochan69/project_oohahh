from typing import Any

from app.core.config import settings


def create_openai_client() -> Any | None:
    """Create an OpenAI client only when configuration is available.

    This factory is intentionally unused by mentor responses for now. Future AI
    integration should call this after setting `OPENAI_API_KEY`; without a key,
    the backend keeps running and mentor endpoints should use placeholder
    behavior.
    """
    if not settings.openai_api_key:
        return None

    try:
        from openai import OpenAI
    except ImportError:
        return None

    return OpenAI(api_key=settings.openai_api_key)


def configured_openai_model() -> str:
    """Return the configured OpenAI model name for future mentor calls."""
    return settings.openai_model
