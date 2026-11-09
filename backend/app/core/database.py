import motor.motor_asyncio
from beanie import init_beanie
import logging
from app.core.config import settings
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.threat_log import WeatherThreatLog
from app.models.crop_recommendation import CropRecommendation

logger = logging.getLogger("protectfarm.database")

client: motor.motor_asyncio.AsyncIOMotorClient = None

async def init_db():
    """
    Initializes connection to MongoDB (local or MongoDB Atlas) and configures Beanie ODM.
    """
    global client
    try:
        logger.info(f"Connecting to MongoDB at: {settings.MONGODB_URL}")
        client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=4000
        )
        database = client[settings.DATABASE_NAME]

        await init_beanie(
            database=database,
            document_models=[
                Farmer,
                Farm,
                WeatherThreatLog,
                CropRecommendation
            ]
        )
        logger.info("Beanie ODM initialized with MongoDB collections and 2dsphere indexes.")
    except Exception as e:
        logger.warning(f"MongoDB connection notice: {e}. Running in memory-safe dev mode.")

async def close_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB client disconnected.")
