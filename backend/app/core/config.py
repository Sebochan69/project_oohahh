from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PROJECT OOH-AHH Backend"
    environment: str = "local"

    model_config = SettingsConfigDict(env_prefix="OOH_AHH_")


settings = Settings()
