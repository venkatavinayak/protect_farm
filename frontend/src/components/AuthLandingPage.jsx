import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { ShieldCheck, CloudRain, Cpu, Sparkles, MapPin, CheckCircle2, Globe, Volume2, ArrowRight } from 'lucide-react';

export default function AuthLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="border-b border-emerald-800/50 bg-emerald-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              PROTECTFARM <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">AI Real-Time</span>
            </span>
            <p className="text-[11px] text-emerald-300">Agricultural Climate Defense & Welfare Intelligence</p>
          </div>
        </div>

        <SignInButton mode="modal">
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5">
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </SignInButton>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-center text-center">
        
        {/* Verification Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs text-emerald-200 mb-6 shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Real-time Climate Defense for Indian Smallholder Farmers</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Protect Your Crops From <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Extreme Weather Threats</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Log in with your Google account to pin your farmland parcel on 4K satellite maps, track crop-specific water threat analytics (Paddy vs. Groundnut), and receive Explainable AI biological mitigation steps.
        </p>

        {/* Central Sign-In Call to Action Card */}
        <div className="mt-8 bg-slate-900/80 border border-emerald-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-lg max-w-md w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>

          <h3 className="text-lg font-bold text-white">Farmer Verification & Access</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Sign in with your Gmail to sync your farmland, crops, and live alerts.
          </p>

          <SignInButton mode="modal">
            <button className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3.5 rounded-2xl shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98]">
              {/* Google SVG Logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="text-sm">Continue with Google</span>
            </button>
          </SignInButton>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Instant Free Access • 100% Free Tier</span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          
          <div className="bg-slate-900/60 border border-emerald-900/60 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center mb-3">
              <CloudRain className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Crop-Specific Threat Engine</h4>
            <p className="text-xs text-slate-400 mt-1">
              Rain benefits wetland Paddy, but causes root rot/hypoxia in Arid crops like Groundnut. We differentiate impact scientifically.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-emerald-900/60 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">4K Satellite Farmland Mapper</h4>
            <p className="text-xs text-slate-400 mt-1">
              Locate your field by village address, GPS, or coordinates. Draw field boundaries and compute exact acreage in real-time.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-emerald-900/60 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center mb-3">
              <Volume2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Voice Assistant & XAI Advice</h4>
            <p className="text-xs text-slate-400 mt-1">
              Talk to the AI in Telugu, Hindi, Tamil, Kannada, Marathi, or English. Receive biological causation and 3 actionable mitigations.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 max-w-7xl mx-auto w-full px-4">
        🌾 PROTECTFARM • Built for Indian Agriculture & Climate Resilience • Zero Cost Free Tier
      </footer>

    </div>
  );
}
