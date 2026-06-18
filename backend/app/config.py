from pydantic_settings import BaseSettings
from pydantic import Field, model_validator
from pathlib import Path
import os

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("sqlite:///"):
        path_part = database_url[len("sqlite:///"):]
        path = Path(path_part)
        if not path.is_absolute():
            path = (PROJECT_ROOT / path_part).resolve()
        return f"sqlite:///{path.as_posix()}"
    return database_url


class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default_factory=lambda: f"sqlite:///{(PROJECT_ROOT / 'spzkb.db').as_posix()}"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "spzkb-secret-key-change-in-production-2024")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    class Config:
        env_file = BACKEND_DIR / ".env"
        env_file_encoding = "utf-8"

    @model_validator(mode="after")
    def normalize_db_url(self):
        self.DATABASE_URL = normalize_database_url(self.DATABASE_URL)
        return self


settings = Settings()
