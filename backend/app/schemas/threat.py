from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MitigationStep(BaseModel):
    step_number: int
    timing_window: str # e.g. "Next 6 Hours", "During Rainfall", "Within 24 Hours Post-Rain"
    action_title: str
    action_description: str

class CropThreatAssessment(BaseModel):
    crop_id: int
    crop_name: str
    crop_category: str
    growth_stage: str
    threat_level: str # BENEFICIAL, SAFE, ADVISORY, WARNING, CRITICAL
    threat_type: str
    is_dangerous: bool
    summary_message: str
    biological_explanation: str
    mitigation_steps: List[MitigationStep]
    translated_summary: Optional[str] = None
    translated_explanation: Optional[str] = None
    translated_mitigation_steps: Optional[List[MitigationStep]] = None
    voice_audio_base64: Optional[str] = None
    audio_text_script: str

class FarmThreatReport(BaseModel):
    farm_id: int
    farm_name: str
    location: Dict[str, float] # lat, lon
    current_weather: Dict[str, Any]
    forecast_24h_rainfall_mm: float
    max_wind_speed_kmh: float
    weather_condition: str
    crop_assessments: List[CropThreatAssessment]
    timestamp: datetime = datetime.utcnow()
