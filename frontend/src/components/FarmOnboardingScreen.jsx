import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, 
  MapPin, 
  User, 
  Phone, 
  Globe, 
  Crosshair, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Layers,
  ShieldCheck
} from 'lucide-react';
import L from 'leaflet';

const POPULAR_CROPS = [
  { name: 'Paddy', category: 'wetland', defaultVariety: 'BPT 5204 (Samba Mahsuri)', telugu: 'వరి (Wetland)' },
  { name: 'Groundnut', category: 'arid_pulse', defaultVariety: 'Kadiri-6 (K-6)', telugu: 'వేరుశనగ (Arid)' },
  { name: 'Cotton', category: 'semi_arid', defaultVariety: 'Bt Cotton (Bollgard II)', telugu: 'పత్తి (Cash Crop)' },
  { name: 'Maize', category: 'semi_arid', defaultVariety: 'DHM-117', telugu: 'మొక్కజొన్న' },
  { name: 'Chilli', category: 'cash_crop', defaultVariety: 'Guntur Sannam (S4)', telugu: 'మిరప' },
  { name: 'Tomato', category: 'horticulture', defaultVariety: 'Arka Rakshak', telugu: 'టమాటా' },
  { name: 'Wheat', category: 'semi_arid', defaultVariety: 'HD-2967', telugu: 'గోధుమ' },
  { name: 'Soybean', category: 'pulse', defaultVariety: 'JS-335', telugu: 'సోయాబీన్' }
];

const SOIL_TYPES = [
  'Deep Black Cotton Soil (Vertisol)',
  'Red Sandy Loam (Alfisol)',
  'Clay Loam Soil',
  'Alluvial River Basin Soil'
];

const IRRIGATION_TYPES = [
  'Borewell / Tube-well Motor',
  'Canal Gravity Irrigation',
  'Rainfed (Monsoon Dependent)',
  'Drip / Micro Irrigation'
];

export default function FarmOnboardingScreen({ onComplete }) {
  const { farmer, activeFarm, setFarmer, updateFarmLocation, addCrop, updateLanguage, language } = useAuth();

  // Form State
  const [farmerName, setFarmerName] = useState(farmer.full_name !== 'Guest Farmer' ? farmer.full_name : '');
  const [phoneNumber, setPhoneNumber] = useState(farmer.phone_number || '');
  const [prefLang, setPrefLang] = useState(language || 'te');

  // Crop State
  const [selectedCrop, setSelectedCrop] = useState(POPULAR_CROPS[0].name);
  const [variety, setVariety] = useState(POPULAR_CROPS[0].defaultVariety);
  const [cultivatedAcres, setCultivatedAcres] = useState(3.5);
  const [growthStage, setGrowthStage] = useState('Tillering');

  // Farm Location State
  const [address, setAddress] = useState(activeFarm.address || 'Kandi Village, Sangareddy, Telangana');
  const [latitude, setLatitude] = useState(activeFarm.latitude || 17.6192);
  const [longitude, setLongitude] = useState(activeFarm.longitude || 78.0818);
  const [soilType, setSoilType] = useState(SOIL_TYPES[0]);
  const [irrigation, setIrrigation] = useState(IRRIGATION_TYPES[0]);

  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [tileMode, setTileMode] = useState('satellite');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Auto-fill crop variety when crop changes
  const handleCropSelect = (cropName) => {
    setSelectedCrop(cropName);
    const found = POPULAR_CROPS.find(c => c.name === cropName);
    if (found) setVariety(found.defaultVariety);
  };

  // Initialize interactive Leaflet map for location picking
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // High-resolution satellite tiles
      const satelliteTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );

      const streetTiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );

      satelliteTiles.addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #10b981, #047857);
            color: white;
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">🌱</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38]
      });

      const marker = L.marker([latitude, longitude], {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setLatitude(parseFloat(lat.toFixed(5)));
        setLongitude(parseFloat(lng.toFixed(5)));
      });

      // Tap on map to relocate pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setLatitude(parseFloat(lat.toFixed(5)));
        setLongitude(parseFloat(lng.toFixed(5)));
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
      });

      markerRef.current = marker;
      mapInstanceRef.current = { map, satelliteTiles, streetTiles };
    }
  }, []);

  // Update map when coordinates change manually
  const handleCoordUpdate = (newLat, newLng) => {
    const lat = parseFloat(newLat);
    const lng = parseFloat(newLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLatitude(lat);
      setLongitude(lng);
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.map.flyTo([lat, lng], 15);
        markerRef.current.setLatLng([lat, lng]);
      }
    }
  };

  // Address search via Nominatim
  const handleAddressSearch = async (e) => {
    if (e) e.preventDefault();
    if (!address.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        handleCoordUpdate(lat, lng);
        setAddress(data[0].display_name);
      } else {
        alert("Location not found. Please try entering nearby Mandal/District or use GPS.");
      }
    } catch (err) {
      alert("Address search failed. Please use GPS or enter coordinates directly.");
    } finally {
      setSearching(false);
    }
  };

  // GPS auto-locate
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported on this device.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleCoordUpdate(lat, lng);
        setAddress(`GPS Field Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
        setGpsLoading(false);
      },
      (err) => {
        alert("GPS permission denied or unavailable: " + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Toggle map satellite/streets
  const toggleMapLayer = () => {
    if (!mapInstanceRef.current) return;
    const { map, satelliteTiles, streetTiles } = mapInstanceRef.current;
    if (tileMode === 'satellite') {
      map.removeLayer(satelliteTiles);
      streetTiles.addTo(map);
      setTileMode('streets');
    } else {
      map.removeLayer(streetTiles);
      satelliteTiles.addTo(map);
      setTileMode('satellite');
    }
  };

  // Final Form Submission
  const handleSubmitSetup = (e) => {
    e.preventDefault();

    const chosenCropConfig = POPULAR_CROPS.find(c => c.name === selectedCrop) || POPULAR_CROPS[0];
    const finalFarmerName = farmerName.trim() || farmer.full_name || 'Farmer';

    // Update Farmer State
    setFarmer(prev => ({
      ...prev,
      full_name: finalFarmerName,
      phone_number: phoneNumber,
      preferred_language: prefLang,
      is_authenticated: true
    }));
    updateLanguage(prefLang);

    // Update Farm Location
    updateFarmLocation(
      { lat: latitude, lng: longitude },
      parseFloat(cultivatedAcres),
      null,
      address
    );

    // Save Planted Crop
    const newCropObj = {
      id: Date.now(),
      farm_id: 1,
      crop_name: selectedCrop,
      crop_category: chosenCropConfig.category,
      variety: variety || chosenCropConfig.defaultVariety,
      sowing_date: new Date().toISOString().split('T')[0],
      growth_stage: growthStage,
      is_active: true
    };

    // Save to context & localStorage
    if (farmer.clerk_user_id) {
      const profileData = {
        farmerName: finalFarmerName,
        phone: phoneNumber,
        language: prefLang,
        crop: newCropObj,
        acres: cultivatedAcres,
        farm: {
          address,
          latitude,
          longitude,
          land_area_acres: cultivatedAcres,
          soil_type: soilType,
          irrigation: irrigation
        },
        completedAt: new Date().toISOString()
      };
      localStorage.setItem(`protectfarm_profile_${farmer.clerk_user_id}`, JSON.stringify(profileData));
      localStorage.setItem(`protectfarm_setup_completed_${farmer.clerk_user_id}`, 'true');
    }

    onComplete({
      farmerName: finalFarmerName,
      crop: newCropObj,
      acres: cultivatedAcres,
      location: { lat: latitude, lng: longitude, address }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-4xl w-full bg-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-6 sm:p-8 border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs bg-emerald-700/80 text-emerald-200 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Step 1 of 1: Farmland Setup
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                Welcome to PROTECTFARM, {farmerName || farmer.full_name || 'Farmer'}!
              </h1>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Configure your farmland parcel & cultivated crops to activate personalized real-time AI weather defense.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitSetup} className="p-6 sm:p-8 space-y-8">
          
          {/* SECTION 1: Farmer Profile */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                1. Farmer Personal Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Farmer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="e.g. Venkata Vinayak"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number (for SMS Alerts)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preferred Voice/Advisory Language
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={prefLang}
                    onChange={(e) => setPrefLang(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: Crop Details */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                2. Cultivated Crop & Land Area
              </h2>
            </div>

            {/* Crop Selector Chips */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Your Primary Planted Crop:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {POPULAR_CROPS.map((crop) => (
                  <button
                    key={crop.name}
                    type="button"
                    onClick={() => handleCropSelect(crop.name)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      selectedCrop === crop.name
                        ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{crop.name}</span>
                      <span className="text-sm">🌱</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 mt-1">{crop.telugu}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Variety, Acres, Growth Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Crop Variety / Hybrid *
                </label>
                <input
                  type="text"
                  required
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Samba Mahsuri / K-6"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cultivated Land Area (Acres) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="500"
                  required
                  value={cultivatedAcres}
                  onChange={(e) => setCultivatedAcres(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Growth Stage
                </label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Sowing">Sowing / Seedling</option>
                  <option value="Tillering">Tillering / Early Vegetative</option>
                  <option value="Vegetative">Vegetative Growth</option>
                  <option value="Flowering">Flowering / Reproductive</option>
                  <option value="Grain Filling">Grain Filling / Pod Formation</option>
                  <option value="Maturity">Maturity / Ready to Harvest</option>
                </select>
              </div>

            </div>
          </div>

          {/* SECTION 3: Farmland Location Setup */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                  3. Farmland Location (Map & Coordinates)
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                Choose on map, search address, or enter coordinates
              </span>
            </div>

            {/* Address Search + GPS Row */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Village, Mandal, District (e.g. Kandi, Sangareddy or Tenali, Guntur)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={searching}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap disabled:opacity-50"
              >
                {searching ? 'Locating...' : 'Search Place'}
              </button>

              <button
                type="button"
                onClick={handleUseGPS}
                disabled={gpsLoading}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
              >
                <Crosshair className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Locating...' : 'Use My GPS'}</span>
              </button>

              <button
                type="button"
                onClick={toggleMapLayer}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                title="Toggle Satellite / Streets"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{tileMode === 'satellite' ? 'Street View' : 'Satellite 4K'}</span>
              </button>
            </div>

            {/* Latitude & Longitude Manual Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Latitude (°N)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={latitude}
                  onChange={(e) => handleCoordUpdate(e.target.value, longitude)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Longitude (°E)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={longitude}
                  onChange={(e) => handleCoordUpdate(latitude, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Interactive Map Canvas */}
            <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-700">
              <div ref={mapContainerRef} className="h-full w-full" />
              <div className="absolute bottom-2 left-2 z-[400] bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-slate-300 border border-slate-700 pointer-events-none">
                💡 Drag pin or click map anywhere to pinpoint your exact farm parcel
              </div>
            </div>

          </div>

          {/* SECTION 4: Soil & Irrigation Details */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Soil Texture / Classification
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {SOIL_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Irrigation Infrastructure
                </label>
                <select
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {IRRIGATION_TYPES.map(it => <option key={it} value={it}>{it}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Real-time weather defense will be customized to your {selectedCrop} field.</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Save Farmland & Launch Climate Defense</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
