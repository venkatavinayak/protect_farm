import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VOICE_LANG_MAP = {
  te: { code: 'te-IN', fallback: 'hi-IN', label: 'తెలుగు వాయిస్ అసిస్టెంట్' },
  hi: { code: 'hi-IN', fallback: 'en-IN', label: 'हिन्दी वॉइस सहायक' },
  ta: { code: 'ta-IN', fallback: 'en-IN', label: 'தமிழ் குரல் உதவியாளர்' },
  kn: { code: 'kn-IN', fallback: 'en-IN', label: 'ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯಕ' },
  mr: { code: 'mr-IN', fallback: 'hi-IN', label: 'मराठी आवाज सहाय्यक' },
  en: { code: 'en-IN', fallback: 'en-US', label: 'English Voice Assistant' }
};

export default function VoiceAssistantBar({ scriptText, currentThreat }) {
  const { language } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9); // Slightly slower for clear regional comprehension
  const [supported, setSupported] = useState(true);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // When script or language changes, stop current playback
  useEffect(() => {
    if (synthRef.current && isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  }, [scriptText, language]);

  const handleTogglePlay = () => {
    if (!synthRef.current || !scriptText) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(scriptText);
    const targetConfig = VOICE_LANG_MAP[language] || VOICE_LANG_MAP.en;
    
    // Attempt to match system voice
    const voices = synthRef.current.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(language) || v.lang === targetConfig.code);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    
    utterance.lang = targetConfig.code;
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  };

  const handleReplay = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setTimeout(handleTogglePlay, 100);
    }
  };

  const langConfig = VOICE_LANG_MAP[language] || VOICE_LANG_MAP.en;

  return (
    <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Left info & animated wave */}
      <div className="flex items-center space-x-3 w-full md:w-auto">
        <div className="w-12 h-12 rounded-xl bg-emerald-600/50 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-inner">
          <Volume2 className="w-6 h-6 text-emerald-200" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-emerald-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {langConfig.label}
            </span>
            <span className="text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded-full text-emerald-200 uppercase font-semibold">
              Live Audio
            </span>
          </div>
          <p className="text-xs text-emerald-200/90 mt-0.5 max-w-xl truncate">
            {scriptText || "No active threat. Weather conditions are safe for your planted crops."}
          </p>
        </div>
      </div>

      {/* Audio Wave Visualizer */}
      <div className="hidden lg:flex items-center space-x-1 px-4">
        {[40, 70, 30, 90, 50, 80, 45, 60].map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-emerald-700'
            }`}
            style={{ height: isPlaying ? `${h}%` : '20%', minHeight: '6px' }}
          />
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
        {/* Speed button */}
        <button
          onClick={() => setSpeechRate(r => r === 0.9 ? 1.1 : 0.9)}
          className="text-xs bg-emerald-800/80 hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-600 text-emerald-200 font-medium transition"
          title="Speech rate"
        >
          {speechRate}x Speed
        </button>

        {/* Replay */}
        <button
          onClick={handleReplay}
          className="p-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-600 transition"
          title="Restart Audio"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Play/Pause Primary button */}
        <button
          onClick={handleTogglePlay}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition transform active:scale-95 ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>ఆపు (Pause)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>వినండి (Listen)</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
