import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, Mic, MicOff, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VOICE_LANG_MAP = {
  te: { code: 'te-IN', googleTl: 'te', label: 'తెలుగు వాయిస్ అసిస్టెంట్', listenLabel: 'వినండి (Listen)', stopLabel: 'ఆపు (Stop)' },
  hi: { code: 'hi-IN', googleTl: 'hi', label: 'हिन्दी वॉइस सहायक', listenLabel: 'सुनिए (Listen)', stopLabel: 'रोकें (Stop)' },
  ta: { code: 'ta-IN', googleTl: 'ta', label: 'தமிழ் குரல் உதவியாளர்', listenLabel: 'கேளுங்கள் (Listen)', stopLabel: 'நிறுத்து (Stop)' },
  kn: { code: 'kn-IN', googleTl: 'kn', label: 'ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯಕ', listenLabel: 'ಕೇಳಿ (Listen)', stopLabel: 'ನಿಲ್ಲಿಸಿ (Stop)' },
  mr: { code: 'mr-IN', googleTl: 'mr', label: 'मराठी आवाज सहाय्यक', listenLabel: 'ऐका (Listen)', stopLabel: 'थांबवा (Stop)' },
  en: { code: 'en-IN', googleTl: 'en', label: 'English Voice Assistant', listenLabel: 'Listen Audio', stopLabel: 'Stop Audio' }
};

export default function VoiceAssistantBar({ scriptText, currentThreat }) {
  const { language, activeFarm, plantedCrops } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [audioSource, setAudioSource] = useState(null); // 'synth' or 'audio'
  
  const synthRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Synthesis and populate voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Initialize Web Speech Recognition if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQuery(transcript);
        setIsListening(false);
        handleFarmerVoiceQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // Stop playback if scriptText or language changes
  useEffect(() => {
    stopAllAudio();
  }, [scriptText, language]);

  // Answer a farmer query and speak the response
  const handleFarmerVoiceQuery = (query) => {
    let responseText = "";
    const lower = query.toLowerCase();

    if (language === 'te') {
      if (lower.includes('వరి') || lower.includes('paddy') || lower.includes('వర్షం') || lower.includes('rain')) {
        responseText = "వరి పంటకు ప్రస్తుతం వర్షపాతం చాలా ఉపయోగకరం. బోర్ మోటార్లు ఆపివేయండి. డ్రైనేజీ అవసరం లేదు.";
      } else if (lower.includes('వేరుశనగ') || lower.includes('groundnut')) {
        responseText = "వేరుశనగ పంటకు నీరు నిల్వ ఉంటే వేరుకుళ్ళు వస్తుంది. పొలం చుట్టూ 25 సెం.మీ కాలువలు తవ్వి నీటిని వెంటనే బయటకు పంపండి.";
      } else {
        responseText = `మీ ప్రశ్న: ${query}. రక్షణ ఫారమ్ సలహా: పంటలను పరిశీలించి ట్రైకోడెర్మా విరిడి చల్లండి.`;
      }
    } else {
      if (lower.includes('paddy') || lower.includes('rain')) {
        responseText = "Current rainfall is beneficial for Paddy. Turn off tube-wells and impound water at 3-5 cm depth.";
      } else if (lower.includes('groundnut') || lower.includes('rot')) {
        responseText = "Warning: Excess rain causes root rot in Groundnut. Excavate 25 cm perimeter drainage trenches immediately.";
      } else {
        responseText = `Advisory for "${query}": Monitor crop foliage and apply organic bio-pesticides if pests appear.`;
      }
    }

    setAiAnswer(responseText);
    speakText(responseText);
  };

  // Robust Text-to-Speech function
  const speakText = (text) => {
    if (!text) return;
    stopAllAudio();

    const targetConfig = VOICE_LANG_MAP[language] || VOICE_LANG_MAP.en;

    // First try: Web Speech Synthesis API
    if (synthRef.current) {
      try {
        synthRef.current.resume(); // Unstick Chromium audio engine
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechRate;
        utterance.pitch = 1.0;

        // Try to match voice
        const availableVoices = synthRef.current.getVoices();
        const exactVoice = availableVoices.find(v => v.lang.toLowerCase().replace('_', '-') === targetConfig.code.toLowerCase());
        const langVoice = availableVoices.find(v => v.lang.toLowerCase().startsWith(language));
        const indianVoice = availableVoices.find(v => v.lang.toLowerCase().includes('in'));
        
        const chosenVoice = exactVoice || langVoice || indianVoice || availableVoices[0];

        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang;
        } else {
          utterance.lang = targetConfig.code;
        }

        utterance.onstart = () => {
          setIsPlaying(true);
          setAudioSource('synth');
        };

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = (e) => {
          // If browser synth fails (e.g. language-unavailable on Windows), fallback to audio stream
          fallbackToAudioStream(text, targetConfig.googleTl);
        };

        // Chromium bug prevention: keep reference to utterance
        window._activeUtterance = utterance;
        synthRef.current.speak(utterance);
        return;
      } catch (err) {
        fallbackToAudioStream(text, targetConfig.googleTl);
      }
    } else {
      fallbackToAudioStream(text, targetConfig.googleTl);
    }
  };

  // Fallback to high-quality audio stream for regional languages (Telugu, Hindi, Tamil, etc.)
  const fallbackToAudioStream = (text, tl) => {
    try {
      const sanitized = encodeURIComponent(text.slice(0, 190));
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${sanitized}`;
      
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = speechRate;
      
      audioRef.current.onplay = () => {
        setIsPlaying(true);
        setAudioSource('audio');
      };
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      audioRef.current.onerror = () => {
        setIsPlaying(false);
      };

      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } catch (e) {
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllAudio();
    } else {
      const textToPlay = aiAnswer || scriptText;
      speakText(textToPlay);
    }
  };

  const handleReplay = () => {
    stopAllAudio();
    setTimeout(() => {
      const textToPlay = aiAnswer || scriptText;
      speakText(textToPlay);
    }, 150);
  };

  // Start Voice Recognition (Microphone)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
        return;
      }
      stopAllAudio();
      const targetConfig = VOICE_LANG_MAP[language] || VOICE_LANG_MAP.en;
      recognitionRef.current.lang = targetConfig.code;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const langConfig = VOICE_LANG_MAP[language] || VOICE_LANG_MAP.en;
  const activeScript = aiAnswer || scriptText;

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-700/50 flex flex-col gap-3">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Indicator & Title */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/50 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Volume2 className={`w-6 h-6 ${isPlaying ? 'text-amber-300 animate-pulse' : 'text-emerald-200'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {langConfig.label}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                isPlaying ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-emerald-800 text-emerald-200'
              }`}>
                {isPlaying ? 'Speaking Now' : 'Voice Ready'}
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-0.5 max-w-xl truncate">
              {activeScript || "No active threat. Weather conditions are safe for your planted crops."}
            </p>
          </div>
        </div>

        {/* Audio Wave Visualizer */}
        <div className="hidden lg:flex items-center space-x-1 px-4">
          {[40, 70, 30, 90, 50, 80, 45, 60].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-emerald-700/60'
              }`}
              style={{ height: isPlaying ? `${h}%` : '20%', minHeight: '6px' }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end flex-wrap">
          
          {/* Microphone Voice Input */}
          <button
            onClick={toggleListening}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-300'
                : 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600'
            }`}
            title="Ask Voice Assistant with Microphone"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isListening ? 'Listening...' : 'Talk to AI'}</span>
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setSpeechRate(r => r === 1.0 ? 0.85 : 1.0)}
            className="text-xs bg-emerald-800/80 hover:bg-emerald-700 px-2.5 py-2 rounded-xl border border-emerald-600 text-emerald-200 font-medium transition"
            title="Adjust Speech Speed"
          >
            {speechRate}x Speed
          </button>

          {/* Replay */}
          <button
            onClick={handleReplay}
            className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-600 transition"
            title="Replay Audio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 ring-2 ring-amber-300'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{langConfig.stopLabel}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{langConfig.listenLabel}</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Voice Query / AI Answer transcript bar if active */}
      {(voiceQuery || aiAnswer) && (
        <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-xl p-3 text-xs flex flex-col gap-1.5 animate-fadeIn">
          {voiceQuery && (
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="font-semibold text-emerald-400">🎙️ You asked:</span>
              <span>"{voiceQuery}"</span>
            </div>
          )}
          {aiAnswer && (
            <div className="flex items-start gap-2 text-emerald-100">
              <span className="font-semibold text-amber-300 flex-shrink-0">🌾 Advisory:</span>
              <span>{aiAnswer}</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
