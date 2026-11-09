import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { ShieldCheck, MapPin, Clock, LogIn, Settings2, Sprout, ChevronDown, Plus, CheckCircle2 } from 'lucide-react';
import AddFarmModal from './AddFarmModal';

export default function Navbar({ onToggleView }) {
  const { farmer, farms, activeFarm, activeFarmId, switchFarm, plantedCrops, reopenSetup } = useAuth();
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const primaryCrop = plantedCrops && plantedCrops.length > 0 ? plantedCrops[0].crop_name : null;

  return (
    <>
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-xl flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                PROTECTFARM <span className="text-xs bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-emerald-600">Real-Time</span>
              </h1>
              <p className="text-xs text-emerald-200 hidden sm:block">Agricultural Climate Defense & Welfare Intelligence</p>
            </div>
          </div>

          {/* Farmland Selector Dropdown Pill */}
          <div className="hidden md:flex items-center relative">
            <button
              onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
              className="flex items-center space-x-2 bg-emerald-900/70 hover:bg-emerald-900 px-3.5 py-1.5 rounded-full border border-emerald-700 text-xs transition"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-emerald-100 truncate max-w-[160px]">
                {activeFarm.farm_name}
              </span>
              <span className="text-emerald-400">•</span>
              <span className="text-emerald-200">{activeFarm.land_area_acres} Acres</span>
              {primaryCrop && (
                <>
                  <span className="text-emerald-400">•</span>
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <Sprout className="w-3 h-3" /> {primaryCrop}
                  </span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-emerald-400 ml-1" />
            </button>

            {farmDropdownOpen && (
              <div className="absolute top-10 left-0 w-72 bg-slate-900 border border-emerald-700/60 rounded-2xl shadow-2xl z-50 p-2 animate-fadeIn text-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-3 py-1.5 border-b border-slate-800">
                  Select Registered Farmland:
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
                        : 'text-slate-300 hover:bg-slate-800'
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
                    setShowAddFarm(true);
                  }}
                  className="w-full mt-2 pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-xl text-xs font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Farmland Parcel</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Actions: Live Clock, Edit Farm, Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Real-Time Live Clock on top */}
            <div className="flex items-center space-x-1.5 bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-700 text-xs text-emerald-200 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{formattedDateTime}</span>
              <span className="sm:hidden">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Toggle to AgriGuard Radar Dashboard */}
            {onToggleView && (
              <button
                onClick={onToggleView}
                className="flex items-center space-x-1.5 bg-emerald-950/80 hover:bg-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-600 text-xs font-bold text-amber-300 transition shadow-sm"
                title="Switch to AgriGuard Radar Dashboard"
              >
                <span>⚡ AgriGuard Radar</span>
              </button>
            )}

            {/* Farm Setup Re-open button */}
            <button
              onClick={reopenSetup}
              className="hidden lg:flex items-center space-x-1.5 bg-emerald-900/60 hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-700 text-xs text-emerald-200 transition"
              title="Edit Farm Location & Crop Details"
            >
              <Settings2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Farm Setup</span>
            </button>

            {/* Clerk User Profile */}
            <SignedIn>
              <div className="flex items-center space-x-2 bg-emerald-700/80 border border-emerald-500/60 px-2.5 py-1 rounded-xl">
                <UserButton afterSignOutUrl="/" />
                <span className="hidden sm:inline text-xs font-semibold text-white">
                  {farmer.full_name?.split(' ')[0] || 'Farmer'}
                </span>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-bold px-3 py-1.5 rounded-xl shadow-md transition text-xs">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            </SignedOut>

          </div>

        </div>
      </header>

      {/* Add Farm Modal */}
      <AddFarmModal isOpen={showAddFarm} onClose={() => setShowAddFarm(false)} />
    </>
  );
}
