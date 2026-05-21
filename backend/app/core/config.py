from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Use `.env.example` as the local template. OpenAI settings are optional until
    the mentor endpoint is wired to call a real LLM.
    """

    app_name: str = "PROJECT OOH-AHH Backend"
    environment: str = "local"
    openai_api_key: str | None = Field(default=None, validation_alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4.1-mini", validation_alias="OPENAI_MODEL")

    model_config = SettingsConfigDict(env_prefix="OOH_AHH_", env_file=(".env", "../.env"), extra="ignore")


settings = Settings()
