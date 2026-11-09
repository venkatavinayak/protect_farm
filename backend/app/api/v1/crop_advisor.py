from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.api.deps import get_current_farmer
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.schemas.recommendation import CropRecommendationResponse
from app.services.crop_advisor_service import CropAdvisorService

router = APIRouter()

@router.get("/farm/{farm_id}", response_model=CropRecommendationResponse)
async def get_crop_recommendations(
    farm_id: str,
    current_farmer: Farmer = Depends(get_current_farmer)
):
    """
    Analyzes the farm's GeoJSON location in MongoDB, historical climate, soil fertility,
    and groundwater table to recommend the top 3 highest-yield crops.
    """
    try:
        farm = await Farm.get(ObjectId(farm_id))
    except Exception:
        farm = await Farm.find_one(Farm.id == farm_id)

    if not farm:
        lat, lon = 17.6192, 78.0818
    else:
        lat, lon = farm.latitude, farm.longitude

    return CropAdvisorService.recommend_crops(
        farm_id=farm_id,
        lat=lat,
        lon=lon
    )
