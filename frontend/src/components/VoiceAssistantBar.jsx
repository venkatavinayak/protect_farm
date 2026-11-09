import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, Mic, MicOff, Send, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { askGeminiVoiceAdvisor, detectLanguage, getLangSpeechCode } from '../services/geminiService';

export default function VoiceAssistantBar({ scriptText, currentThreat }) {
  const { activeFarm, plantedCrops, farmer } = useAuth();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);
  
  // Chat & Detailed Solution state
  const [userQuery, setUserQuery] = useState('');
  const [detailedSolution, setDetailedSolution] = useState('');
  const [spokenAudioText, setSpokenAudioText] = useState(scriptText || '');
  const [detectedLanguage, setDetectedLanguage] = useState('te');
  const [speechLangCode, setSpeechLangCode] = useState('te-IN');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showDetailedBox, setShowDetailedBox] = useState(false);

  const synthRef = useRef(null);
  const audioElemRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Synthesis & Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleAskVoiceAssistant(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      stopAudio();
    };
  }, []);

  // Update default audio text when scriptText prop changes
  useEffect(() => {
    if (scriptText && !detailedSolution) {
      setSpokenAudioText(scriptText);
      const detected = detectLanguage(scriptText);
      setDetectedLanguage(detected);
      setSpeechLangCode(getLangSpeechCode(detected));
    }
  }, [scriptText]);

  const stopAudio = () => {
    if (synthRef.current) synthRef.current.cancel();
    if (audioElemRef.current) {
      audioElemRef.current.pause();
      audioElemRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert("Microphone recognition requires Google Chrome or Microsoft Edge.");
        return;
      }
      stopAudio();
      // Listen without restricting language - auto-detects dialect
      recognitionRef.current.lang = 'te-IN';
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // Query Gemini Agronomist & Speak response
  const handleAskVoiceAssistant = async (textToAsk = null) => {
    const query = textToAsk || userQuery;
    if (!query.trim()) return;

    setUserQuery('');
    stopAudio();
    setLoadingAi(true);
    setShowDetailedBox(true);

    try {
      const result = await askGeminiVoiceAdvisor({
        userQuery: query,
        farmContext: {
          farm_name: activeFarm.farm_name,
          land_area_acres: activeFarm.land_area_acres,
          address: activeFarm.address,
          latitude: activeFarm.latitude,
          longitude: activeFarm.longitude,
          soil_type: activeFarm.soil_type,
          crops: plantedCrops
        }
      });

      setDetailedSolution(result.detailed_solution);
      setSpokenAudioText(result.spoken_script);
      setDetectedLanguage(result.detected_lang);
      setSpeechLangCode(result.speechCode);
      setLoadingAi(false);

      // Read out the exact solution aloud in the language spoken!
      speakAloud(result.spoken_script, result.speechCode, result.detected_lang);
    } catch (e) {
      setLoadingAi(false);
      console.error(e);
    }
  };

  // Speak Aloud in detected language
  const speakAloud = (text, speechCode, langCode) => {
    if (!text) return;
    stopAudio();

    if (synthRef.current) {
      try {
        synthRef.current.resume();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechRate;

        const voices = synthRef.current.getVoices();
        const matchingVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === speechCode.toLowerCase())
          || voices.find(v => v.lang.toLowerCase().startsWith(langCode));

        if (matchingVoice) {
          utterance.voice = matchingVoice;
          utterance.lang = matchingVoice.lang;
        } else {
          utterance.lang = speechCode;
        }

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => fallbackAudioStream(text, langCode);

        synthRef.current.speak(utterance);
        return;
      } catch (e) {
        fallbackAudioStream(text, langCode);
      }
    } else {
      fallbackAudioStream(text, langCode);
    }
  };

  const fallbackAudioStream = (text, tl) => {
    try {
      const sanitized = encodeURIComponent(text.slice(0, 190));
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${sanitized}`;
      if (!audioElemRef.current) audioElemRef.current = new Audio();
      audioElemRef.current.src = url;
      audioElemRef.current.onplay = () => setIsPlaying(true);
      audioElemRef.current.onended = () => setIsPlaying(false);
      audioElemRef.current.onerror = () => setIsPlaying(false);
      audioElemRef.current.play().catch(() => setIsPlayingAudio(false));
    } catch (e) {
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      speakAloud(spokenAudioText, speechLangCode, detectedLanguage);
    }
  };

  const handleReplay = () => {
    stopAudio();
    setTimeout(() => {
      speakAloud(spokenAudioText, speechLangCode, detectedLanguage);
    }, 150);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-700/50 flex flex-col gap-3">
      
      {/* Top Bar: Visualizer & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Info */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/50 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Volume2 className={`w-6 h-6 ${isPlaying ? 'text-amber-300 animate-pulse' : 'text-emerald-200'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                AI Multilingual Voice Assistant
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                isPlaying ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-emerald-700 text-emerald-200'
              }`}>
                {isPlaying ? 'Speaking' : 'Voice Ready'}
              </span>
              <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded-full text-emerald-300 border border-emerald-600/50">
                Auto-Detects Telugu, Hindi & English
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-0.5 max-w-xl truncate">
              {spokenAudioText || "Tap 'Speak to AI' or Listen to hear real-time farm climate defense advice."}
            </p>
          </div>
        </div>

        {/* Audio Wave Visualizer */}
        <div className="hidden lg:flex items-center space-x-1 px-4">
          {[40, 70, 30, 90, 50, 80, 45, 60].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-amber-400 animate-pulse' : (isListening ? 'bg-red-400 animate-pulse' : 'bg-emerald-700')
              }`}
              style={{ height: (isPlaying || isListening) ? `${h}%` : '20%', minHeight: '6px' }}
            />
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end flex-wrap">
          
          {/* Microphone Speak Button */}
          <button
            onClick={toggleListening}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-300'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/50'
            }`}
            title="Speak your question in Telugu, Hindi or English"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isListening ? 'Listening...' : 'Speak to AI (మాట్లాడండి)'}</span>
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setSpeechRate(r => r === 0.95 ? 1.1 : 0.95)}
            className="text-xs bg-emerald-800/80 hover:bg-emerald-700 px-2.5 py-2 rounded-xl border border-emerald-600 text-emerald-200 font-medium transition"
          >
            {speechRate}x Speed
          </button>

          {/* Replay */}
          <button
            onClick={handleReplay}
            className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-600 transition"
            title="Restart Audio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Listen / Stop Primary button */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 ring-2 ring-amber-300'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Stop (ఆపు)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen (వినండి)</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Input bar to type questions in any language */}
      <div className="flex gap-2 pt-2 border-t border-emerald-800/60">
        <input
          type="text"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskVoiceAssistant()}
          placeholder="Ask a question in Telugu, Hindi or English (e.g. వరి పంటకు వర్షం వల్ల నష్టమా? or Groundnut root rot)..."
          className="flex-1 bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-300/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          onClick={() => handleAskVoiceAssistant()}
          disabled={!userQuery.trim() || loadingAi}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 disabled:opacity-50"
        >
          {loadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Ask AI</span>
        </button>
      </div>

      {/* Detailed Agronomic Solution Box in Native Language */}
      {showDetailedBox && (
        <div className="mt-2 bg-slate-950/85 border border-emerald-500/50 rounded-xl p-4 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Detailed Agricultural Advisory ({detectedLanguage.toUpperCase()}):
            </span>
            <button
              onClick={() => setShowDetailedBox(false)}
              className="text-[10px] text-slate-400 hover:text-white"
            >
              Hide
            </button>
          </div>

          {loadingAi ? (
            <div className="flex items-center gap-2 text-emerald-300 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Gemini is analyzing your crop, soil, and climate to write a detailed solution...</span>
            </div>
          ) : (
            <div className="whitespace-pre-line text-slate-100 leading-relaxed font-sans">
              {detailedSolution}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
