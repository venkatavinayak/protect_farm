from beanie import Document
from pydantic import Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class WeatherThreatLog(Document):
    farm_id: str = Field(..., index=True)
    crop_name: str
    threat_level: str # BENEFICIAL, SAFE, ADVISORY, WARNING, CRITICAL
    threat_type: str # Root_Rot_and_Anoxia_Hypoxia, Lodging, etc.
    weather_summary: str
    weather_data: Dict[str, Any]
    xai_explanation: str
    mitigation_steps: List[Dict[str, Any]]
    regional_language: str = "te"
    translated_explanation: Optional[str] = None
    translated_steps: Optional[List[Dict[str, Any]]] = None
    audio_script: str
    email_sent: bool = False
    is_resolved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "weather_threat_logs"
