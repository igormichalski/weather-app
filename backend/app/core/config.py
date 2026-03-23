from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # APIs externas
    openweather_api_key: str = ""
    google_maps_api_key: str = ""
    youtube_api_key: str = ""

    # Banco de dados
    database_url: str = "sqlite:///./weather_app.db"

    # App
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
