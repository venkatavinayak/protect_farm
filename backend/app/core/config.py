from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, validator
import json
import os

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "PROTECTFARM Real-Time Intelligence API"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins (Netlify, local Vite/Next.js)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.netlify.app",
        "https://localhost"
    ]
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./protectfarm.db"
    
    # Clerk Auth
    CLERK_SECRET_KEY: str = "mock_secret"
    CLERK_JWKS_URL: str = "https://api.clerk.com/v1/jwks"
    
    # Weather & AI
    OPENWEATHER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Notifications / Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "PROTECTFARM Alerts <alerts@protectfarm.org>"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
