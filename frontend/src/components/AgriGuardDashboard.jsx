import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserButton, SignOutButton } from '@clerk/clerk-react';
import { 
  Sprout, 
  MapPin, 
  Layers, 
  Crosshair, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Sparkles, 
  ChevronDown, 
  Plus, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  ShoppingBag, 
  TrendingUp, 
  Send,
  Loader2,
  Calendar,
  Maximize2
} from 'lucide-react';
import L from 'leaflet';
import MandiPricesModal from './MandiPricesModal';
import GovernmentSubsidiesModal from './GovernmentSubsidiesModal';
import AddFarmModal from './AddFarmModal';
import { getGeminiCropThreatPrediction, askGeminiVoiceAdvisor, detectLanguage, getLangSpeechCode } from '../services/geminiService';
import { playNativeSpeech, stopNativeSpeech, isNativeSpeechPlaying } from '../services/nativeTtsPlayer';

export default function AgriGuardDashboard({ onToggleView }) {
  const { farmer, farms, activeFarm, activeFarmId, switchFarm, plantedCrops } = useAuth();

  // Modals
  const [showMandiModal, setShowMandiModal] = useState(false);
  const [showSubsidiesModal, setShowSubsidiesModal] = useState(false);
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Farm Selector Dropdown
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);

  // Gemini Threat Prediction State
  const [threatAssessment, setThreatAssessment] = useState(null);
  const [threatLoading, setThreatLoading] = useState(false);

  // Voice & Chat Assistant State
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceQueryInput, setVoiceQueryInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [assistantLoading, setAssistantLoading] = useState(false);

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const radarLayerRef = useRef(null);
  const synthRef = useRef(null);
  const audioElemRef = useRef(null);
  const recognitionRef = useRef(null);

  // 1. Live Ticking Clock (updates every second)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format real-time Date & Time (e.g. Mon, 09 Nov 2026 • 06:40:15 PM IST)
  const formattedDateTime = currentTime.toLocaleString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }) + ' IST';

  // 2. Fetch Gemini Prediction for Active Farm and Crops
  useEffect(() => {
    fetchCropThreatPrediction();
  }, [activeFarm.id, activeFarm.land_area_acres, activeFarm.latitude, activeFarm.longitude, plantedCrops.length]);

  const fetchCropThreatPrediction = async () => {
    setThreatLoading(true);
    const primaryCrop = plantedCrops?.[0] || { crop_name: 'Paddy', category: 'wetland', variety: 'BPT 5204', growth_stage: 'Flowering Stage' };

    try {
      const prediction = await getGeminiCropThreatPrediction({
        farmName: activeFarm.farm_name,
        landAreaAcres: activeFarm.land_area_acres,
        latitude: activeFarm.latitude,
        longitude: activeFarm.longitude,
        address: activeFarm.address,
        soilType: activeFarm.soil_type,
        season: 'Rabi / Post-Monsoon Season',
        cropName: primaryCrop.crop_name,
        variety: primaryCrop.variety || 'Certified Hybrid',
        growthStage: primaryCrop.growth_stage || 'Flowering Stage',
        rainfallMm: 38.5,
        windKmh: 42.0,
        tempC: 27.5
      });
      setThreatAssessment(prediction);
    } catch (e) {
      console.error(e);
    } finally {
      setThreatLoading(false);
    }
  };

  // 3. Initialize Interactive Leaflet Map with Radar Rain Overlay
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialLat = activeFarm.latitude || 17.6192;
      const initialLng = activeFarm.longitude || 78.0818;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topleft' }).addTo(map);

      // 4K High-Res Satellite Imagery
      const satelliteTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );
      satelliteTiles.addTo(map);

      // Radar Cyclone / Rain Simulation Overlay Circle & Polygon
      const radarCircle = L.circle([initialLat + 0.015, initialLng + 0.02], {
        color: '#f59e0b',
        fillColor: '#10b981',
        fillOpacity: 0.35,
        radius: 3500,
        weight: 2,
        dashArray: '6, 8'
      }).addTo(map);

      radarLayerRef.current = radarCircle;

      // Farm Boundary Polygon (representing the farm acreage)
      const offset = 0.003;
      const farmPolygon = L.polygon([
        [initialLat - offset, initialLng - offset],
        [initialLat - offset, initialLng + offset],
        [initialLat + offset, initialLng + offset],
        [initialLat + offset, initialLng - offset]
      ], {
        color: '#10b981',
        fillColor: '#34d399',
        fillOpacity: 0.25,
        weight: 3
      }).addTo(map);

      farmPolygon.bindTooltip(`${activeFarm.farm_name}`, { permanent: true, direction: 'center', className: 'farm-tooltip-badge' });

      // Centroid Pin
      const pinIcon = L.divIcon({
        className: 'farm-pin',
        html: `
          <div style="background: linear-gradient(135deg, #10b981, #047857); color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <span style="transform: rotate(45deg); font-size: 15px;">🌾</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      const marker = L.marker([initialLat, initialLng], { icon: pinIcon }).addTo(map);
      markerRef.current = marker;

      setTimeout(() => {
        try { map.invalidateSize(); } catch (e) {}
      }, 300);

      mapInstanceRef.current = { map, satelliteTiles, farmPolygon };
    } else {
      // Re-center when active farm changes
      const { map } = mapInstanceRef.current;
      map.flyTo([activeFarm.latitude, activeFarm.longitude], 14, { duration: 1.2 });
      if (markerRef.current) {
        markerRef.current.setLatLng([activeFarm.latitude, activeFarm.longitude]);
      }
    }
  }, [activeFarm.id, activeFarm.latitude, activeFarm.longitude]);

  // 4. Initialize Web Speech API & Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleSendVoiceQuery(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    stopNativeSpeech();
    setIsPlayingAudio(false);
  };

  // Toggle Microphone Listening (Listens in any language!)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert("Microphone recognition requires Google Chrome or Microsoft Edge.");
        return;
      }
      stopAudio();
      // Listen without restricting language (browser auto-detects dialect)
      recognitionRef.current.lang = 'te-IN'; // default dialect fallback
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // Handle User Voice or Typed Query
  const handleSendVoiceQuery = async (queryText = null) => {
    const text = queryText || voiceQueryInput;
    if (!text.trim()) return;

    setVoiceQueryInput('');
    stopAudio();

    // Add user query to chat history
    const userMsg = { sender: 'user', text };
    setChatHistory(prev => [...prev, userMsg]);
    setAssistantLoading(true);

    try {
      const result = await askGeminiVoiceAdvisor({
        userQuery: text,
        farmContext: {
          farm_name: activeFarm.farm_name,
          land_area_acres: activeFarm.land_area_acres,
          address: activeFarm.address,
          latitude: activeFarm.latitude,
          longitude: activeFarm.longitude,
          soil_type: activeFarm.soil_type,
          crops: plantedCrops
        }
      });

      const aiMsg = {
        sender: 'ai',
        text: result.detailed_solution,
        spokenScript: result.spoken_script,
        detectedLang: result.detected_lang,
        speechCode: result.speechCode
      };

      setChatHistory(prev => [...prev, aiMsg]);
      setAssistantLoading(false);

      // DIRECT REACTION: Immediately and automatically speak aloud the answer in native Telugu/Hindi!
      // No read button required!
      playNativeSpeech(result.spoken_script, result.detected_lang, {
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false)
      });
    } catch (err) {
      setAssistantLoading(false);
      console.error(err);
    }
  };

  // Listen to Top Threat Alert aloud
  const handleListenThreatAlert = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      const script = threatAssessment?.spoken_advisory_telugu 
        || threatAssessment?.spoken_advisory_hindi 
        || threatAssessment?.spoken_advisory_english 
        || "Critical weather alert for your farmland. Heavy rain and cyclone danger detected.";
      playNativeSpeech(script, 'te', {
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false)
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070E0C] text-slate-100 flex flex-col font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR (Matching the uploaded UI design)
      ───────────────────────────────────────────────────────────── */}
      <header className="bg-[#0B1713] border-b border-emerald-900/60 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        
        {/* Brand Logo & Farmland Selector */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-sm">
              <Sprout className="w-5 h-5 text-emerald-400 fill-emerald-400/30" />
            </div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              AgriGuard <span className="text-emerald-400 font-extrabold">AI</span>
            </span>
          </div>

          {/* Active Farmer & Farmland Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
              className="flex items-center space-x-2 bg-[#12221D] hover:bg-[#182F27] border border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-100 transition"
            >
              <span>{farmer.full_name || 'Ramesh Kumar'} • {activeFarm.farm_name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {farmDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#0E1E19] border border-emerald-700/60 rounded-2xl shadow-2xl z-50 p-2 animate-fadeIn">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-3 py-1.5 border-b border-slate-800">
                  Your Registered Farmlands:
                </div>
                {farms.map((farm) => (
                  <button
                    key={farm.id}
                    onClick={() => {
                      switchFarm(farm.id);
                      setFarmDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition mt-1 ${
                      farm.id === activeFarmId 
                        ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40' 
                        : 'text-slate-300 hover:bg-[#152B23]'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">{farm.farm_name}</span>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[180px]">{farm.address}</span>
                    </div>
                    {farm.id === activeFarmId && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setFarmDropdownOpen(false);
                    setShowAddFarmModal(true);
                  }}
                  className="w-full mt-2 pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-xl text-xs font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Farmland</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Live Clock & Right Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Toggle to Classic Studio View */}
          {onToggleView && (
            <button
              onClick={onToggleView}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#12221D] hover:bg-[#182F27] text-emerald-300 border border-emerald-800/60 transition shadow-sm"
              title="Switch to Classic Farm Studio Tabs"
            >
              <span>🌿 Classic View</span>
            </button>
          )}

          {/* Live Date & Time Display */}
          <div className="hidden lg:flex items-center space-x-2 bg-[#12221D] px-3 py-1.5 rounded-xl border border-emerald-800/50 text-xs text-emerald-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formattedDateTime}</span>
          </div>

          {/* Listen Audio Button */}
          <button
            onClick={handleListenThreatAlert}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
              isPlayingAudio 
                ? 'bg-amber-500 text-slate-950 animate-pulse' 
                : 'bg-[#152D25] hover:bg-[#1C3A30] text-emerald-200 border border-emerald-700/60'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio ? 'Stop Audio' : 'Listen (వినండి)'}</span>
          </button>

          {/* Clerk User Avatar & Logout */}
          <div className="flex items-center space-x-2 bg-[#12221D] px-2.5 py-1 rounded-xl border border-emerald-800/60">
            <UserButton afterSignOutUrl="/" />
            <span className="hidden sm:inline text-xs font-semibold text-white">
              {farmer.full_name?.split(' ')[0] || 'Farmer'}
            </span>
          </div>

        </div>

      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN 3-COLUMN DASHBOARD GRID (Exact Layout from Image)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1700px] mx-auto w-full">
        
        {/* ── LEFT COLUMN (lg:col-span-3) ── */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          
          {/* 1. Farmer Profile Card */}
          <div className="bg-[#0D1A16] border border-emerald-900/60 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Farmer Profile</h3>
              <button
                onClick={() => setShowAddFarmModal(true)}
                className="text-[10px] text-emerald-300 bg-emerald-800/40 hover:bg-emerald-700/50 px-2 py-0.5 rounded-lg border border-emerald-700/40 transition flex items-center gap-1 font-semibold"
              >
                <Plus className="w-2.5 h-2.5" /> Add Land
              </button>
            </div>

            <div className="mt-3 flex items-start justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Planted Crops</span>
                <div className="space-y-2">
                  {plantedCrops.map((c, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-xs">
                        🌾
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{c.crop_name}</span>
                        <span className="text-[10px] text-emerald-300">{c.growth_stage || 'Flowering Stage'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block mb-1">Land Area</span>
                <span className="text-lg font-black text-white block">{activeFarm.land_area_acres} Acres</span>
                <span className="text-[10px] text-emerald-400 font-medium">100% Monitored</span>
              </div>
            </div>
          </div>

          {/* 2. Crop Recommendation Engine Card */}
          <div className="bg-[#0D1A16] border border-emerald-900/60 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Crop Recommendation Engine</h3>
            </div>
            
            <div className="mt-2.5">
              <span className="text-[11px] text-slate-400">Top Recommended for Next Season:</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Chickpeas / Lentils</span>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-300">
                  <span>🌧️</span><span>🌱</span><span>🧪</span>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-300">Soil & Climate Suitability:</span>
                  <span className="text-emerald-400 font-bold">94%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              {/* Crop Image Gallery Thumbnails */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-16 rounded-xl bg-amber-950/60 border border-amber-800/40 p-1 flex flex-col justify-end items-center text-center">
                  <span className="text-xl">🫘</span>
                  <span className="text-[9px] text-amber-200 font-bold">Chickpea</span>
                </div>
                <div className="h-16 rounded-xl bg-emerald-950/60 border border-emerald-800/40 p-1 flex flex-col justify-end items-center text-center">
                  <span className="text-xl">🌾</span>
                  <span className="text-[9px] text-emerald-200 font-bold">Rice / Paddy</span>
                </div>
                <div className="h-16 rounded-xl bg-yellow-950/60 border border-yellow-800/40 p-1 flex flex-col justify-end items-center text-center">
                  <span className="text-xl">🌽</span>
                  <span className="text-[9px] text-yellow-200 font-bold">Maize</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Pest & Disease Advisory Card */}
          <div className="bg-[#0D1A16] border border-emerald-900/60 rounded-2xl p-4 shadow-lg flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-emerald-900/40">
              Pest & Disease Advisory
            </h3>
            <span className="text-[11px] text-slate-400 block mt-2">Recommended biological products:</span>

            <div className="mt-3 space-y-2.5">
              {/* Product 1 */}
              <div className="flex items-center justify-between p-2.5 bg-[#091411] rounded-xl border border-emerald-950">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-lg">
                    🌿
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Anandi Greens Neem Oil</span>
                    <span className="text-[10px] text-slate-400">(1500 PPM Cold Pressed)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-300 block">₹500</span>
                  <a href="https://agribegri.com" target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 justify-end font-semibold">
                    Buy Now <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Product 2 */}
              <div className="flex items-center justify-between p-2.5 bg-[#091411] rounded-xl border border-emerald-950">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-lg">
                    🧪
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Plant's Buddy Metarhizium</span>
                    <span className="text-[10px] text-slate-400">(Root Borer & Grubs)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-300 block">₹300</span>
                  <a href="https://bighaat.com" target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 justify-end font-semibold">
                    Buy Now <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── CENTER COLUMN (lg:col-span-5) ── */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          
          {/* Radar Weather Map */}
          <div className="bg-[#0D1A16] border border-emerald-900/60 rounded-2xl overflow-hidden shadow-lg flex flex-col">
            <div className="px-4 py-2.5 bg-[#091411] border-b border-emerald-900/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">Radar Weather Map</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Rain tracking
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Centroid: {activeFarm.latitude.toFixed(3)}°N, {activeFarm.longitude.toFixed(3)}°E
              </span>
            </div>

            {/* Map Canvas */}
            <div className="relative h-[340px] w-full bg-slate-950">
              <div ref={mapContainerRef} className="h-full w-full" />

              {/* Farm Badge Overlay */}
              <div className="absolute top-3 left-12 z-[400] bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-emerald-700/60 shadow-lg pointer-events-none">
                🌾 {activeFarm.farm_name} ({activeFarm.land_area_acres} Acres)
              </div>
            </div>
          </div>

          {/* Weather Threat Forecast & Analysis (Trend Chart below Map) */}
          <div className="bg-[#0D1A16] border border-emerald-900/60 rounded-2xl p-4 shadow-lg flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Weather Threat Forecast & Analysis</h3>
              <div className="flex items-center space-x-3 text-[10px]">
                <span className="flex items-center gap-1 text-red-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span> Temp (°C)
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-sm bg-emerald-400"></span> Precipitation (mm)
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Wind (km/h)
                </span>
              </div>
            </div>

            {/* Multi-day Rainfall & Temperature Visualizer */}
            <div className="mt-3">
              <div className="grid grid-cols-7 gap-2 text-center">
                {[
                  { day: 'Sun', temp: 28, rain: 2, wind: 15 },
                  { day: 'Mon', temp: 31, rain: 8, wind: 24 },
                  { day: 'Tue', temp: 27, rain: 38, wind: 42, active: true },
                  { day: 'Wed', temp: 26, rain: 18, wind: 35 },
                  { day: 'Thu', temp: 29, rain: 6, wind: 20 },
                  { day: 'Fri', temp: 32, rain: 0, wind: 14 },
                  { day: 'Sat', temp: 33, rain: 0, wind: 12 }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-xl border flex flex-col justify-between h-28 ${
                      item.active 
                        ? 'bg-red-950/40 border-red-500/50 ring-1 ring-red-400' 
                        : 'bg-[#091411] border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-300">{item.day}</span>
                    
                    {/* Rain Bar */}
                    <div className="flex-1 flex flex-col justify-end items-center my-1">
                      <div 
                        className={`w-3 rounded-t-sm transition-all ${item.active ? 'bg-emerald-400' : 'bg-emerald-600/60'}`}
                        style={{ height: `${Math.min(item.rain * 1.5, 40)}px` }}
                      />
                      <span className="text-[9px] font-bold text-emerald-300 mt-0.5">{item.rain}mm</span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                      <span className="text-red-300">{item.temp}°</span>
                      <span className="text-amber-300">{item.wind}k</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 bg-[#091411] p-2 rounded-xl border border-slate-800">
                <span className="text-emerald-300 font-semibold">⚠️ Peak Monsoon Convective Downpour on Tuesday (38.5 mm rain, 42 km/h wind)</span>
                <span className="text-[10px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded-full font-bold">Alert Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (lg:col-span-4) ── */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          
          {/* CRITICAL ALERT CARD (Glowing Red/Amber border) */}
          <div className="bg-gradient-to-b from-[#1C0F0E] to-[#120B0A] border-2 border-red-600/80 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-red-600/30 text-red-400 rounded-lg border border-red-500/40">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-red-300 tracking-wide uppercase">
                {threatAssessment?.threat_title || 'CRITICAL ALERT: Heavy Rainfall & Wind Risk'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {threatAssessment?.biological_causation || (
                'Excess rain on heavy soil saturates topsoil pores, causing root nodule hypoxia within 8 hours. High winds during flowering cause severe lodging and panicle shattering.'
              )}
            </p>

            {/* Things You Need To Do (3 Mitigation Steps) */}
            <div className="mt-4 pt-3 border-t border-red-900/50">
              <span className="text-xs font-bold text-red-200 block mb-2 uppercase tracking-wider">
                Things You Need To Do:
              </span>

              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-xs text-slate-200 bg-red-950/50 p-2 rounded-xl border border-red-800/40">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                  <span>{threatAssessment?.mitigation_step_1 || 'Excavate 25cm peripheral drainage trenches to evacuate standing runoff immediately.'}</span>
                </div>

                <div className="flex items-start space-x-2 text-xs text-slate-200 bg-red-950/50 p-2 rounded-xl border border-red-800/40">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                  <span>{threatAssessment?.mitigation_step_2 || 'Halt chemical spraying and avoid walking on saturated field beds to prevent root zone compaction.'}</span>
                </div>

                <div className="flex items-start space-x-2 text-xs text-slate-200 bg-red-950/50 p-2 rounded-xl border border-red-800/40">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                  <span>{threatAssessment?.mitigation_step_3 || 'Soil drenching with Trichoderma viride (10g/L water) post-rain to arrest fungal damping-off.'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* All-In-One Toolkit (Mandi Prices & Government Subsidies) */}
          <div className="bg-[#0D1A16] border border-emerald-900/60 rounded-2xl p-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-emerald-900/40">
              All-In-One Toolkit
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowMandiModal(true)}
                className="p-3 bg-[#091411] hover:bg-[#12241F] rounded-xl border border-emerald-800/40 text-left transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-900/60 text-emerald-300 flex items-center justify-center text-sm mb-1.5 group-hover:scale-110 transition">
                  🌾
                </div>
                <span className="text-xs font-bold text-white block">Mandi (Market) Prices</span>
                <span className="text-[10px] text-emerald-400">Live e-NAM Rates ₹</span>
              </button>

              <button
                onClick={() => setShowSubsidiesModal(true)}
                className="p-3 bg-[#091411] hover:bg-[#12241F] rounded-xl border border-emerald-800/40 text-left transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-900/60 text-emerald-300 flex items-center justify-center text-sm mb-1.5 group-hover:scale-110 transition">
                  🏛️
                </div>
                <span className="text-xs font-bold text-white block">Government Subsidies</span>
                <span className="text-[10px] text-emerald-400">PM-KISAN & PMFBY</span>
              </button>
            </div>
          </div>

          {/* Voice Assistance Card with Bi-directional Native Speech Chat */}
          <div className="bg-[#0D1A16] border border-emerald-900/60 rounded-2xl p-4 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Voice Assistance</h3>
                </div>
                <span className="text-[10px] text-emerald-300 font-mono">Auto-Language Detect</span>
              </div>

              {/* Audio Wave Visualizer */}
              <div className="my-3 flex items-center justify-center space-x-1.5 h-10 bg-[#091411] rounded-xl border border-emerald-950 p-2">
                {[30, 60, 90, 45, 80, 100, 70, 50, 85, 40, 65, 95].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isListening ? 'bg-red-400 animate-pulse' : (isPlayingAudio ? 'bg-amber-400 animate-pulse' : 'bg-emerald-700/50')
                    }`}
                    style={{ height: (isListening || isPlayingAudio) ? `${h}%` : '25%', minHeight: '4px' }}
                  />
                ))}
              </div>

              {/* Chat Transcript Area */}
              <div className="max-h-40 overflow-y-auto space-y-2 text-xs pr-1">
                {chatHistory.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-2">
                    🎙️ Tap <b>"Speak Now"</b> and speak in Telugu, Hindi, or English. The AI will write a detailed solution and speak it aloud.
                  </p>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`p-2.5 rounded-xl text-xs ${
                        msg.sender === 'user' 
                          ? 'bg-[#152B23] border border-emerald-700/40 text-emerald-100 ml-4' 
                          : 'bg-[#091411] border border-slate-800 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-emerald-400 mb-0.5">
                        {msg.sender === 'user' ? '👤 You Asked:' : '🌾 Gemini AI Agronomist:'}
                      </div>
                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                    </div>
                  ))
                )}
                {assistantLoading && (
                  <div className="flex items-center gap-2 text-xs text-emerald-300 py-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini is diagnosing and preparing spoken advisory...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input & Speak Controls */}
            <div className="mt-3 pt-3 border-t border-emerald-900/40 space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={voiceQueryInput}
                  onChange={(e) => setVoiceQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendVoiceQuery()}
                  placeholder="Ask in Telugu, Hindi or English..."
                  className="flex-1 bg-[#091411] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={() => handleSendVoiceQuery()}
                  disabled={!voiceQueryInput.trim() || assistantLoading}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-40 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Primary Speak Now Button */}
              <button
                onClick={toggleListening}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Listening to your voice...' : 'Speak Now (వాయిస్ మాట్లాడండి)'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Modals */}
      <MandiPricesModal isOpen={showMandiModal} onClose={() => setShowMandiModal(false)} />
      <GovernmentSubsidiesModal isOpen={showSubsidiesModal} onClose={() => setShowSubsidiesModal(false)} />
      <AddFarmModal isOpen={showAddFarmModal} onClose={() => setShowAddFarmModal(false)} />

    </div>
  );
}
