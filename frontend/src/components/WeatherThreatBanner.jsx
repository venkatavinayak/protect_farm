import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, CloudRain, Wind, Thermometer, ChevronRight, Sliders } from 'lucide-react';

export default function WeatherThreatBanner({ threatReport, onSelectCropForXAI, onSimulateWeather }) {
  const [showSimControls, setShowSimControls] = useState(false);
  const [simRain, setSimRain] = useState(38.5);
  const [simWind, setSimWind] = useState(42.0);

  if (!threatReport) return null;

  const { forecast_24h_rainfall_mm, max_wind_speed_kmh, weather_condition, crop_assessments } = threatReport;

  const handleSimSubmit = (e) => {
    e.preventDefault();
    onSimulateWeather(simRain, simWind);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Weather Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur">
            <CloudRain className="w-7 h-7 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Micro-Climate Threat Monitor</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-medium">
                Live Radar
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Forecast: <strong>{weather_condition}</strong> • 24h Rainfall: <strong className="text-sky-300">{forecast_24h_rainfall_mm} mm</strong> • Wind Gusts: <strong className="text-amber-300">{max_wind_speed_kmh} km/h</strong>
            </p>
          </div>
        </div>

        {/* Weather simulation button */}
        <button
          onClick={() => setShowSimControls(!showSimControls)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 transition rounded-xl text-xs font-medium border border-white/20 text-slate-200"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showSimControls ? 'Close Simulator' : 'Test Weather Scenarios'}</span>
        </button>

      </div>

      {/* Simulator Drawer */}
      {showSimControls && (
        <form onSubmit={handleSimSubmit} className="bg-slate-100 p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Simulate 24h Rainfall (mm):</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={simRain}
                onChange={(e) => setSimRain(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="font-mono font-bold w-12 text-slate-800">{simRain} mm</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Simulate Wind Gusts (km/h):</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={simWind}
                onChange={(e) => setSimWind(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="font-mono font-bold w-12 text-slate-800">{simWind} km/h</span>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl transition shadow-sm"
            >
              Apply Weather Simulation
            </button>
          </div>
        </form>
      )}

      {/* Crop Differential Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {crop_assessments.map((assessment) => {
          const isBeneficial = assessment.threat_level === 'BENEFICIAL';
          const isCritical = assessment.threat_level === 'CRITICAL';
          const isWarning = assessment.threat_level === 'WARNING';

          return (
            <div
              key={assessment.crop_id || assessment.crop_name}
              className={`rounded-xl p-4 border transition-all ${
                isBeneficial
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : isCritical
                  ? 'bg-rose-50 border-rose-300 shadow-sm'
                  : isWarning
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{assessment.crop_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white border font-medium text-slate-600">
                      Stage: {assessment.growth_stage}
                    </span>
                  </div>

                  {/* Badge */}
                  <div className="mt-2 flex items-center gap-1.5">
                    {isBeneficial ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        BENEFICIAL / SAFE
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-xs ${
                        isCritical ? 'bg-rose-600' : 'bg-amber-600'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {assessment.threat_level}: {assessment.threat_type.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onSelectCropForXAI(assessment)}
                  className="flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs hover:border-emerald-500 transition"
                >
                  <span>XAI Mitigation</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Vernacular and English Explanation */}
              <div className="mt-3 text-xs text-slate-700 bg-white/70 rounded-lg p-2.5 border border-slate-200/60">
                <p className="font-semibold text-slate-900 mb-1">
                  {assessment.translated_summary || assessment.summary_message}
                </p>
                <p className="text-slate-600 line-clamp-2">
                  {assessment.biological_explanation}
                </p>
              </div>

              {/* 1st Mitigation Step Preview */}
              {assessment.mitigation_steps && assessment.mitigation_steps.length > 0 && (
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-medium text-emerald-800 truncate mr-2">
                    ⚡ Priority: {assessment.mitigation_steps[0].action_title}
                  </span>
                  <span className="text-slate-500 whitespace-nowrap">
                    ({assessment.mitigation_steps[0].timing_window})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
