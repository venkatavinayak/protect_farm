from pydantic import BaseModel
from typing import List, Optional

class RecommendedCrop(BaseModel):
    rank: int
    crop_name: str
    variety: str
    match_percentage: int
    projected_yield_per_acre: str
    estimated_profit_per_acre: str
    water_requirement: str # Low, Medium, High
    growing_duration_days: int
    agronomic_rationale: str

class CropRecommendationResponse(BaseModel):
    farm_id: int
    latitude: float
    longitude: float
    detected_soil_type: str
    soil_ph: float
    water_table_depth: str
    annual_rainfall_profile: str
    top_recommendations: List[RecommendedCrop]
