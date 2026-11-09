from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class PlantedCrop(BaseModel):
    id: Optional[str] = None
    crop_name: str # e.g. Paddy, Groundnut, Cotton, Tomato, Banana
    crop_category: str # wetland, arid_pulse, cash_crop, horticulture, tall_stalk
    variety: Optional[str] = None # e.g. BPT 5204, K-6, Bt-Cotton
    sowing_date: date
    growth_stage: str = "Vegetative" # Seedling, Vegetative, Flowering / Tillering, Pod / Grain Formation, Maturity
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
