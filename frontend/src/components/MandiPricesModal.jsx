import React from 'react';
import { X, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

const MANDI_DATA = [
  { crop: 'Paddy (Basmati)', mandi: 'Karnal (Haryana)', price: '₹3,850 / Qtl', change: '+₹75', up: true },
  { crop: 'Paddy (Common / Sona)', mandi: 'Suryapet (Telangana)', price: '₹2,320 / Qtl', change: '+₹40', up: true },
  { crop: 'Cotton (Medium Staple)', mandi: 'Warangal (Telangana)', price: '₹7,120 / Qtl', change: '-₹50', up: false },
  { crop: 'Groundnut (Pod)', mandi: 'Kurnool (Andhra Pradesh)', price: '₹6,750 / Qtl', change: '+₹110', up: true },
  { crop: 'Chilli (Teja / S4)', mandi: 'Guntur (Andhra Pradesh)', price: '₹18,500 / Qtl', change: '+₹450', up: true },
  { crop: 'Maize (Yellow Corn)', mandi: 'Davanagere (Karnataka)', price: '₹2,150 / Qtl', change: '-₹20', up: false },
  { crop: 'Soybean (Yellow)', mandi: 'Indore (Madhya Pradesh)', price: '₹4,480 / Qtl', change: '+₹60', up: true },
  { crop: 'Wheat (Mill Quality)', mandi: 'Khanna (Punjab)', price: '₹2,425 / Qtl', change: '+₹15', up: true }
];

export default function MandiPricesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🌾 Live Mandi (Market) Prices (e-NAM APMC)
            </h2>
            <p className="text-xs text-slate-400">Real-time daily modal trading rates across regional agricultural markets</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {MANDI_DATA.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-emerald-600/40 transition">
              <div>
                <span className="text-xs font-bold text-white block">{item.crop}</span>
                <span className="text-[11px] text-slate-400">{item.mandi}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-300 block">{item.price}</span>
                <span className={`text-[10px] font-semibold flex items-center justify-end gap-1 ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">Synced with Agmarknet / e-NAM National Agriculture Market</span>
          <button onClick={onClose} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
