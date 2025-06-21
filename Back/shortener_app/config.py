from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    env_name: str = "Local"
    base_url: str = "http://localhost:8000"
    database_url: str = "sqlite:///./shortener.db"

    model_config = {
        "env_file": ".env"
    }

@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    print(f"Loading settings for: {settings.env_name}")
    return settings