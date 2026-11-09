from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class CropBase(BaseModel):
    crop_name: str
    crop_category: str # wetland, arid_pulse, cash_crop, horticulture, tall_stalk
    variety: Optional[str] = None
    sowing_date: date
    growth_stage: str = "Vegetative" # Seedling, Vegetative, Flowering, Maturity

class CropCreate(CropBase):
    farm_id: int

class CropOut(CropBase):
    id: int
    farm_id: int
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
