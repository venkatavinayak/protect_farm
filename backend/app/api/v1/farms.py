from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_farmer
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.crop import PlantedCrop
from app.schemas.farm import FarmCreate, FarmOut
from app.schemas.crop import CropCreate, CropOut

router = APIRouter()

@router.get("", response_model=List[FarmOut])
async def list_farms(
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all registered farms for the current farmer with their active crops.
    """
    stmt = (
        select(Farm)
        .options(selectinload(Farm.crops))
        .where(Farm.farmer_id == current_farmer.id)
    )
    result = await db.execute(stmt)
    farms = result.scalars().all()
    return farms

@router.post("", response_model=FarmOut, status_code=status.HTTP_201_CREATED)
async def create_farm(
    farm_in: FarmCreate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new farm parcel with centroid coordinates, land area, and boundary polygon.
    """
    farm = Farm(
        farmer_id=current_farmer.id,
        farm_name=farm_in.farm_name,
        address=farm_in.address,
        latitude=farm_in.latitude,
        longitude=farm_in.longitude,
        boundary_geojson=farm_in.boundary_geojson,
        land_area_acres=farm_in.land_area_acres,
        soil_type=farm_in.soil_type
    )
    db.add(farm)
    await db.commit()
    await db.refresh(farm)
    
    # Reload with empty crops
    stmt = select(Farm).options(selectinload(Farm.crops)).where(Farm.id == farm.id)
    result = await db.execute(stmt)
    return result.scalars().first()

@router.post("/{farm_id}/crops", response_model=CropOut, status_code=status.HTTP_201_CREATED)
async def add_crop_to_farm(
    farm_id: int,
    crop_in: CropCreate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db)
):
    """
    Adds a planted crop to a specific farm (allows multiple crops, planting dates, and stages).
    """
    # Verify farm ownership
    farm_res = await db.execute(
        select(Farm).where(Farm.id == farm_id, Farm.farmer_id == current_farmer.id)
    )
    farm = farm_res.scalars().first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")

    new_crop = PlantedCrop(
        farm_id=farm_id,
        crop_name=crop_in.crop_name,
        crop_category=crop_in.crop_category,
        variety=crop_in.variety,
        sowing_date=crop_in.sowing_date,
        growth_stage=crop_in.growth_stage,
        is_active=True
    )
    db.add(new_crop)
    await db.commit()
    await db.refresh(new_crop)
    return new_crop
