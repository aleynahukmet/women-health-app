from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Women's Health App"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "app"
    SQLALCHEMY_DATABASE_URI: Optional[str] = "sqlite:///./sql_app.db"

    @property
    def get_database_url(self) -> str:
        return self.SQLALCHEMY_DATABASE_URI

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
