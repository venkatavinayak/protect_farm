from beanie import Document, Indexed
from pydantic import Field
from typing import Optional
from datetime import datetime

class Farmer(Document):
    clerk_user_id: Indexed(str, unique=True)
    full_name: str
    email: Indexed(str, unique=True)
    phone_number: Optional[str] = None
    preferred_language: str = "te" # default Telugu (or hi, ta, kn, mr, en)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "farmers"
