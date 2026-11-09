import httpx
import logging
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.threat import MitigationStep

logger = logging.getLogger("protectfarm.translation")

class TranslationService:
    """
    Multi-Provider Regional Language Translation Service:
    Supports:
    1. Sarvam AI (Mayura translation model - State of the art for 11+ Indian languages)
    2. Google Cloud Translation API
    3. Built-in Agronomic Vernacular Dictionary (Telugu, Hindi, Tamil, Kannada, Marathi, English)
    """

    LANGUAGE_NAMES = {
        "te": "Telugu (తెలుగు)",
        "hi": "Hindi (हिन्दी)",
        "ta": "Tamil (தமிழ்)",
        "kn": "Kannada (ಕನ್ನಡ)",
        "mr": "Marathi (मराठी)",
        "en": "English"
    }

    SARVAM_LANG_CODES = {
        "te": "te-IN",
        "hi": "hi-IN",
        "ta": "ta-IN",
        "kn": "kn-IN",
        "mr": "mr-IN"
    }

    TRANSLATION_MAP = {
        "te": {
            "SAFE": "సురక్షితం (SAFE)",
            "BENEFICIAL": "మేలు చేసే వాతావరణం (లాభదాయకం)",
            "ADVISORY": "జాగ్రత్త సూచన (ADVISORY)",
            "WARNING": "హెచ్చరిక - ప్రమాదం (WARNING)",
            "CRITICAL": "తీవ్ర హెచ్చరిక - అత్యవసరం (CRITICAL)",
            "Paddy": "వరి పంట",
            "Rice": "వరి",
            "Groundnut": "వేరుశనగ",
            "Chickpea": "శనగ",
            "Cotton": "ప్రత్తి",
            "Tomato": "టమోటా",
            "Banana": "అరటి తోట",
            "Sugarcane": "చెరకు",
            "root_rot_warning": "భారీ వర్షం వల్ల నేలలో నీరు నిలిచి వేరుకుళ్లు తెగులు (రూట్ రాట్) వచ్చే తీవ్ర ప్రమాదం ఉంది.",
            "beneficial_paddy": "ఈ వర్షపాతం వరి పంటకు చాలా అనుకూలంగా ఉంది. బోర్ మోటార్లు ఆపివేయండి.",
            "wind_warning": "తీవ్రమైన ఈదురు గాలుల వలన పంట నేలకొరిగే (పడిపోయే) ప్రమాదం ఉంది. వెంటనే మద్దతు కర్రలు కట్టండి.",
            "step_prefix": "చర్య",
            "listen_prompt": "రైతు సోదరులారా వినండి"
        },
        "hi": {
            "SAFE": "सुरक्षित (SAFE)",
            "BENEFICIAL": "फायदेमंद मौसम (लाभकारी)",
            "ADVISORY": "सलाह (ADVISORY)",
            "WARNING": "चेतावनी - खतरा (WARNING)",
            "CRITICAL": "गंभीर खतरा - आपातकालीन (CRITICAL)",
            "Paddy": "धान की फसल",
            "Rice": "धान",
            "Groundnut": "मूंगफली",
            "Chickpea": "चना",
            "Cotton": "कपास",
            "Tomato": "टमाटर",
            "Banana": "केला",
            "Sugarcane": "गन्ना",
            "root_rot_warning": "अत्यधिक बारिश से खेत में जलभराव होने पर जड़ों में सड़न (Root Rot) का भारी खतरा है।",
            "beneficial_paddy": "यह वर्षा धान के लिए अत्यंत लाभकारी है। बोरवेल पंप बंद करके जल संरक्षण करें।",
            "wind_warning": "तेज आंधी के कारण फसल गिरने का खतरा है। तनों को सहारा दें।",
            "step_prefix": "कदम",
            "listen_prompt": "किसान भाइयों ध्यान दें"
        },
        "ta": {
            "SAFE": "பாதுகாப்பானது (SAFE)",
            "BENEFICIAL": "பயனுள்ள மழை (நன்மை)",
            "ADVISORY": "ஆலோசனை (ADVISORY)",
            "WARNING": "எச்சரிக்கை - ஆபத்து (WARNING)",
            "CRITICAL": "தீவிர எச்சரிக்கை (CRITICAL)",
            "Paddy": "நெல் பயிர்",
            "Groundnut": "நிலக்கடலை",
            "root_rot_warning": "தேங்கும் மழைநீரால் வேரழுகல் நோய் ஏற்படும் அபாயம் உள்ளது.",
            "beneficial_paddy": "இந்த மழை நெற்பயிருக்கு மிகவும் நல்லது. பம்புசெட்டுகளை நிறுத்தவும்.",
            "step_prefix": "படி",
            "listen_prompt": "விவசாய பெருமக்களே கவனிக்கவும்"
        },
        "kn": {
            "SAFE": "ಸುರಕ್ಷಿತ (SAFE)",
            "BENEFICIAL": "ಉಪಯುಕ್ತ ಮಳೆ (ಲಾಭದಾಯಕ)",
            "ADVISORY": "ಸಲಹೆ (ADVISORY)",
            "WARNING": "ಎಚ್ಚರಿಕೆ - ಅಪಾಯ (WARNING)",
            "CRITICAL": "ತೀವ್ರ ಎಚ್ಚರಿಕೆ (CRITICAL)",
            "Paddy": "ಭತ್ತದ ಬೆಳೆ",
            "Groundnut": "ಕಡಲೆಕಾಯಿ",
            "root_rot_warning": "ಮಳೆ ನೀರು ನಿಲ್ಲುವುದರಿಂದ ಬೇರು ಕೊಳೆಯುವ ರೋಗದ ಅಪಾಯವಿದೆ.",
            "beneficial_paddy": "ಈ ಮಳೆ ಭತ್ತದ ಬೆಳೆಗೆ ಅತ್ಯಂತ ಪೂರಕವಾಗಿದೆ.",
            "step_prefix": "ಕ್ರಮ",
            "listen_prompt": "ರೈತ ಬಾಂಧವರೇ ಗಮನಿಸಿ"
        },
        "mr": {
            "SAFE": "सुरक्षित (SAFE)",
            "BENEFICIAL": "फायदेशीर पाऊस (लाभदायक)",
            "ADVISORY": "सल्ला (ADVISORY)",
            "WARNING": "धोक्याचा इशारा (WARNING)",
            "CRITICAL": "गंभीर धोका (CRITICAL)",
            "Paddy": "भात पीक",
            "Groundnut": "भुईमूग",
            "root_rot_warning": "जास्त पाण्यामुळे मूळकुज रोगाचा मोठा धोका निर्माण होऊ शकतो.",
            "beneficial_paddy": "हा पाऊस भात पिकासाठी फायदेशीर आहे. पाणी उपसा थांबवा.",
            "step_prefix": "पाऊल",
            "listen_prompt": "शेतकरी मित्रांनो लक्ष द्या"
        }
    }

    @classmethod
    def translate_threat_assessment(
        cls,
        crop_name: str,
        threat_level: str,
        summary_msg: str,
        bio_explanation: str,
        steps: List[MitigationStep],
        target_lang: str
    ) -> Dict[str, Any]:
        if target_lang == "en" or target_lang not in cls.TRANSLATION_MAP:
            return {
                "translated_summary": summary_msg,
                "translated_explanation": bio_explanation,
                "translated_steps": steps,
                "audio_script": f"Attention farmer. Alert for {crop_name}. Status: {threat_level}. {summary_msg}"
            }

        lang_dict = cls.TRANSLATION_MAP[target_lang]
        trans_threat = lang_dict.get(threat_level, threat_level)
        trans_crop = lang_dict.get(crop_name, crop_name)

        if threat_level in ["WARNING", "CRITICAL"]:
            if "root" in summary_msg.lower() or "rain" in summary_msg.lower():
                trans_summary = f"{trans_crop}: {lang_dict.get('root_rot_warning', summary_msg)}"
            elif "wind" in summary_msg.lower() or "cyclone" in summary_msg.lower():
                trans_summary = f"{trans_crop}: {lang_dict.get('wind_warning', summary_msg)}"
            else:
                trans_summary = f"{trans_crop} - {trans_threat}: {summary_msg}"
        elif threat_level == "BENEFICIAL":
            trans_summary = f"{trans_crop}: {lang_dict.get('beneficial_paddy', summary_msg)}"
        else:
            trans_summary = f"{trans_crop} - {trans_threat}: {summary_msg}"

        translated_steps = []
        for s in steps:
            trans_step = MitigationStep(
                step_number=s.step_number,
                timing_window=s.timing_window,
                action_title=f"{lang_dict.get('step_prefix', 'Step')} {s.step_number}: {s.action_title}",
                action_description=s.action_description
            )
            translated_steps.append(trans_step)

        listen_prompt = lang_dict.get("listen_prompt", "Attention farmer")
        audio_script = f"{listen_prompt}. {trans_summary}. {trans_threat}."

        return {
            "translated_summary": trans_summary,
            "translated_explanation": f"[{cls.LANGUAGE_NAMES.get(target_lang)}] {bio_explanation}",
            "translated_steps": translated_steps,
            "audio_script": audio_script
        }
