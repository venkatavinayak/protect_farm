import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Crosshair, Search, Layers, CheckCircle2, RotateCcw, PenTool, Sparkles, AlertCircle } from 'lucide-react';
import L from 'leaflet';

export default function GeospatialFarmMap() {
  const { farmer, activeFarm, updateFarmLocation } = useAuth();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polygonLayerRef = useRef(null);

  const [addressInput, setAddressInput] = useState(activeFarm.address || '');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [tileMode, setTileMode] = useState('satellite'); // 'satellite' or 'streets'
  const [drawingMode, setDrawingMode] = useState(false);
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [areaAcres, setAreaAcres] = useState(activeFarm.land_area_acres || 4.2);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Initialize Leaflet Map
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
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // High-Resolution 4K Satellite Imagery (Esri World Imagery - 100% Free, No API Key needed)
      const satelliteTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Esri World Satellite Imagery' }
      );

      // OpenStreetMap street layer
      const streetTiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
      );

      satelliteTiles.addTo(map);

      // Custom Farm Centroid Pin
      const customIcon = L.divIcon({
        className: 'custom-farm-centroid',
        html: `
          <div style="
            background: linear-gradient(135deg, #10b981, #047857);
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">🌾</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      marker.bindPopup(`<b>${farmer.full_name}'s Farm</b><br>${activeFarm.address}`).openPopup();

      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        updateFarmLocation({ lat, lng }, areaAcres, null, addressInput);
      });

      markerRef.current = marker;

      // Map Click Event
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // In drawing mode, append points to farm boundary
        if (map._drawModeActive) {
          map._addBoundaryPoint(lat, lng);
        } else {
          // In normal mode, reposition the centroid pin
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            updateFarmLocation({ lat, lng }, areaAcres, null, addressInput);
          }
        }
      });

      mapInstanceRef.current = { map, satelliteTiles, streetTiles };
    }

    return () => {
      // Map preserved across tabs
    };
  }, []);

  // Update map internal reference for drawing mode
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.map._drawModeActive = drawingMode;
      mapInstanceRef.current.map._addBoundaryPoint = (lat, lng) => {
        setBoundaryPoints(prev => {
          const next = [...prev, [lat, lng]];
          renderBoundaryPolygon(next);
          return next;
        });
      };
    }
  }, [drawingMode]);

  // Render Polygon on the map & calculate spherical acreage
  const renderBoundaryPolygon = (points) => {
    if (!mapInstanceRef.current) return;
    const { map } = mapInstanceRef.current;

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (points.length >= 3) {
      const polygon = L.polygon(points, {
        color: '#10b981',
        weight: 3,
        fillColor: '#34d399',
        fillOpacity: 0.35,
        dashArray: '5, 8'
      }).addTo(map);

      polygonLayerRef.current = polygon;

      // Calculate Area in Acres using Geodesic Spherical Shoelace Formula
      const areaM2 = calculatePolygonAreaMeters(points);
      const calculatedAcres = parseFloat((areaM2 * 0.000247105).toFixed(2));
      const validAcres = calculatedAcres > 0.1 ? calculatedAcres : 4.2;
      setAreaAcres(validAcres);

      const centroidLat = points.reduce((acc, p) => acc + p[0], 0) / points.length;
      const centroidLng = points.reduce((acc, p) => acc + p[1], 0) / points.length;

      if (markerRef.current) {
        markerRef.current.setLatLng([centroidLat, centroidLng]);
      }

      updateFarmLocation({ lat: centroidLat, lng: centroidLng }, validAcres, {
        type: 'Polygon',
        coordinates: [points.map(p => [p[1], p[0]])]
      }, addressInput);
    }
  };

  // Geodesic Polygon Area Calculation (Spherical excess)
  const calculatePolygonAreaMeters = (coords) => {
    const RADIUS = 6378137; // Earth radius in meters
    if (coords.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      const rad = Math.PI / 180;
      area += (p2[1] - p1[1]) * rad * (2 + Math.sin(p1[0] * rad) + Math.sin(p2[0] * rad));
    }
    return Math.abs((area * RADIUS * RADIUS) / 2);
  };

  // Address Geocoding Search via Nominatim (Free, no API key needed)
  const handleAddressSearch = async (e) => {
    if (e) e.preventDefault();
    if (!addressInput.trim()) return;

    setSearching(true);
    setSearchError('');

    try {
      // Free OpenStreetMap Nominatim search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&limit=1`,
        { headers: { 'Accept-Language': 'en,te,hi' } }
      );

      if (!response.ok) throw new Error("Search service unavailable");
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const resolvedName = data[0].display_name;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.map.flyTo([lat, lng], 16, { duration: 1.5 });
        }

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          markerRef.current.bindPopup(`<b>${farmer.full_name}'s Farmland</b><br>${resolvedName}`).openPopup();
        }

        updateFarmLocation({ lat, lng }, areaAcres, null, resolvedName);
      } else {
        setSearchError("Location not found. Try entering village/district name (e.g. 'Sangareddy' or 'Tenali').");
      }
    } catch (err) {
      setSearchError("Failed to search location. Please try again or use GPS.");
    } finally {
      setSearching(false);
    }
  };

  // GPS Current Location
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.map.flyTo([lat, lng], 17, { duration: 1.5 });
        }

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          markerRef.current.bindPopup(`<b>Current GPS Location</b><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`).openPopup();
        }

        const gpsAddress = `Field at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
        setAddressInput(gpsAddress);
        updateFarmLocation({ lat, lng }, areaAcres, null, gpsAddress);
        setGpsLoading(false);
      },
      (err) => {
        alert("GPS location access denied or unavailable: " + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Toggle Tile Layer
  const toggleTileMode = () => {
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

  // Clear Boundary
  const handleClearBoundary = () => {
    setBoundaryPoints([]);
    if (polygonLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    setAreaAcres(4.2);
    setDrawingMode(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 to-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {farmer.is_authenticated ? `${farmer.full_name}'s Farmland` : 'Interactive Farm Geospatial Land'}
            </h2>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {tileMode === 'satellite' ? 'Satellite 4K' : 'Road Map'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Centroid: {activeFarm.latitude.toFixed(4)}°N, {activeFarm.longitude.toFixed(4)}°E • Tap on map or enter address to set your farm
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Tile Toggle */}
          <button
            onClick={toggleTileMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            title="Toggle between Satellite and Street Map"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>{tileMode === 'satellite' ? 'Street View' : 'Satellite 4K'}</span>
          </button>

          {/* GPS Button */}
          <button
            onClick={handleUseGPS}
            disabled={gpsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Crosshair className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsLoading ? 'Locating...' : 'My GPS'}</span>
          </button>

          {/* Draw Boundary Toggle */}
          <button
            onClick={() => setDrawingMode(!drawingMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
              drawingMode 
                ? 'bg-amber-600 text-white hover:bg-amber-700 ring-2 ring-amber-400' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{drawingMode ? 'Drawing Mode Active' : 'Draw Boundary'}</span>
          </button>

          {boundaryPoints.length > 0 && (
            <button
              onClick={handleClearBoundary}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition"
              title="Clear Boundary Polygon"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>
      </div>

      {/* Address Search Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-2 items-center">
        <form onSubmit={handleAddressSearch} className="flex-1 flex w-full gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter village, Mandal, District or Address (e.g. Kandi, Sangareddy or Tenali, AP)..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap disabled:opacity-50"
          >
            {searching ? 'Locating...' : 'Search Farm'}
          </button>
        </form>
      </div>

      {searchError && (
        <div className="px-4 py-2 bg-amber-50 text-amber-800 text-xs border-b border-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Drawing Instructions Banner */}
      {drawingMode && (
        <div className="px-4 py-2 bg-amber-500 text-white text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5" />
            Click 3 or more points around your farm boundary to calculate exact field acreage.
          </span>
          <button
            onClick={() => setDrawingMode(false)}
            className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[11px] font-bold"
          >
            Done
          </button>
        </div>
      )}

      {/* Map Canvas Container */}
      <div className="relative h-[420px] w-full bg-slate-900">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Acreage Floating Badge */}
        <div className="absolute top-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md text-white px-3.5 py-2 rounded-xl shadow-xl border border-slate-700/80 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Farm Acreage</span>
          </div>
          <div className="text-xl font-extrabold text-white leading-tight mt-0.5">
            {areaAcres} <span className="text-xs font-normal text-slate-300">Acres</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {boundaryPoints.length >= 3 ? `${boundaryPoints.length}-point surveyor polygon` : 'Drag pin or click map to move'}
          </div>
        </div>

        {/* Auth status footer chip */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-slate-200/80 text-[11px] text-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {farmer.is_authenticated 
              ? `Linked to Google account: ${farmer.email || farmer.full_name}` 
              : 'Sign in with Google above to sync this farm to cloud profile'}
          </span>
        </div>

      </div>

    </div>
  );
}
