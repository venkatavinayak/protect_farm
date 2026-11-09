from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import init_db, close_db
from app.api.v1 import farmers, farms, weather_threats, crop_advisor, biopesticides

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("protectfarm")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize MongoDB connection and Beanie ODM
    logger.info("Connecting to MongoDB and initializing Beanie ODM...")
    await init_db()
    yield
    # Cleanup MongoDB connection
    await close_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Real-Time Geospatial Agricultural Intelligence & Farmer Welfare Platform (MongoDB + Beanie)",
    lifespan=lifespan
)

# CORS setup for Netlify frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(farmers.router, prefix=f"{settings.API_V1_STR}/farmers", tags=["Farmers"])
app.include_router(farms.router, prefix=f"{settings.API_V1_STR}/farms", tags=["Farms & Crops"])
app.include_router(weather_threats.router, prefix=f"{settings.API_V1_STR}/weather-threats", tags=["Weather Threat Engine"])
app.include_router(crop_advisor.router, prefix=f"{settings.API_V1_STR}/crop-advisor", tags=["AI Crop Advisor"])
app.include_router(biopesticides.router, prefix=f"{settings.API_V1_STR}/biopesticides", tags=["Bio-Pesticides"])

@app.get("/health", tags=["Health"])
async def health_check():
    """Render health check endpoint"""
    return {
        "status": "healthy",
        "service": "PROTECTFARM Real-Time Intelligence API",
        "database": "MongoDB (Beanie ODM)"
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to PROTECTFARM API with MongoDB. Real-time protection for farmers.",
        "docs_url": "/docs"
    }
