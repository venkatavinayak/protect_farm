from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Resolve path to backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

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
    
    # MongoDB Database configuration (Local or MongoDB Atlas)
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "protectfarm"
    
    # Clerk Auth
    CLERK_SECRET_KEY: str = "mock_secret"
    CLERK_JWKS_URL: str = "https://api.clerk.com/v1/jwks"
    
    # Weather & AI Providers
    OPENWEATHER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    SARVAM_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    
    # Notifications / Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "PROTECTFARM Alerts <alerts@protectfarm.org>"

    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
