import httpx
import json
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("protectfarm.xai")

class XAIService:
    """
    Multi-Provider Explainable AI (XAI) Engine:
    Supports:
    1. Groq API (Llama 3.3 70B - Ultra fast, high quality)
    2. OpenAI API (GPT-4o-mini)
    3. Google Gemini (gemini-flash-latest)
    4. Deterministic Agronomic Expert Engine (Zero-failure fallback)
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
        prompt = (
            f"You are a Senior Agricultural Scientist. "
            f"In 2 direct, farmer-friendly sentences, explain the exact biological/cellular mechanism of why "
            f"{rainfall_mm}mm rainfall and {wind_kmh}km/h wind causes '{threat_type}' in {crop_name} "
            f"during the {growth_stage} stage. Focus on root nodule hypoxia, fungal spore germination, or stem lodging."
        )

        # 1. Try Groq (Llama 3.3 70B - Free tier, ultra-low latency)
        if settings.GROQ_API_KEY:
            try:
                headers = {
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are an expert agronomist advising smallholder farmers."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.4,
                    "max_tokens": 150
                }
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        text = data["choices"][0]["message"]["content"].strip()
                        logger.info("XAI successfully generated via Groq (Llama 3.3 70B)")
                        return {"enhanced": True, "explanation": text, "provider": "Groq Llama 3.3"}
            except Exception as e:
                logger.debug(f"Groq provider skipped: {e}")

        # 2. Try OpenAI (GPT-4o-mini)
        if settings.OPENAI_API_KEY:
            try:
                headers = {
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "You are an expert agronomist advising smallholder farmers."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 150
                }
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        text = data["choices"][0]["message"]["content"].strip()
                        logger.info("XAI successfully generated via OpenAI (GPT-4o-mini)")
                        return {"enhanced": True, "explanation": text, "provider": "OpenAI GPT-4o-mini"}
            except Exception as e:
                logger.debug(f"OpenAI provider skipped: {e}")

        # 3. Try Google Gemini
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "mock_or_real_gemini_key":
            for model in ["gemini-flash-latest", "gemini-2.5-flash-lite"]:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
                    payload = {"contents": [{"parts": [{"text": prompt}]}]}
                    async with httpx.AsyncClient(timeout=8.0) as client:
                        res = await client.post(url, json=payload)
                        if res.status_code == 200:
                            data = res.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                parts = candidates[0].get("content", {}).get("parts", [])
                                for part in parts:
                                    if "text" in part and not part.get("thought", False):
                                        text = part["text"].strip()
                                        if text:
                                            logger.info(f"XAI successfully generated via Gemini ({model})")
                                            return {"enhanced": True, "explanation": text, "provider": f"Gemini ({model})"}
                except Exception as e:
                    logger.debug(f"Gemini call to {model} skipped: {e}")

        # 4. Deterministic Agronomy Expert Engine Fallback
        return {
            "enhanced": False,
            "explanation": baseline_explanation,
            "provider": "Expert Agronomy Engine"
        }
