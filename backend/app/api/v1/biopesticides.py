from fastapi import APIRouter, Query
from typing import Optional
from app.schemas.biopesticide import BioPesticideQueryResponse
from app.services.biopesticide_service import BioPesticideService

router = APIRouter()

@router.get("", response_model=BioPesticideQueryResponse)
async def get_biopesticides(
    threat_type: Optional[str] = Query("root_rot", description="Threat or disease to treat"),
    crop_name: Optional[str] = Query(None, description="Affected crop name")
):
    """
    Returns curated 100% organic, eco-friendly bio-pesticides and bio-fungicides
    with live commercial purchasing links (BigHaat, AgriBegri, Amazon India).
    """
    return BioPesticideService.get_recommendations_for_threat(threat_type, crop_name)
