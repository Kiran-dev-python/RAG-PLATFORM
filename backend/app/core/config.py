from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    # DATABASE_URL: str = "postgresql+psycopg2://postgres:kiran@localhost:5432/RAG"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:kiran@localhost:5432/RAG"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    # Embeddings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 20
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # File upload
    MAX_FILE_SIZE_MB: int = 20
    ALLOWED_EXTENSIONS: list = ["pdf", "txt", "md", "docx"]

    # LLM - using Groq (free)
    GROQ_API_KEY: str = "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"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    APP_ENV: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
