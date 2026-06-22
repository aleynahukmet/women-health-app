from pydantic_settings import BaseSettings
from typing import Optional
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Women's Health App"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # "development" or "production"
    
    # CRITICAL: SECRET_KEY must be provided in .env for production
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database - Enforcing PostgreSQL for production stability
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./sql_app.db"

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_required(cls, v: str, info) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        if env == "production":
            if not v or v == "your-super-secret-key-change-this-in-production":
                raise ValueError(
                    "SECURITY ERROR: SECRET_KEY must be set in .env and cannot be the default value in production. "
                    "Backend startup aborted for security."
                )
        return v

    @field_validator("SQLALCHEMY_DATABASE_URI")
    @classmethod
    def database_uri_must_be_postgres(cls, v: str, info) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        if env == "production":
            if "sqlite" in v:
                raise ValueError(
                    "PRODUCTION ERROR: SQLite is not allowed in production due to write-locking. "
                    "Please set SQLALCHEMY_DATABASE_URI to a PostgreSQL connection string in .env."
                )
            if not v.startswith("postgresql"):
                raise ValueError("SQLALCHEMY_DATABASE_URI must be a valid PostgreSQL URI in production.")
        return v

    @property
    def get_database_url(self) -> str:
        return self.SQLALCHEMY_DATABASE_URI

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
