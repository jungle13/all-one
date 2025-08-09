from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, validator
from typing import Optional, Dict, Any
import os


class Settings(BaseSettings):
    # Project Metadata
    PROJECT_NAME: str = "Raffle API - Jungle One"
    API_V1_STR: str = "/api/v1"

    # Database Configuration
    #DATABASE_URL: str = "postgresql+asyncpg://postgres:1234@localhost:5432/raffle"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:1234@localhost:5432/raffle")
    # ASYNC_DATABASE_URL: Optional[str] = None

    # @validator("ASYNC_DATABASE_URL", pre=True)
    # def assemble_async_db_url(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
    #     if isinstance(v, str):
    #         return v
    #     return str(values.get("DATABASE_URL")).replace(
    #         "postgresql", "postgresql+asyncpg"
    #     )

    # Security
    SECRET_KEY: str = "your-very-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
