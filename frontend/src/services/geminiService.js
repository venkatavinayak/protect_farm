// Google Gemini AI Service for Hyper-Accurate Farm-Specific Climate Defense & Voice Advisory

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest"
];

// Detect Language Automatically from characters
export function detectLanguage(text) {
  if (!text) return 'en';
  
  // Telugu Unicode: 0C00–0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  
  // Tamil Unicode: 0B80–0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  
  // Kannada Unicode: 0C80–0CFF
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  
  // Devanagari (Hindi / Marathi) Unicode: 0900–097F
  if (/[\u0900-\u097F]/.test(text)) {
    // Basic Marathi keyword check
    if (/आहे|नाही|कसे|काय|करावे/.test(text)) return 'mr';
    return 'hi';
  }

  return 'en';
}

// BCP-47 tag for speech synthesis
export function getLangSpeechCode(langCode) {
  switch (langCode) {
    case 'te': return 'te-IN';
    case 'hi': return 'hi-IN';
    case 'ta': return 'ta-IN';
    case 'kn': return 'kn-IN';
    case 'mr': return 'mr-IN';
    default: return 'en-IN';
  }
}

// Call Google Gemini API
async function callGemini(prompt) {
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate.trim();
      }
    } catch (e) {
      console.warn(`Gemini model ${model} failed, trying fallback...`, e);
    }
  }
  return null;
}

/**
 * Hyper-Accurate Farm-Specific Threat Prediction using Gemini
 * Considers Farmland Area, Soil, Season, Coordinates, and Planted Crops.
 */
export async function getGeminiCropThreatPrediction({
  farmName,
  landAreaAcres,
  latitude,
  longitude,
  address,
  soilType,
  season,
  cropName,
  variety,
  growthStage,
  rainfallMm,
  windKmh,
  tempC
}) {
  const prompt = `
You are an expert Senior Agronomist and Climate Defense Scientist specializing in Indian Agriculture.
Analyze the following farm-specific situation and return an accurate JSON object:

FARM DETAILS:
- Farm Name: ${farmName}
- Land Area: ${landAreaAcres} Acres
- Location: ${address} (Lat: ${latitude}, Lng: ${longitude})
- Current Season: ${season} (Current date: November 2026 - Rabi onset)
- Soil Texture: ${soilType}
- Planted Crop: ${cropName}
- Seed Variety / Hybrid: ${variety}
- Crop Phenological Growth Stage: ${growthStage}

FORECAST WEATHER:
- 24h Rainfall: ${rainfallMm} mm
- Max Wind Speed: ${windKmh} km/h
- Temperature: ${tempC} °C

SCIENTIFIC RULES:
- If ${cropName} is Paddy (wetland rice): moderate rain (20-40mm) is BENEFICIAL if not submerging panicles. High wind (>45 km/h) during Flowering causes pollen washing and lodging.
- If ${cropName} is Groundnut / Pulses (arid legume): rain >25mm on heavy soils causes root hypoxia, oxygen starvation in Rhizobium nodules, and Pythium/Rhizoctonia fungal root rot.
- If ${cropName} is Cotton / Maize: waterlogging causes square/boll shedding and leaf blight.

Return ONLY a valid JSON object with these exact keys:
{
  "threat_level": "CRITICAL" | "WARNING" | "CAUTION" | "BENEFICIAL",
  "threat_title": "Short headline alert",
  "biological_causation": "2-3 detailed sentences explaining cellular/physiological causation (hypoxia, lodging, spore germination)",
  "mitigation_step_1": "Urgent immediate action with timeline (e.g. Next 4 Hours)",
  "mitigation_step_2": "Field management action during event",
  "mitigation_step_3": "Post-event organic treatment (e.g. Trichoderma or bio-spray)",
  "spoken_advisory_telugu": "Clear spoken advisory in Telugu for voice reading",
  "spoken_advisory_hindi": "Clear spoken advisory in Hindi for voice reading",
  "spoken_advisory_english": "Clear spoken advisory in English for voice reading"
}
`;

  try {
    const rawResult = await callGemini(prompt);
    if (rawResult) {
      // Clean JSON formatting
      const cleanJson = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (err) {
    console.error("Gemini Threat Prediction error:", err);
  }

  // Fallback if network blocks
  const isWetland = cropName.toLowerCase().includes('paddy') || cropName.toLowerCase().includes('rice');
  return {
    threat_level: isWetland ? "BENEFICIAL" : "WARNING",
    threat_title: isWetland 
      ? `Moderate Rain (${rainfallMm}mm) Beneficial for ${cropName}` 
      : `High Rain Alert: Severe Root Hypoxia & Rot Risk for ${cropName}`,
    biological_causation: isWetland
      ? `${cropName} possesses aerenchyma tissue enabling survival in standing water. ${rainfallMm}mm rain recharges soil water profile and saves motor electricity.`
      : `${cropName} in ${soilType} cannot tolerate stagnant water. ${rainfallMm}mm rainfall saturates pore spaces, starving roots of oxygen within 8 hours and triggering fungal damping-off.`,
    mitigation_step_1: isWetland ? "Turn off electric tube-wells immediately" : "Excavate 25cm peripheral drainage trenches to drain standing water",
    mitigation_step_2: isWetland ? "Strengthen field bunds at 3-5 cm height" : "Halt walking on wet ridges to avoid root zone soil compaction",
    mitigation_step_3: isWetland ? "Monitor for leaf folder and yellow stem borer" : "Drench collar region with Trichoderma viride (10g/L)",
    spoken_advisory_telugu: isWetland 
      ? `వరి పంటకు వర్షపాతం ఉపయోగకరం. బోర్ మోటార్లు ఆపండి.` 
      : `వేరుశనగ పంటలో నీరు నిల్వ ఉంటే వేరుకుళ్ళు వస్తుంది. వెంటనే కాలువలు తీయండి.`,
    spoken_advisory_hindi: isWetland
      ? `धान की फसल के लिए यह बारिश फायदेमंद है। मोटर बंद करें।`
      : `फसल में पानी भराव से जड़े सड़ सकती हैं। तुरंत जल निकासी नालियां बनाएं।`,
    spoken_advisory_english: isWetland
      ? `Rainfall is beneficial for Paddy. Turn off tube-wells.`
      : `Warning: Excess rain causes root hypoxia. Excavate perimeter drainage trenches.`
  };
}

/**
 * Bi-directional Multilingual Voice Chat Assistant using Gemini
 * Detects language automatically and writes detailed solution in that SAME language.
 */
export async function askGeminiVoiceAdvisor({
  userQuery,
  farmContext
}) {
  const detectedLang = detectLanguage(userQuery);
  const speechCode = getLangSpeechCode(detectedLang);

  const langNames = {
    te: 'Telugu (తెలుగు)',
    hi: 'Hindi (हिन्दी)',
    ta: 'Tamil (தமிழ்)',
    kn: 'Kannada (ಕನ್ನಡ)',
    mr: 'Marathi (मराठी)',
    en: 'English'
  };

  const targetLanguageName = langNames[detectedLang] || 'English';

  const prompt = `
You are the Voice Agronomist of PROTECTFARM AI, advising an Indian farmer.
The farmer asked the following question:
"${userQuery}"

FARM CONTEXT:
- Farm Name: ${farmContext?.farm_name || 'My Farm'}
- Land Area: ${farmContext?.land_area_acres || 4.5} Acres
- Location: ${farmContext?.address || 'India'} (Lat: ${farmContext?.latitude}, Lng: ${farmContext?.longitude})
- Soil Type: ${farmContext?.soil_type || 'Black Cotton Soil'}
- Planted Crops: ${JSON.stringify(farmContext?.crops || [{ crop_name: 'Paddy' }])}
- Current Weather: Rain 38.5mm, Wind 42km/h, Temp 27°C, Season: Rabi

INSTRUCTIONS:
1. Detect that the user spoke in ${targetLanguageName}.
2. You MUST write your response in ${targetLanguageName} (use authentic, natural regional script).
3. Provide a VERY DETAILED, actionable agricultural explanation addressing their specific crop, land area, and climate conditions.
4. Structure your response with:
   - Direct Biological Cause / Assessment
   - 3 Clear Step-by-step mitigation actions
   - Organic bio-pesticide / agronomic recommendation
5. Also provide a natural, conversational spoken summary to be read aloud via voice synthesis.

Return ONLY a valid JSON object with keys:
{
  "detected_lang": "${detectedLang}",
  "detailed_solution": "Full detailed solution formatted in ${targetLanguageName} with bold headers and bullet points",
  "spoken_script": "Clean conversational script in ${targetLanguageName} to be read aloud (no markdown symbols, no asterisks, easy to speak)"
}
`;

  try {
    const rawResult = await callGemini(prompt);
    if (rawResult) {
      const cleanJson = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        ...parsed,
        speechCode
      };
    }
  } catch (err) {
    console.error("Gemini Voice Advisor error:", err);
  }

  // Fallback response in detected language
  if (detectedLang === 'te') {
    return {
      detected_lang: 'te',
      speechCode: 'te-IN',
      detailed_solution: `**ప్రోటెక్ట్ ఫార్మ్ AI విశ్లేషణ:**\nమీరు అడిగిన ప్రశ్న: "${userQuery}"\n\n1. **పరిస్థితి:** మీ ${farmContext?.crops?.[0]?.crop_name || 'పంట'}కు ప్రస్తుత తేమ మరియు వర్షం ప్రభావం చూపుతుంది.\n2. **చర్యలు:**\n• పొలంలో నిలిచిన నీటిని డ్రైనేజీ కాలువల ద్వారా బయటకు పంపండి.\n• ఎరువులు లేదా రసాయన మందుల పిచికారీని వర్షం తగ్గే వరకు నిలిపివేయండి.\n• వర్షం తగ్గిన తర్వాత ట్రైకోడెర్మా విరిడి (లీటరుకు 10 గ్రాములు) వేర్ల వద్ద తడపండి.`,
      spoken_script: `రైతు సోదరులారా వినండి. మీ పొలంలో నీరు నిల్వ ఉండకుండా డ్రైనేజీ కాలువలు తీయండి. వర్షం తగ్గిన తర్వాత ట్రైకోడెర్మా పిచికారీ చేయండి.`
    };
  } else if (detectedLang === 'hi') {
    return {
      detected_lang: 'hi',
      speechCode: 'hi-IN',
      detailed_solution: `**प्रोटेक्टफार्म AI कृषि सलाह:**\nआपका सवाल: "${userQuery}"\n\n1. **विश्लेषण:** आपके खेत में नमी और बारिश के कारण फसलों की जड़ों में ऑक्सीजन की कमी हो सकती है।\n2. **कार्रवाई:**\n• खेत के किनारों पर नालियां बनाकर जलभराव तुरंत निकालें।\n• बारिश के दौरान रासायनिक छिड़काव रोक दें।\n• बारिश के बाद ट्राइकोडर्मा विरिडी से जड़ों की ड्रेंचिंग करें।`,
      spoken_script: `किसान भाई, अपने खेत से तुरंत जलभराव निकालें और बारिश के बाद ट्राइकोडर्मा का छिड़काव करें।`
    };
  } else {
    return {
      detected_lang: 'en',
      speechCode: 'en-IN',
      detailed_solution: `**PROTECTFARM AI Advisory:**\nYour query: "${userQuery}"\n\n1. **Agronomic Impact:** Current rainfall and moisture levels impact root nodule respiration in your ${farmContext?.crops?.[0]?.crop_name || 'crops'}.\n2. **Action Plan:**\n• Excavate 25cm peripheral drainage trenches to evacuate standing water immediately.\n• Halt all chemical sprays until foliage dries.\n• Apply Trichoderma viride (10g/L) soil drench post-rain to arrest fungal damping-off.`,
      spoken_script: `Farmer advisory: Drain standing water from field margins immediately and apply Trichoderma viride once rains subside.`
    };
  }
}
