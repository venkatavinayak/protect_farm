import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALL_CROPS, SOIL_CLASSIFICATIONS, IRRIGATION_SYSTEMS } from '../data/cropsData';
import { 
  Sprout, 
  MapPin, 
  User, 
  Phone, 
  Crosshair, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  ShieldCheck
} from 'lucide-react';
import L from 'leaflet';

export default function FarmOnboardingScreen({ onComplete }) {
  const { farmer, setFarmer } = useAuth();

  // Form State
  const [farmerName, setFarmerName] = useState(farmer.full_name !== 'Guest Farmer' ? farmer.full_name : '');
  const [phoneNumber, setPhoneNumber] = useState(farmer.phone_number || '');

  // Crop State - using ALL_CROPS exhaustive database
  const [selectedCropId, setSelectedCropId] = useState(ALL_CROPS[0].id);
  const [variety, setVariety] = useState(ALL_CROPS[0].varieties[0]);
  const [cultivatedAcres, setCultivatedAcres] = useState(4.5);
  const [growthStage, setGrowthStage] = useState('Flowering Stage');

  // Farm Location State
  const [address, setAddress] = useState('Sangareddy District, Telangana, India');
  const [latitude, setLatitude] = useState(17.6192);
  const [longitude, setLongitude] = useState(78.0818);
  const [soilType, setSoilType] = useState(SOIL_CLASSIFICATIONS[0]);
  const [irrigation, setIrrigation] = useState(IRRIGATION_SYSTEMS[0]);

  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [tileMode, setTileMode] = useState('satellite');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const currentCrop = ALL_CROPS.find(c => c.id === selectedCropId) || ALL_CROPS[0];

  const handleCropChange = (cropId) => {
    setSelectedCropId(cropId);
    const found = ALL_CROPS.find(c => c.id === cropId);
    if (found && found.varieties.length > 0) {
      setVariety(found.varieties[0]);
    }
  };

  // Initialize interactive Leaflet map
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
        alert("Location not found. Try nearby town/district or use GPS.");
      }
    } catch (err) {
      alert("Address search failed. Please use GPS or enter coordinates.");
    } finally {
      setSearching(false);
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported on this browser.");
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
        alert("GPS permission denied: " + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

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

  const handleSubmitSetup = (e) => {
    e.preventDefault();

    const finalFarmerName = farmerName.trim() || farmer.full_name || 'Farmer';

    setFarmer(prev => ({
      ...prev,
      full_name: finalFarmerName,
      phone_number: phoneNumber,
      is_authenticated: true
    }));

    const newCropObj = {
      id: Date.now(),
      crop_name: currentCrop.name,
      category: currentCrop.category,
      variety: variety || currentCrop.varieties[0],
      growth_stage: growthStage,
      acres: parseFloat(cultivatedAcres)
    };

    onComplete({
      farmerName: finalFarmerName,
      crop: newCropObj,
      acres: cultivatedAcres,
      soilType,
      irrigation,
      location: { lat: latitude, lng: longitude, address }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-4xl w-full bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-6 sm:p-8 border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs bg-emerald-700/80 text-emerald-200 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Initial Farmland & Crop Configuration
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                Welcome, {farmerName || farmer.full_name || 'Farmer'}!
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your farmland parcel & select your crop variety to activate AI-powered climate defense.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitSetup} className="p-6 sm:p-8 space-y-7">
          
          {/* SECTION 1: Farmer Personal Details */}
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                1. Farmer Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Farmer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number (for Weather & Mandi Alerts)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98480 12345"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Exhaustive Crop & Seed Variety Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                2. Planted Crop & Seed Varieties (Unrestricted Database)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Crop (All Indian Crops) *
                </label>
                <select
                  value={selectedCropId}
                  onChange={(e) => handleCropChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {ALL_CROPS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.telugu} • {c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Certified Seed Variety / Hybrid *
                </label>
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {currentCrop.varieties.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Land Area Cultivated (Acres) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={cultivatedAcres}
                  onChange={(e) => setCultivatedAcres(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Growth Stage
                </label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Sowing Stage">Sowing Stage</option>
                  <option value="Tillering Stage">Tillering Stage</option>
                  <option value="Vegetative Stage">Vegetative Stage</option>
                  <option value="Flowering Stage">Flowering Stage</option>
                  <option value="Grain/Pod Formation">Grain / Pod Formation</option>
                  <option value="Maturity Stage">Maturity / Ready to Harvest</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Farmland Location & Map */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  3. Farmland Location (Satellite Map & Coordinates)
                </h2>
              </div>
              <span className="text-[10px] text-slate-400">
                Choose on map, search village, or enter coordinates
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Village, Mandal, District (e.g. Kandi, Sangareddy)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={searching}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 whitespace-nowrap"
              >
                {searching ? 'Locating...' : 'Search Place'}
              </button>

              <button
                type="button"
                onClick={handleUseGPS}
                disabled={gpsLoading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
              >
                <Crosshair className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Locating...' : 'Use My GPS'}</span>
              </button>

              <button
                type="button"
                onClick={toggleMapLayer}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{tileMode === 'satellite' ? 'Street View' : 'Satellite 4K'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={latitude}
                  onChange={(e) => handleCoordUpdate(e.target.value, longitude)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={longitude}
                  onChange={(e) => handleCoordUpdate(latitude, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono font-bold"
                />
              </div>
            </div>

            <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-slate-700">
              <div ref={mapContainerRef} className="h-full w-full" />
              <div className="absolute bottom-2 left-2 z-[400] bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-slate-300 border border-slate-700 pointer-events-none">
                💡 Drag pin or click anywhere on the satellite view to pinpoint your farmland
              </div>
            </div>
          </div>

          {/* SECTION 4: Soil & Irrigation Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Soil Classification
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white cursor-pointer"
              >
                {SOIL_CLASSIFICATIONS.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Irrigation System
              </label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white cursor-pointer"
              >
                {IRRIGATION_SYSTEMS.map(it => <option key={it} value={it}>{it}</option>)}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
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
