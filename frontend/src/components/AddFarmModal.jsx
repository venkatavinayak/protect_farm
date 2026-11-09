import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALL_CROPS, SOIL_CLASSIFICATIONS, IRRIGATION_SYSTEMS } from '../data/cropsData';
import { X, Plus, MapPin, Sprout, CheckCircle2 } from 'lucide-react';

export default function AddFarmModal({ isOpen, onClose }) {
  const { addFarm, farms } = useAuth();

  const [farmName, setFarmName] = useState(`Farmland #${farms.length + 1}`);
  const [landArea, setLandArea] = useState(3.0);
  const [address, setAddress] = useState('Sangareddy District, Telangana');
  const [latitude, setLatitude] = useState(17.6192);
  const [longitude, setLongitude] = useState(78.0818);
  const [soilType, setSoilType] = useState(SOIL_CLASSIFICATIONS[0]);
  const [irrigation, setIrrigation] = useState(IRRIGATION_SYSTEMS[0]);

  // Crop assignment
  const [selectedCropId, setSelectedCropId] = useState(ALL_CROPS[0].id);
  const [selectedVariety, setSelectedVariety] = useState(ALL_CROPS[0].varieties[0]);
  const [growthStage, setGrowthStage] = useState('Vegetative Stage');
  const [cropAcres, setCropAcres] = useState(3.0);

  if (!isOpen) return null;

  const currentCrop = ALL_CROPS.find(c => c.id === selectedCropId) || ALL_CROPS[0];

  const handleCropChange = (cropId) => {
    setSelectedCropId(cropId);
    const crop = ALL_CROPS.find(c => c.id === cropId);
    if (crop && crop.varieties.length > 0) {
      setSelectedVariety(crop.varieties[0]);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const assignedCrop = {
      id: Date.now(),
      crop_name: currentCrop.name,
      category: currentCrop.category,
      variety: selectedVariety,
      growth_stage: growthStage,
      acres: parseFloat(cropAcres) || parseFloat(landArea)
    };

    addFarm({
      farm_name: `${farmName} (${landArea} Acres)`,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      land_area_acres: parseFloat(landArea),
      soil_type: soilType,
      irrigation,
      crops: [assignedCrop]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-500/40">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Additional Farmland Parcel</h2>
              <p className="text-xs text-slate-400">Assign specific crops, acreage & soil to this land parcel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAddSubmit} className="mt-6 space-y-6">
          
          {/* Farm Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Farmland Parcel Name *</label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. North Canal Land"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Land Area (Acres) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={landArea}
                onChange={(e) => {
                  setLandArea(e.target.value);
                  setCropAcres(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Location & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location Address / Village</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Village, Mandal, District"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Latitude (°N)</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Longitude (°E)</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Soil Texture</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white cursor-pointer"
              >
                {SOIL_CLASSIFICATIONS.map(st => <option key={st} value={st}>{st.split(' ')[0]} Soil</option>)}
              </select>
            </div>
          </div>

          {/* Assign Crop to this Land */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Assign Crop to this Farmland
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Crop *</label>
                <select
                  value={selectedCropId}
                  onChange={(e) => handleCropChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                >
                  {ALL_CROPS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.telugu} / {c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Certified Seed Variety / Hybrid *</label>
                <select
                  value={selectedVariety}
                  onChange={(e) => setSelectedVariety(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                >
                  {currentCrop.varieties.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Growth Stage</label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="Sowing Stage">Sowing Stage</option>
                  <option value="Vegetative Stage">Vegetative Stage</option>
                  <option value="Tillering Stage">Tillering Stage</option>
                  <option value="Flowering Stage">Flowering Stage</option>
                  <option value="Grain/Pod Formation">Grain/Pod Formation</option>
                  <option value="Maturity Stage">Maturity Stage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cropAcres}
                  onChange={(e) => setCropAcres(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Farmland</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
