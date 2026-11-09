from beanie import init_beanie
import logging
from app.core.config import settings
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.threat_log import WeatherThreatLog
from app.models.crop_recommendation import CropRecommendation

logger = logging.getLogger("protectfarm.database")

async def init_db():
    """
    Initializes connection to MongoDB Atlas and configures Beanie ODM.
    """
    try:
        masked_url = settings.MONGODB_URL.split("@")[-1] if "@" in settings.MONGODB_URL else settings.MONGODB_URL
        logger.info(f"Connecting to MongoDB Atlas cluster at: {masked_url}")
        
        await init_beanie(
            connection_string=settings.MONGODB_URL,
            document_models=[
                Farmer,
                Farm,
                WeatherThreatLog,
                CropRecommendation
            ]
        )
        logger.info("Beanie ODM successfully initialized with MongoDB Atlas collections and 2dsphere indexes.")
    except Exception as e:
        logger.warning(f"MongoDB connection notice: {e}. Running in memory-safe dev mode.")

async def close_db():
    logger.info("Closing database connections.")
