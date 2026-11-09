import React, { useState } from 'react';
import { X, Volume2, ShieldCheck, ShoppingCart, ExternalLink, Clock, Cpu, AlertOctagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function XAIMitigationModal({ assessment, onClose }) {
  const { language } = useAuth();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!assessment) return null;

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = assessment.audio_text_script || assessment.summary_message;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const steps = assessment.translated_mitigation_steps || assessment.mitigation_steps || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">XAI Mitigation & Agricultural Defense</h3>
                <span className="text-xs bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  {assessment.threat_level}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                Crop: <strong className="text-white">{assessment.crop_name}</strong> • Threat: <strong className="text-white">{assessment.threat_type.replace(/_/g, ' ')}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 transition text-emerald-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Vernacular Voice Assistant Trigger */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-emerald-700 animate-bounce" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">వాయిస్ సహాయకుడు (Listen to this Advisory)</h4>
                <p className="text-xs text-emerald-700">Listen in your selected native regional dialect</p>
              </div>
            </div>
            <button
              onClick={handleSpeak}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                isPlayingAudio
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white'
              }`}
            >
              {isPlayingAudio ? 'Pause Voice' : 'Play Voice Alert'}
            </button>
          </div>

          {/* Explainable AI (XAI) Biological Causation */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm mb-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <h4>Agronomic Root Cause (Why this hurts your {assessment.crop_name}):</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
              {assessment.biological_explanation}
            </p>
          </div>

          {/* 3 Step Actionable Mitigation Measures */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" />
              3-Step Time-Critical Action Plan:
            </h4>

            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.step_number} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-500 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Step {step.step_number}: {step.timing_window}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 mt-2">{step.action_title}</h5>
                  <p className="text-xs text-slate-600 mt-1 leading-normal">{step.action_description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Eco-Friendly Bio-Pesticide Linker */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-amber-950 font-bold text-sm mb-2">
              <ShoppingCart className="w-4 h-4 text-amber-700" />
              <h4>Recommended 100% Organic Bio-Fungicide / Bio-Control:</h4>
            </div>
            <p className="text-xs text-amber-800 mb-4">
              Apply biological agents to establish microbial dominance without synthetic chemical runoff.
            </p>

            <div className="bg-white border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md uppercase">
                  100% Organic Inoculant
                </span>
                <h5 className="text-sm font-bold text-slate-900 mt-1">Trichoderma Viride 1.5% W.P.</h5>
                <p className="text-xs text-slate-500">Dose: 10g/L water for root drenching against Pythium / Fusarium</p>
                <p className="text-xs font-bold text-emerald-700 mt-1">Best Price: ~ ₹235 / 1 Kg Pack</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href="https://www.bighaat.com/products/trichoderma-viride-bio-fungicide"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none text-center bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>BigHaat</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://agribegri.com/products/trichoderma-viride-1kg.php"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none text-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>AgriBegri</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onClose();
            }}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Close Advisory
          </button>
        </div>

      </div>
    </div>
  );
}
