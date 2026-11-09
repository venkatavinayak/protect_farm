from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.deps import get_current_farmer
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.schemas.farmer import FarmerOut, FarmerUpdate
from app.schemas.farm import FarmerFullProfile, FarmOut

router = APIRouter()

@router.get("/me", response_model=FarmerFullProfile)
async def get_my_profile(
    current_farmer: Farmer = Depends(get_current_farmer)
):
    """
    Returns the complete profile of the farmer from MongoDB, including all farms and planted crops.
    """
    farms = await Farm.find(Farm.farmer_id == str(current_farmer.id)).to_list()
    
    # Format farms output with string IDs
    farm_outs = []
    for f in farms:
        farm_outs.append(FarmOut(
            id=str(f.id),
            farmer_id=str(f.farmer_id),
            farm_name=f.farm_name,
            address=f.address,
            latitude=f.latitude,
            longitude=f.longitude,
            boundary_geojson=f.boundary_geojson,
            land_area_acres=f.land_area_acres,
            soil_type=f.soil_type,
            crops=f.crops,
            created_at=f.created_at
        ))

    return FarmerFullProfile(
        id=str(current_farmer.id),
        clerk_user_id=current_farmer.clerk_user_id,
        full_name=current_farmer.full_name,
        email=current_farmer.email,
        phone_number=current_farmer.phone_number,
        preferred_language=current_farmer.preferred_language,
        farms=farm_outs
    )

@router.put("/me", response_model=FarmerOut)
async def update_my_profile(
    update_data: FarmerUpdate,
    current_farmer: Farmer = Depends(get_current_farmer)
):
    """
    Updates the farmer's full name, phone number, or preferred language in MongoDB.
    """
    if update_data.full_name is not None:
        current_farmer.full_name = update_data.full_name
    if update_data.phone_number is not None:
        current_farmer.phone_number = update_data.phone_number
    if update_data.preferred_language is not None:
        current_farmer.preferred_language = update_data.preferred_language

    await current_farmer.save()
    
    return FarmerOut(
        id=str(current_farmer.id),
        clerk_user_id=current_farmer.clerk_user_id,
        full_name=current_farmer.full_name,
        email=current_farmer.email,
        phone_number=current_farmer.phone_number,
        preferred_language=current_farmer.preferred_language,
        created_at=current_farmer.created_at
    )
