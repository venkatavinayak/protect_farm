import httpx
import json
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.threat import MitigationStep

class XAIService:
    """
    Explainable AI (XAI) Service:
    Provides deep biological causation and 3 structured step-by-step mitigation actions.
    Leverages Google Gemini API when available, with instant expert agronomist fallback.
    """

    @classmethod
    async def enrich_explanation_with_llm(
        cls,
        crop_name: str,
        growth_stage: str,
        rainfall_mm: float,
        wind_kmh: float,
        threat_type: str,
        baseline_explanation: str
    ) -> Dict[str, Any]:
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "mock_or_real_gemini_key":
            return {
                "enhanced": False,
                "explanation": baseline_explanation
            }

        prompt = (
            f"You are a Senior Agricultural Scientist. Explain in 2 concise sentences why a weather event of "
            f"{rainfall_mm}mm rainfall and {wind_kmh}km/h wind causes '{threat_type}' in {crop_name} "
            f"during the {growth_stage} stage. Focus strictly on cellular and physiological plant mechanisms."
        )

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return {"enhanced": True, "explanation": text}
        except Exception:
            pass

        return {"enhanced": False, "explanation": baseline_explanation}
