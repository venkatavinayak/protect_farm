from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.api.deps import get_current_farmer
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.schemas.farmer import FarmerOut, FarmerUpdate
from app.schemas.farm import FarmerFullProfile

router = APIRouter()

@router.get("/me", response_model=FarmerFullProfile)
async def get_my_profile(
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the complete profile of the farmer, including their farms and planted crops.
    """
    stmt = (
        select(Farmer)
        .options(selectinload(Farmer.farms).selectinload(Farm.crops))
        .where(Farmer.id == current_farmer.id)
    )
    result = await db.execute(stmt)
    farmer_with_relations = result.scalars().first()
    return farmer_with_relations

@router.put("/me", response_model=FarmerOut)
async def update_my_profile(
    update_data: FarmerUpdate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the farmer's full name, phone number, or preferred language.
    """
    if update_data.full_name is not None:
        current_farmer.full_name = update_data.full_name
    if update_data.phone_number is not None:
        current_farmer.phone_number = update_data.phone_number
    if update_data.preferred_language is not None:
        current_farmer.preferred_language = update_data.preferred_language

    db.add(current_farmer)
    await db.commit()
    await db.refresh(current_farmer)
    return current_farmer
