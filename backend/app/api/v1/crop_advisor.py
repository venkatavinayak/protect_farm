from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.api.deps import get_current_farmer
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.schemas.recommendation import CropRecommendationResponse
from app.services.crop_advisor_service import CropAdvisorService

router = APIRouter()

@router.get("/farm/{farm_id}", response_model=CropRecommendationResponse)
async def get_crop_recommendations(
    farm_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes the farm's GeoJSON location, historical climate, soil fertility,
    and groundwater table to recommend the top 3 highest-yield crops.
    """
    farm_res = await db.execute(
        select(Farm).where(Farm.id == farm_id, Farm.farmer_id == current_farmer.id)
    )
    farm = farm_res.scalars().first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")

    return CropAdvisorService.recommend_crops(
        farm_id=farm.id,
        lat=farm.latitude,
        lon=farm.longitude
    )
