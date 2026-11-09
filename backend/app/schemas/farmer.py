from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FarmerBase(BaseModel):
    full_name: str
    email: str
    phone_number: Optional[str] = None
    preferred_language: str = "te" # default Telugu (or hi, ta, kn, mr, en)

class FarmerCreate(FarmerBase):
    clerk_user_id: str

class FarmerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = None

class FarmerOut(FarmerBase):
    id: int
    clerk_user_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
