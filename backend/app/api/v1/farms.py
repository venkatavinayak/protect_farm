from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
import json
from app.api.deps import get_current_farmer
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.crop import PlantedCrop
from app.schemas.farm import FarmCreate, FarmOut
from app.schemas.crop import CropCreate, CropOut

router = APIRouter()

@router.get("", response_model=List[FarmOut])
async def list_farms(
    current_farmer: Farmer = Depends(get_current_farmer)
):
    """
    Returns all registered farms from MongoDB for the current farmer with their active crops.
    """
    farms = await Farm.find(Farm.farmer_id == str(current_farmer.id)).to_list()
    return [
        FarmOut(
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
        )
        for f in farms
    ]

@router.post("", response_model=FarmOut, status_code=status.HTTP_201_CREATED)
async def create_farm(
    farm_in: FarmCreate,
    current_farmer: Farmer = Depends(get_current_farmer)
):
    """
    Creates a new farm parcel in MongoDB with GeoJSON Point coordinates for 2dsphere indexing.
    """
    # Create GeoJSON Point [lon, lat]
    geojson_point = {
        "type": "Point",
        "coordinates": [farm_in.longitude, farm_in.latitude]
    }

    farm = Farm(
        farmer_id=str(current_farmer.id),
        farm_name=farm_in.farm_name,
        address=farm_in.address,
        latitude=farm_in.latitude,
        longitude=farm_in.longitude,
        location=geojson_point,
        boundary_geojson=farm_in.boundary_geojson,
        land_area_acres=farm_in.land_area_acres,
        soil_type=farm_in.soil_type,
        crops=[]
    )
    await farm.insert()

    return FarmOut(
        id=str(farm.id),
        farmer_id=str(farm.farmer_id),
        farm_name=farm.farm_name,
        address=farm.address,
        latitude=farm.latitude,
        longitude=farm.longitude,
        boundary_geojson=farm.boundary_geojson,
        land_area_acres=farm.land_area_acres,
        soil_type=farm.soil_type,
        crops=farm.crops,
        created_at=farm.created_at
    )

@router.post("/{farm_id}/crops", response_model=CropOut, status_code=status.HTTP_201_CREATED)
async def add_crop_to_farm(
    farm_id: str,
    crop_in: CropCreate,
    current_farmer: Farmer = Depends(get_current_farmer)
):
    """
    Adds a planted crop to a specific farm document in MongoDB.
    """
    try:
        farm = await Farm.get(ObjectId(farm_id))
    except Exception:
        farm = await Farm.find_one(Farm.id == farm_id)

    if not farm or str(farm.farmer_id) != str(current_farmer.id):
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")

    new_crop = PlantedCrop(
        id=str(ObjectId()),
        crop_name=crop_in.crop_name,
        crop_category=crop_in.crop_category,
        variety=crop_in.variety,
        sowing_date=crop_in.sowing_date,
        growth_stage=crop_in.growth_stage,
        is_active=True
    )
    farm.crops.append(new_crop)
    await farm.save()

    return CropOut(
        id=new_crop.id,
        farm_id=str(farm.id),
        crop_name=new_crop.crop_name,
        crop_category=new_crop.crop_category,
        variety=new_crop.variety,
        sowing_date=new_crop.sowing_date,
        growth_stage=new_crop.growth_stage,
        is_active=new_crop.is_active,
        created_at=new_crop.created_at
    )
