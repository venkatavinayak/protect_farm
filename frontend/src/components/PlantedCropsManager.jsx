import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Sprout, Calendar, Tag, Check, AlertCircle } from 'lucide-react';

const COMMON_CROPS = [
  { name: 'Paddy / Rice', category: 'wetland', defaultVariety: 'BPT 5204 (Samba)', waterNeed: 'High (Tolerates standing water)' },
  { name: 'Groundnut', category: 'arid_pulse', defaultVariety: 'Kadiri-6 (K-6)', waterNeed: 'Low (Prone to root rot in waterlogging)' },
  { name: 'Cotton', category: 'cash_crop', defaultVariety: 'Bt-Cotton II', waterNeed: 'Medium (Boll rot during heavy rain)' },
  { name: 'Tomato', category: 'horticulture', defaultVariety: 'Arka Rakshak', waterNeed: 'Medium (Damping off & blossom drop)' },
  { name: 'Banana', category: 'tall_stalk', defaultVariety: 'Grand Naine (G9)', waterNeed: 'High (Critical wind lodging risk)' },
  { name: 'Sugarcane', category: 'tall_stalk', defaultVariety: 'Co 86032', waterNeed: 'High (Lodging in gale storms)' },
  { name: 'Chickpea', category: 'arid_pulse', defaultVariety: 'JG 11', waterNeed: 'Very Low (Root suffocation in rain)' },
];

const GROWTH_STAGES = ['Seedling', 'Vegetative', 'Flowering / Tillering', 'Pod / Grain Formation', 'Maturity / Harvesting'];

export default function PlantedCropsManager() {
  const { plantedCrops, addCrop } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [selectedCrop, setSelectedCrop] = useState(COMMON_CROPS[0]);
  const [variety, setVariety] = useState(COMMON_CROPS[0].defaultVariety);
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [growthStage, setGrowthStage] = useState('Vegetative');

  const handleCropSelectChange = (e) => {
    const found = COMMON_CROPS.find(c => c.name === e.target.value) || COMMON_CROPS[0];
    setSelectedCrop(found);
    setVariety(found.defaultVariety);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addCrop({
      crop_name: selectedCrop.name.split(' / ')[0],
      crop_category: selectedCrop.category,
      variety: variety,
      sowing_date: sowingDate,
      growth_stage: growthStage
    });
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-700" />
            My Planted Crops & Phenological Stage
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            The AI cross-references weather alerts strictly against the water needs of these crops.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Crop</span>
        </button>
      </div>

      {/* Add Crop Modal/Inline Form */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4 text-xs">
          <h4 className="font-bold text-emerald-950 text-sm">Register Planted Crop</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Crop Type:</label>
              <select
                value={selectedCrop.name}
                onChange={handleCropSelectChange}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {COMMON_CROPS.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Variety / Hybrid:</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="e.g. BPT 5204"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sowing Date:</label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Growth Stage:</label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {GROWTH_STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-emerald-800 italic">
              Water Requirement: {selectedCrop.waterNeed}
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-xs"
              >
                Save Planted Crop
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Active Crops Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {plantedCrops.map((crop) => (
          <div key={crop.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">{crop.crop_name}</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Variety: {crop.variety}</p>
              
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stage:</span>
                  <span className="font-semibold text-slate-800">{crop.growth_stage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sown On:</span>
                  <span className="font-semibold text-slate-800">{crop.sowing_date}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Weather Monitored</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
