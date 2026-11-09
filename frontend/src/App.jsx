import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthLandingPage from './components/AuthLandingPage';
import FarmOnboardingScreen from './components/FarmOnboardingScreen';
import VoiceAssistantBar from './components/VoiceAssistantBar';
import GeospatialFarmMap from './components/GeospatialFarmMap';
import WeatherThreatBanner from './components/WeatherThreatBanner';
import XAIMitigationModal from './components/XAIMitigationModal';
import CropAdvisorStudio from './components/CropAdvisorStudio';
import PlantedCropsManager from './components/PlantedCropsManager';
import BioMarketplace from './components/BioMarketplace';
import { Shield, Sparkles, MapPin, ShoppingBag, Sprout, Loader2 } from 'lucide-react';

export default function App() {
  const { 
    farmer, 
    activeFarm, 
    plantedCrops, 
    language, 
    isLoaded, 
    isSignedIn, 
    isSetupComplete, 
    completeSetup 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('threats'); // 'threats', 'crops', 'advisor', 'biostore'
  const [threatReport, setThreatReport] = useState(null);
  const [selectedCropXAI, setSelectedCropXAI] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Fetch threat assessment whenever farm, crops, or language changes
  useEffect(() => {
    if (isSignedIn && isSetupComplete) {
      fetchThreatReport();
    }
  }, [activeFarm.id, activeFarm.latitude, activeFarm.longitude, language, plantedCrops.length, isSignedIn, isSetupComplete]);

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
        setThreatReport(getDynamicThreatReport(overrideRain, overrideWind));
      }
    } catch (e) {
      setThreatReport(getDynamicThreatReport(overrideRain, overrideWind));
    } finally {
      setLoadingWeather(false);
    }
  };

  // Dynamic threat report based on the farmer's REAL planted crops
  const getDynamicThreatReport = (overrideRain = 38.5, overrideWind = 42.0) => {
    const rain = overrideRain !== null ? overrideRain : 38.5;
    const wind = overrideWind !== null ? overrideWind : 42.0;

    const cropsToAssess = plantedCrops && plantedCrops.length > 0 
      ? plantedCrops 
      : [{ id: 1, crop_name: 'Paddy', crop_category: 'wetland', growth_stage: 'Tillering' }];

    const cropAssessments = cropsToAssess.map((crop, idx) => {
      const isWetland = crop.crop_category === 'wetland' || crop.crop_name.toLowerCase().includes('paddy');
      const isArid = crop.crop_category === 'arid_pulse' || crop.crop_name.toLowerCase().includes('groundnut');
      
      if (isWetland) {
        return {
          crop_id: crop.id || idx + 1,
          crop_name: crop.crop_name,
          crop_category: 'wetland',
          growth_stage: crop.growth_stage || 'Tillering',
          threat_level: 'BENEFICIAL',
          threat_type: 'Natural_Water_Replenishment',
          is_dangerous: false,
          summary_message: `Moderate Rainfall (${rain} mm) is Highly Beneficial for ${crop.crop_name}.`,
          biological_explanation: `${crop.crop_name} thrives in flooded wetland conditions. ${rain}mm rainfall replenishes the standing root zone, reducing tube-well pumping costs without root anoxia risk.`,
          mitigation_steps: [
            { step_number: 1, timing_window: "Immediate", action_title: "Turn Off Electric Motors", action_description: "Save electricity and conserve groundwater while rain meets crop water requirements." },
            { step_number: 2, timing_window: "Next 12 Hours", action_title: "Strengthen Field Bunds", action_description: "Impound standing water at 3-5 cm height to retain moisture." },
            { step_number: 3, timing_window: "Within 3 Days", action_title: "Monitor Yellow Stem Borer", action_description: "Install 4 pheromone traps per acre as warm humidity triggers egg hatching." }
          ],
          audio_text_script: `రైతు సోదరులారా వినండి. మీ ${crop.crop_name} పంటకు ఈ వర్షపాతం చాలా అనుకూలంగా ఉంది. బోర్ మోటార్లు ఆపివేయండి.`
        };
      } else if (isArid) {
        return {
          crop_id: crop.id || idx + 1,
          crop_name: crop.crop_name,
          crop_category: 'arid_pulse',
          growth_stage: crop.growth_stage || 'Flowering',
          threat_level: 'WARNING',
          threat_type: 'Root_Rot_and_Anoxia_Hypoxia',
          is_dangerous: true,
          summary_message: `Rain Alert (${rain} mm): Severe Root Rot & Suffocation Risk for ${crop.crop_name}.`,
          biological_explanation: `${crop.crop_name} is adapted to dry, well-aerated soil. ${rain}mm rainfall saturates topsoil pores, causing root hypoxia and promoting Pythium/Rhizoctonia fungal root rot.`,
          mitigation_steps: [
            { step_number: 1, timing_window: "Next 4 Hours (Urgent)", action_title: "Excavate Perimeter Drainage Trenches", action_description: "Dig 25-30 cm deep peripheral channels to evacuate water runoff immediately." },
            { step_number: 2, timing_window: "During Rain", action_title: "Halt Chemical Spraying & Walking", action_description: "Prevent compaction of wet soil around tender nodules." },
            { step_number: 3, timing_window: "Post-Rain within 24 Hours", action_title: "Soil Drenching with Trichoderma Viride", action_description: "Drench collar region with organic Trichoderma viride to protect roots." }
          ],
          audio_text_script: `రైతు సోదరులారా వినండి. మీ ${crop.crop_name} పంటకు నీరు నిల్వ ఉండటం ప్రమాదకరం. వెంటనే డ్రైనేజీ కాలువలు తీయండి.`
        };
      } else {
        return {
          crop_id: crop.id || idx + 1,
          crop_name: crop.crop_name,
          crop_category: crop.crop_category || 'semi_arid',
          growth_stage: crop.growth_stage || 'Vegetative',
          threat_level: 'CAUTION',
          threat_type: 'Fungal_Foliar_Blight_Risk',
          is_dangerous: true,
          summary_message: `High Humidity & Rain Alert for ${crop.crop_name} (${rain} mm, Wind ${wind} km/h).`,
          biological_explanation: `High atmospheric moisture after rain creates ideal micro-climate for foliar leaf spot and square drying in ${crop.crop_name}.`,
          mitigation_steps: [
            { step_number: 1, timing_window: "Within 6 Hours", action_title: "Clear Inter-Row Water Drainage", action_description: "Ensure no stagnant water pools between ridges." },
            { step_number: 2, timing_window: "Next 24 Hours", action_title: "Spray Pseudomonas fluorescens", action_description: "Apply bio-protective Pseudomonas spray (5g/L) to prevent bacterial leaf blight." },
            { step_number: 3, timing_window: "Post-Event", action_title: "Check Sucking Pests", action_description: "Inspect underside of leaves for jassids and aphids." }
          ],
          audio_text_script: `రైతు సోదరులారా వినండి. మీ ${crop.crop_name} పంటకు అధిక తేమ వల్ల తెగులు రాకుండా డ్రైనేజీ చూసుకోండి.`
        };
      }
    });

    return {
      farm_id: activeFarm.id,
      farm_name: activeFarm.farm_name,
      location: { latitude: activeFarm.latitude, longitude: activeFarm.longitude },
      forecast_24h_rainfall_mm: rain,
      max_wind_speed_kmh: wind,
      weather_condition: "Monsoon Convective Downpour",
      crop_assessments: cropAssessments
    };
  };

  // 1. Loading State while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
        <span className="text-sm font-semibold text-emerald-200">Initializing PROTECTFARM AI Intelligence...</span>
      </div>
    );
  }

  // 2. Unauthenticated State -> Open Login / Sign In Page
  if (!isSignedIn) {
    return <AuthLandingPage />;
  }

  // 3. Authenticated but Needs Onboarding Setup -> Ask Farmer Name, Crop, Area, Farmland Location
  if (!isSetupComplete) {
    return <FarmOnboardingScreen onComplete={(setup) => completeSetup(setup)} />;
  }

  // 4. Authenticated & Setup Complete -> Full Home Page Dashboard
  const dangerousCrop = threatReport?.crop_assessments?.find(c => c.is_dangerous);
  const topAudioScript = dangerousCrop 
    ? (dangerousCrop.audio_text_script || dangerousCrop.summary_message)
    : (threatReport?.crop_assessments?.[0]?.audio_text_script || `Welcome ${farmer.full_name}. Weather conditions are safe for your crops.`);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

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
                <GeospatialFarmMap />
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
            <GeospatialFarmMap />
          </div>
        )}

        {/* Tab 3: Geospatial AI Crop Recommendation Studio */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">
            <CropAdvisorStudio />
            <GeospatialFarmMap />
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
          🌾 PROTECTFARM • Real-time AI Agricultural Defense System. Tailored for {farmer.full_name || 'Farmer'} at {activeFarm.address?.split(',')[0] || 'Farmland'}.
        </p>
      </footer>
    </div>
  );
}
