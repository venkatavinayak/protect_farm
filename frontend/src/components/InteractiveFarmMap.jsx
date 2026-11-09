import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Layers, Crosshair, RefreshCw, CheckCircle2 } from 'lucide-react';
import L from 'leaflet';

export default function InteractiveFarmMap() {
  const { activeFarm, updateFarmLocation } = useAuth();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polygonLayerRef = useRef(null);

  const [mapMode, setMapMode] = useState('pin'); // 'pin' or 'polygon'
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [tileType, setTileType] = useState('satellite'); // 'street' or 'satellite'
  const [calculatedArea, setCalculatedArea] = useState(activeFarm.land_area_acres);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Fix default marker icon assets
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
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile Layer: Esri World Imagery (Satellite) & OSM
      const satelliteTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Esri Satellite' }
      );

      const streetTiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '© OpenStreetMap' }
      );

      satelliteTiles.addTo(map);
      mapInstanceRef.current = { map, satelliteTiles, streetTiles };

      // Add Centroid Marker
      const customIcon = L.divIcon({
        className: 'custom-farm-marker',
        html: `
          <div style="background-color: #15803d; color: white; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">
            🌱
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        updateFarmLocation({ lat, lng });
      });

      markerRef.current = marker;

      // Handle map clicks
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // In pin mode, moves the marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          updateFarmLocation({ lat, lng });
        }
      });
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  // Toggle Tile Layer
  const toggleTileLayer = () => {
    if (!mapInstanceRef.current) return;
    const { map, satelliteTiles, streetTiles } = mapInstanceRef.current;
    if (tileType === 'satellite') {
      map.removeLayer(satelliteTiles);
      streetTiles.addTo(map);
      setTileType('street');
    } else {
      map.removeLayer(streetTiles);
      satelliteTiles.addTo(map);
      setTileType('satellite');
    }
  };

  // Locate Current GPS
  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const { map } = mapInstanceRef.current;
          map.flyTo([lat, lng], 17);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
          updateFarmLocation({ lat, lng });
        },
        () => alert('Could not access GPS. Please ensure location permissions are granted.')
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[420px]">
      
      {/* Map Control Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-800">Interactive Farm Land Boundary</h3>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            ({activeFarm.latitude.toFixed(4)}°N, {activeFarm.longitude.toFixed(4)}°E)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Current GPS button */}
          <button
            onClick={handleLocateMe}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition shadow-sm font-medium"
            title="Locate via GPS"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">My GPS</span>
          </button>

          {/* Satellite Toggle */}
          <button
            onClick={toggleTileLayer}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition shadow-sm font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{tileType === 'satellite' ? 'Satellite' : 'Street'}</span>
          </button>
        </div>
      </div>

      {/* Leaflet Canvas Container */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="h-full w-full" />
        
        {/* Floating Land Area Badge */}
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs">
          <span className="text-slate-500">Calculated Land:</span>{' '}
          <strong className="text-emerald-800 text-sm">{activeFarm.land_area_acres} Acres</strong>
          <p className="text-[10px] text-slate-400 mt-0.5">Drag the pin to adjust your farm's centroid</p>
        </div>
      </div>

    </div>
  );
}
