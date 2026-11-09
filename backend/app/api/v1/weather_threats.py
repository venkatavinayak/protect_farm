from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import json

from app.core.database import get_db
from app.api.deps import get_current_farmer
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.crop import PlantedCrop
from app.models.threat_log import WeatherThreatLog
from app.schemas.threat import FarmThreatReport, CropThreatAssessment
from app.services.weather_service import WeatherService
from app.services.agronomy_engine import AgronomyEngine
from app.services.xai_service import XAIService
from app.services.translation_service import TranslationService
from app.services.email_service import EmailService

router = APIRouter()

@router.get("/farm/{farm_id}", response_model=FarmThreatReport)
async def get_farm_weather_threat_report(
    farm_id: int,
    override_rain_mm: Optional[float] = None,
    override_wind_kmh: Optional[float] = None,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db)
):
    """
    Main Threat Engine Endpoint:
    1. Fetches real-time weather at farm's centroid.
    2. Runs Crop Water Requirement (CWR) & phenological vulnerability model on every crop.
    3. Paddy gets BENEFICIAL status for moderate rain; Arid crops get DANGER/ROOT-ROT.
    4. Enriches with XAI biological explainability and 3-step mitigation plan.
    5. Translates into farmer's regional language (e.g. Telugu/Hindi).
    6. Dispatches emergency email if dangerous threat is detected.
    """
    # 1. Fetch farm and crops
    stmt = (
        select(Farm)
        .options(selectinload(Farm.crops))
        .where(Farm.id == farm_id, Farm.farmer_id == current_farmer.id)
    )
    res = await db.execute(stmt)
    farm = res.scalars().first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")

    # 2. Get real-time weather
    weather = await WeatherService.get_realtime_weather(farm.latitude, farm.longitude)
    rainfall_24h = override_rain_mm if override_rain_mm is not None else weather["rainfall_24h_mm"]
    wind_kmh = override_wind_kmh if override_wind_kmh is not None else weather["wind_speed_kmh"]
    temp_c = weather["temp_c"]

    crop_assessments: List[CropThreatAssessment] = []
    farmer_lang = current_farmer.preferred_language or "te"

    # If farm has no crops yet, provide a baseline assessment
    active_crops = [c for c in farm.crops if c.is_active]
    if not active_crops:
        # Default assessment to demonstrate Paddy vs Groundnut
        paddy_assess = AgronomyEngine.assess_crop_threat(0, "Paddy", "Tillering", rainfall_24h, wind_kmh, temp_c)
        groundnut_assess = AgronomyEngine.assess_crop_threat(1, "Groundnut", "Flowering", rainfall_24h, wind_kmh, temp_c)
        active_evaluations = [(None, paddy_assess), (None, groundnut_assess)]
    else:
        active_evaluations = [
            (c, AgronomyEngine.assess_crop_threat(c.id, c.crop_name, c.growth_stage, rainfall_24h, wind_kmh, temp_c))
            for c in active_crops
        ]

    any_dangerous = False

    for crop_obj, assessment in active_evaluations:
        # Enrich explanation with XAI
        enriched = await XAIService.enrich_explanation_with_llm(
            crop_name=assessment.crop_name,
            growth_stage=assessment.growth_stage,
            rainfall_mm=rainfall_24h,
            wind_kmh=wind_kmh,
            threat_type=assessment.threat_type,
            baseline_explanation=assessment.biological_explanation
        )
        assessment.biological_explanation = enriched["explanation"]

        # Multilingual Translation
        trans = TranslationService.translate_threat_assessment(
            crop_name=assessment.crop_name,
            threat_level=assessment.threat_level,
            summary_msg=assessment.summary_message,
            bio_explanation=assessment.biological_explanation,
            steps=assessment.mitigation_steps,
            target_lang=farmer_lang
        )
        assessment.translated_summary = trans["translated_summary"]
        assessment.translated_explanation = trans["translated_explanation"]
        assessment.translated_mitigation_steps = trans["translated_steps"]
        assessment.audio_text_script = trans["audio_script"]

        crop_assessments.append(assessment)

        # Log and send alert if dangerous
        if assessment.is_dangerous:
            any_dangerous = True
            log_entry = WeatherThreatLog(
                farm_id=farm.id,
                crop_id=crop_obj.id if crop_obj else None,
                threat_level=assessment.threat_level,
                threat_type=assessment.threat_type,
                weather_summary=weather.get("description", "Heavy Precipitation"),
                weather_data_json=json.dumps(weather),
                xai_explanation=assessment.biological_explanation,
                mitigation_steps_json=json.dumps([s.model_dump() for s in assessment.mitigation_steps]),
                regional_language=farmer_lang,
                translated_explanation=assessment.translated_explanation,
                translated_steps_json=json.dumps([s.model_dump() for s in assessment.translated_mitigation_steps]),
                email_sent=True
            )
            db.add(log_entry)

            # Fire email notification in background
            await EmailService.send_threat_alert_email(
                farmer_email=current_farmer.email,
                farmer_name=current_farmer.full_name,
                farm_name=farm.farm_name,
                crop_name=assessment.crop_name,
                threat_level=assessment.threat_level,
                threat_type=assessment.threat_type,
                rainfall_mm=rainfall_24h,
                wind_kmh=wind_kmh,
                explanation=assessment.biological_explanation,
                mitigation_steps=assessment.mitigation_steps
            )

    await db.commit()

    return FarmThreatReport(
        farm_id=farm.id,
        farm_name=farm.farm_name,
        location={"latitude": farm.latitude, "longitude": farm.longitude},
        current_weather=weather,
        forecast_24h_rainfall_mm=rainfall_24h,
        max_wind_speed_kmh=wind_kmh,
        weather_condition=weather.get("condition", "Convective Rain"),
        crop_assessments=crop_assessments
    )
