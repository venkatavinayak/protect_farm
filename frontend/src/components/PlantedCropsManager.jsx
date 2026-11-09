import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALL_CROPS } from '../data/cropsData';
import { Plus, Sprout, Calendar, Tag, Check, AlertCircle, Trash2 } from 'lucide-react';

const GROWTH_STAGES = [
  'Sowing / Seedling',
  'Vegetative Stage',
  'Tillering Stage',
  'Flowering / Reproductive',
  'Grain / Pod Formation',
  'Maturity / Harvesting'
];

export default function PlantedCropsManager() {
  const { activeFarm, plantedCrops, addCrop } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [selectedCropId, setSelectedCropId] = useState(ALL_CROPS[0].id);
  const [variety, setVariety] = useState(ALL_CROPS[0].varieties[0]);
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [growthStage, setGrowthStage] = useState('Vegetative Stage');
  const [acres, setAcres] = useState(2.0);

  const currentCrop = ALL_CROPS.find(c => c.id === selectedCropId) || ALL_CROPS[0];

  const handleCropChange = (cropId) => {
    setSelectedCropId(cropId);
    const found = ALL_CROPS.find(c => c.id === cropId);
    if (found && found.varieties.length > 0) {
      setVariety(found.varieties[0]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addCrop({
      crop_name: currentCrop.name,
      category: currentCrop.category,
      variety: variety,
      sowing_date: sowingDate,
      growth_stage: growthStage,
      acres: parseFloat(acres) || 1.0
    });
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-700" />
            Crops Planted on {activeFarm.farm_name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            The AI climate defense model cross-references live rainfall against the cellular water needs of these crops.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Add Crop'}</span>
        </button>
      </div>

      {/* Add Crop Inline Form */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="font-bold text-xs uppercase text-emerald-900 tracking-wider">
            Assign Crop & Seed Variety to {activeFarm.farm_name}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Crop (All Indian Varieties) *
              </label>
              <select
                value={selectedCropId}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {ALL_CROPS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.telugu} • {c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Certified Seed Variety / Hybrid *
              </label>
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {currentCrop.varieties.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Growth Stage *
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {GROWTH_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cultivated Area (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sowing Date
              </label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Confirm & Monitor Crop
            </button>
          </div>
        </form>
      )}

      {/* Planted Crops Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plantedCrops.length === 0 ? (
          <div className="col-span-2 text-center py-6 text-slate-400 text-xs">
            No crops registered yet on this land. Click "Add Crop" above to begin monitoring.
          </div>
        ) : (
          plantedCrops.map((crop, idx) => {
            const isWetland = crop.category === 'wetland' || crop.crop_name.toLowerCase().includes('paddy');
            return (
              <div
                key={crop.id || idx}
                className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="text-base">🌱</span> {crop.crop_name}
                      </span>
                      <span className="text-xs text-emerald-800 font-medium block mt-0.5">
                        Variety: {crop.variety || 'Certified Hybrid'}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isWetland ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {isWetland ? 'Wetland Hydrophyte' : 'Arid Aerated'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Stage:</span>
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded-lg text-slate-700 font-medium text-[11px]">
                      {crop.growth_stage || 'Flowering Stage'}
                    </span>
                    {crop.acres && (
                      <span className="text-slate-500 font-medium text-[11px]">• {crop.acres} Acres</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Real-time Threat Monitoring Active
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
