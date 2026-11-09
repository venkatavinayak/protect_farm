from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class CropBase(BaseModel):
    crop_name: str
    crop_category: str # wetland, arid_pulse, cash_crop, horticulture, tall_stalk
    variety: Optional[str] = None
    sowing_date: date
    growth_stage: str = "Vegetative" # Seedling, Vegetative, Flowering / Tillering, Maturity

class CropCreate(CropBase):
    farm_id: Optional[str] = None

class CropOut(CropBase):
    id: Optional[str] = None
    farm_id: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
