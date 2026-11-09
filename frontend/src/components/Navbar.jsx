import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MapPin, Globe, User, Bell } from 'lucide-react';

const LANGUAGES = [
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'en', label: 'English' }
];

export default function Navbar({ onOpenProfile }) {
  const { farmer, activeFarm, language, updateLanguage } = useAuth();

  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-2 rounded-xl flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              PROTECTFARM <span className="text-xs bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-emerald-600">AI Real-Time</span>
            </h1>
            <p className="text-xs text-emerald-200 hidden sm:block">Agricultural Climate Defense & Welfare Intelligence</p>
          </div>
        </div>

        {/* Location Pill */}
        <div className="hidden md:flex items-center space-x-2 bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-700/60 text-xs">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-emerald-100">{activeFarm.farm_name}</span>
          <span className="text-emerald-400">•</span>
          <span className="text-emerald-200">{activeFarm.land_area_acres} Acres</span>
        </div>

        {/* Right Actions: Language & Farmer */}
        <div className="flex items-center space-x-3">
          
          {/* Language Selector */}
          <div className="relative flex items-center bg-emerald-900/80 rounded-lg px-2 py-1 border border-emerald-700">
            <Globe className="w-4 h-4 text-emerald-300 mr-1.5" />
            <select
              value={language}
              onChange={(e) => updateLanguage(e.target.value)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-800 text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Farmer User Badge */}
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-600 transition px-3 py-1.5 rounded-lg border border-emerald-600 text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-900 flex items-center justify-center font-bold text-emerald-200 text-xs">
              {farmer.full_name.charAt(0)}
            </div>
            <span className="hidden sm:inline font-medium">{farmer.full_name}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
