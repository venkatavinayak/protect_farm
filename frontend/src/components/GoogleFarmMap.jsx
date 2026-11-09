import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Crosshair, Layers, Key, ExternalLink, Check, Trash2, ShieldCheck } from 'lucide-react';

export default function GoogleFarmMap() {
  const { activeFarm, updateFarmLocation } = useAuth();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polygonRef = useRef(null);

  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState(envKey);
  const [keyInput, setKeyInput] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [areaAcres, setAreaAcres] = useState(activeFarm.land_area_acres || 4.2);
  const [drawMode, setDrawMode] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    const keyToUse = apiKey || envKey;
    if (!keyToUse) {
      setIsLoaded(false);
      return;
    }

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      initMap();
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${keyToUse}&libraries=geometry,drawing`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
        setLoadError(false);
        initMap();
      };
      script.onerror = () => {
        setLoadError(true);
        setIsLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
      initMap();
    }
  }, [apiKey]);

  const initMap = () => {
    if (!mapContainerRef.current || !window.google || !window.google.maps) return;

    const farmCenter = {
      lat: activeFarm.latitude || 17.6192,
      lng: activeFarm.longitude || 78.0818
    };

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: farmCenter,
      zoom: 17,
      mapTypeId: 'hybrid', // High-res satellite with road labels
      tilt: 0,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },
      streetViewControl: false,
      fullscreenControl: true
    });

    mapRef.current = map;

    // Farm Centroid Marker
    const marker = new window.google.maps.Marker({
      position: farmCenter,
      map: map,
      draggable: true,
      title: "Farm Centroid",
      animation: window.google.maps.Animation.DROP
    });

    marker.addListener('dragend', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      updateFarmLocation({ lat, lng }, areaAcres);
    });

    markerRef.current = marker;

    // Handle clicks for polygon boundary drawing
    map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (drawMode) {
        setPolygonCoords(prev => {
          const updated = [...prev, { lat, lng }];
          updatePolygonOnMap(updated);
          return updated;
        });
      } else {
        marker.setPosition({ lat, lng });
        updateFarmLocation({ lat, lng }, areaAcres);
      }
    });
  };

  const updatePolygonOnMap = (coords) => {
    if (!mapRef.current || !window.google) return;

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    if (coords.length > 2) {
      const polygon = new window.google.maps.Polygon({
        paths: coords,
        strokeColor: '#22c55e',
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: '#16a34a',
        fillOpacity: 0.35,
        map: mapRef.current
      });

      polygonRef.current = polygon;

      // Calculate area using spherical geometry
      if (window.google.maps.geometry && window.google.maps.geometry.spherical) {
        const sqm = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
        const acres = (sqm * 0.000247105).toFixed(2);
        setAreaAcres(acres);
        updateFarmLocation(
          { lat: activeFarm.latitude, lng: activeFarm.longitude },
          parseFloat(acres),
          JSON.stringify(coords)
        );
      }
    }
  };

  const resetPolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
    setPolygonCoords([]);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          mapRef.current.panTo({ lat, lng });
          if (markerRef.current) {
            markerRef.current.setPosition({ lat, lng });
          }
          updateFarmLocation({ lat, lng }, areaAcres);
        },
        () => alert('GPS location denied. Please enable location permissions.')
      );
    }
  };

  const applyCustomKey = (e) => {
    e.preventDefault();
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[460px]">
      
      {/* Header Controls */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900">Google Maps Geospatial Farm Land</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Satellite 4K
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Centroid: {activeFarm.latitude.toFixed(4)}°N, {activeFarm.longitude.toFixed(4)}°E
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Draw Polygon Toggle */}
          {isLoaded && (
            <>
              <button
                onClick={() => setDrawMode(!drawMode)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 shadow-xs ${
                  drawMode
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{drawMode ? '✏️ Drawing Boundary...' : 'Draw Field Polygon'}</span>
              </button>

              {polygonCoords.length > 0 && (
                <button
                  onClick={resetPolygon}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  title="Clear Polygon"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              )}
            </>
          )}

          {/* Current GPS button */}
          <button
            onClick={handleLocateMe}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition shadow-xs font-semibold"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">My GPS</span>
          </button>
        </div>
      </div>

      {/* Map Container / Fallback */}
      <div className="flex-1 relative bg-slate-900">
        
        {/* If Google Maps API is loaded, show native canvas */}
        {isLoaded ? (
          <div ref={mapContainerRef} className="h-full w-full" />
        ) : (
          /* Interactive Fallback & Key Input Setup */
          <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950 text-white">
            <div className="p-3 bg-white/10 rounded-2xl mb-3 backdrop-blur">
              <Key className="w-8 h-8 text-amber-400" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Enter Google Maps API Key</h4>
            <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
              To render high-resolution Google Maps Hybrid Satellite imagery with live spherical boundary area calculations, paste your Google Maps JavaScript API key below.
            </p>

            <form onSubmit={applyCustomKey} className="flex items-center gap-2 w-full max-w-md mb-3">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
              >
                Load Map
              </button>
            </form>

            <a
              href="https://console.cloud.google.com/google/maps-apis/credentials"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 underline"
            >
              <span>Get a free Google Maps API Key on Google Cloud Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Embedded interactive Google Maps Satellite frame as zero-config immediate preview */}
            <div className="mt-4 w-full h-32 rounded-xl overflow-hidden border border-white/10 shadow-inner relative">
              <iframe
                title="Google Satellite Preview"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'contrast(1.1) brightness(0.95)' }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${activeFarm.latitude},${activeFarm.longitude}&t=k&z=17&ie=UTF8&iwloc=&output=embed`}
              />
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] text-emerald-300 font-mono">
                Satellite Preview ({activeFarm.latitude.toFixed(3)}, {activeFarm.longitude.toFixed(3)})
              </div>
            </div>
          </div>
        )}

        {/* Floating Farm Acreage Card */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Farm Land Area:</span>
          </div>
          <strong className="text-emerald-900 text-sm font-extrabold">{areaAcres} Acres</strong>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {drawMode ? 'Click points on field to enclose polygon' : 'Drag marker to update centroid'}
          </p>
        </div>

      </div>

    </div>
  );
}
