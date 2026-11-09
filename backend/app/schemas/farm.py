from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from app.schemas.crop import CropOut

class FarmBase(BaseModel):
    farm_name: str = "My Main Farm"
    address: Optional[str] = None
    latitude: float
    longitude: float
    boundary_geojson: Optional[str] = None # JSON string or GeoJSON representation
    land_area_acres: float = 1.0
    soil_type: str = "Black Clayey Loam"

class FarmCreate(FarmBase):
    pass

class FarmOut(FarmBase):
    id: int
    farmer_id: int
    created_at: Optional[datetime] = None
    crops: List[CropOut] = []

    class Config:
        from_attributes = True

class FarmerFullProfile(BaseModel):
    id: int
    clerk_user_id: str
    full_name: str
    email: str
    phone_number: Optional[str] = None
    preferred_language: str
    farms: List[FarmOut] = []

    class Config:
        from_attributes = True
