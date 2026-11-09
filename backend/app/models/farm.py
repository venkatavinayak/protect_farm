from beanie import Document, Indexed
from pydantic import Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import pymongo
from app.models.crop import PlantedCrop
from app.models.spatial import GeoJSONPoint

class Farm(Document):
    farmer_id: str = Field(..., index=True)
    farm_name: str = "My Main Farm"
    address: Optional[str] = None
    latitude: float
    longitude: float
    # GeoJSON representation for MongoDB 2dsphere spatial index
    location: Optional[Dict[str, Any]] = None 
    boundary_geojson: Optional[str] = None
    land_area_acres: float = 1.0
    soil_type: str = "Black Clayey Loam"
    crops: List[PlantedCrop] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "farms"
        indexes = [
            [("location", pymongo.GEOSPHERE)],
            "farmer_id"
        ]
