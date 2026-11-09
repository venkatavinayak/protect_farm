from beanie import Document
from pydantic import Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class CropRecommendation(Document):
    farm_id: str = Field(..., index=True)
    detected_soil_type: str
    soil_ph: float
    water_table_depth: str
    annual_rainfall_profile: str
    top_recommendations: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "crop_recommendations"
