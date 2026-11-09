import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import VoiceAssistantBar from './components/VoiceAssistantBar';
import InteractiveFarmMap from './components/InteractiveFarmMap';
import WeatherThreatBanner from './components/WeatherThreatBanner';
import XAIMitigationModal from './components/XAIMitigationModal';
import CropAdvisorStudio from './components/CropAdvisorStudio';
import PlantedCropsManager from './components/PlantedCropsManager';
import BioMarketplace from './components/BioMarketplace';
import { Shield, Sparkles, MapPin, ShoppingBag, Sprout, BarChart2 } from 'lucide-react';

export default function App() {
  const { activeFarm, plantedCrops, language } = useAuth();
  
  const [activeTab, setActiveTab] = useState('threats'); // 'threats', 'crops', 'advisor', 'biostore'
  const [threatReport, setThreatReport] = useState(null);
  const [selectedCropXAI, setSelectedCropXAI] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Fetch threat assessment whenever farm, crops, or language changes
  useEffect(() => {
    fetchThreatReport();
  }, [activeFarm.id, activeFarm.latitude, activeFarm.longitude, language, plantedCrops.length]);

  const fetchThreatReport = async (overrideRain = null, overrideWind = null) => {
    setLoadingWeather(true);
    try {
      let url = `/api/v1/weather-threats/farm/${activeFarm.id}`;
      const params = new URLSearchParams();
      if (overrideRain !== null) params.append('override_rain_mm', overrideRain);
      if (overrideWind !== null) params.append('override_wind_kmh', overrideWind);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setThreatReport(data);
      } else {
        // Fallback default demonstration data
        setThreatReport(getFallbackThreatReport(overrideRain, overrideWind));
      }
    } catch (e) {
      setThreatReport(getFallbackThreatReport(overrideRain, overrideWind));
    } finally {
      setLoadingWeather(false);
    }
  };

  const getFallbackThreatReport = (overrideRain = 38.5, overrideWind = 42.0) => {
    const rain = overrideRain !== null ? overrideRain : 38.5;
    const wind = overrideWind !== null ? overrideWind : 42.0;

    return {
      farm_id: activeFarm.id,
      farm_name: activeFarm.farm_name,
      location: { latitude: activeFarm.latitude, longitude: activeFarm.longitude },
      forecast_24h_rainfall_mm: rain,
      max_wind_speed_kmh: wind,
      weather_condition: "Monsoon Convective Downpour",
      crop_assessments: [
        {
          crop_id: 1,
          crop_name: "Paddy",
          crop_category: "wetland",
          growth_stage: "Tillering",
          threat_level: "BENEFICIAL",
          threat_type: "Natural_Water_Replenishment",
          is_dangerous: false,
          summary_message: `Moderate Rainfall (${rain} mm) is Highly Beneficial for Paddy.`,
          biological_explanation: "Paddy thrives in flooded, semi-aquatic wetland conditions. 38.5mm rainfall replenishes the standing water depth and reduces tube-well pumping costs without risking root anoxia.",
          mitigation_steps: [
            { step_number: 1, timing_window: "Immediate", action_title: "Turn Off Electric Pumps", action_description: "Save electricity and conserve aquifer reserves by closing canal gates." },
            { step_number: 2, timing_window: "Next 12 Hours", action_title: "Strengthen Bund Outlets", action_description: "Ensure peripheral field bunds impound water at 3-5 cm height." },
            { step_number: 3, timing_window: "Within 3 Days", action_title: "Monitor Yellow Stem Borer", action_description: "Install 4 pheromone traps per acre as warm humidity triggers egg hatching." }
          ],
          audio_text_script: "రైతు సోదరులారా వినండి. వరి పంటకు ఈ వర్షపాతం చాలా అనుకూలంగా ఉంది. బోర్ మోటార్లు ఆపివేయండి."
        },
        {
          crop_id: 2,
          crop_name: "Groundnut",
          crop_category: "arid_pulse",
          growth_stage: "Flowering",
          threat_level: "WARNING",
          threat_type: "Root_Rot_and_Anoxia_Hypoxia",
          is_dangerous: true,
          summary_message: `Rain Alert (${rain} mm): Severe Root Rot & Suffocation Risk for Groundnut.`,
          biological_explanation: "Groundnut is an arid legume adapted to loose, well-aerated soil. 38.5mm rainfall saturates the topsoil pores, starving root nodules of oxygen (hypoxia). This causes Rhizobium death and triggers Pythium root rot.",
          mitigation_steps: [
            { step_number: 1, timing_window: "Next 4 Hours (Urgent)", action_title: "Excavate Peripheral Drainage Trenches", action_description: "Dig 25-30 cm deep trenches along field margins to evacuate surface runoff immediately. Prevent any standing water." },
            { step_number: 2, timing_window: "During Event", action_title: "Halt All Chemical Spraying", action_description: "Avoid walking on saturated field beds to prevent soil compaction." },
            { step_number: 3, timing_window: "Post-Rain within 24 Hours", action_title: "Soil Drenching with Trichoderma Viride", action_description: "Drench collar region with Trichoderma viride (10g/L water) to arrest fungal damping-off." }
          ],
          audio_text_script: "రైతు సోదరులారా వినండి. వేరుశనగ పంటకు నీరు నిల్వ ఉండటం ప్రమాదకరం. వెంటనే డ్రైనేజీ కాలువలు తీయండి."
        }
      ]
    };
  };

  // Derive active voice script: prioritization goes to dangerous crop alerts
  const dangerousCrop = threatReport?.crop_assessments.find(c => c.is_dangerous);
  const topAudioScript = dangerousCrop 
    ? (dangerousCrop.audio_text_script || dangerousCrop.summary_message)
    : (threatReport?.crop_assessments[0]?.audio_text_script || "Welcome to ProtectFarm.");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenProfile={() => setActiveTab('crops')} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
        
        {/* Multilingual Voice Assistant Bar */}
        <VoiceAssistantBar scriptText={topAudioScript} currentThreat={dangerousCrop} />

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('threats')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'threats'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Weather & Threat Defense</span>
          </button>

          <button
            onClick={() => setActiveTab('crops')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'crops'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>My Farm & Planted Crops</span>
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'advisor'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Crop Recommendation Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('biostore')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'biostore'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Eco-Friendly Bio-Pesticides</span>
          </button>
        </div>

        {/* Tab 1: Threats and Defense Dashboard */}
        {activeTab === 'threats' && (
          <div className="space-y-6">
            <WeatherThreatBanner
              threatReport={threatReport}
              onSelectCropForXAI={(assessment) => setSelectedCropXAI(assessment)}
              onSimulateWeather={(rain, wind) => fetchThreatReport(rain, wind)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InteractiveFarmMap />
              </div>
              <div>
                <PlantedCropsManager />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Farm & Planted Crops Management */}
        {activeTab === 'crops' && (
          <div className="space-y-6">
            <PlantedCropsManager />
            <InteractiveFarmMap />
          </div>
        )}

        {/* Tab 3: Geospatial AI Crop Recommendation Studio */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">
            <CropAdvisorStudio />
            <InteractiveFarmMap />
          </div>
        )}

        {/* Tab 4: Bio-Pesticide Store */}
        {activeTab === 'biostore' && (
          <div className="space-y-6">
            <BioMarketplace />
          </div>
        )}

      </main>

      {/* Explainable AI Mitigation Modal */}
      {selectedCropXAI && (
        <XAIMitigationModal
          assessment={selectedCropXAI}
          onClose={() => setSelectedCropXAI(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800">
        <p className="max-w-md mx-auto">
          🌾 PROTECTFARM • Real-time AI Agricultural Defense System. Designed for smallholder farmers across India.
        </p>
      </footer>
    </div>
  );
}
