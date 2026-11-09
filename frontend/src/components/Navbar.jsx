import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { ShieldCheck, MapPin, Globe, LogIn } from 'lucide-react';

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
              PROTECTFARM <span className="text-xs bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-emerald-600">Real-Time</span>
            </h1>
            <p className="text-xs text-emerald-200 hidden sm:block">Agricultural Climate Defense & Welfare Intelligence</p>
          </div>
        </div>

        {/* Location Pill */}
        <div className="hidden md:flex items-center space-x-2 bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-700/60 text-xs">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-emerald-100 truncate max-w-[200px]">{activeFarm.address.split(',')[0]}</span>
          <span className="text-emerald-400">•</span>
          <span className="text-emerald-200">{activeFarm.land_area_acres} Acres</span>
        </div>

        {/* Right Actions: Language & Auth */}
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

          {/* Real-Time Clerk Auth Integration */}
          <SignedIn>
            <div className="flex items-center space-x-2 bg-emerald-700/80 border border-emerald-500/60 px-2.5 py-1 rounded-xl">
              <UserButton afterSignOutUrl="/" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">{farmer.full_name}</span>
                <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Google Auth
                </span>
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-bold px-3 py-1.5 rounded-xl shadow-md transition text-xs">
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            </SignInButton>
          </SignedOut>

        </div>

      </div>
    </header>
  );
}
