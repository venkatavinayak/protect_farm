import React from 'react';
import { X, ExternalLink, CheckCircle2 } from 'lucide-react';

const SCHEMES = [
  {
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    benefit: '₹6,000 / year direct benefit transfer (3 installments of ₹2,000)',
    eligibility: 'All landholding farmer families across India',
    link: 'https://pmkisan.gov.in'
  },
  {
    title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    benefit: 'Comprehensive crop insurance covering cyclone, flood, and pest failure at 1.5% - 2% premium',
    eligibility: 'Farmers cultivating notified crops in notified areas',
    link: 'https://pmfby.gov.in'
  },
  {
    title: 'PM-KUSUM (Solar Agricultural Pumps)',
    benefit: 'Up to 60% government subsidy to install stand-alone solar irrigation tube-well pumps',
    eligibility: 'Individual farmers, cooperatives, panchayats',
    link: 'https://pmkusum.mnre.gov.in'
  },
  {
    title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    benefit: '40% - 50% financial subsidy on tractors, rotavators, power tillers, and laser levelers',
    eligibility: 'Small and marginal farmers with land ownership records',
    link: 'https://agrimachinery.nic.in'
  },
  {
    title: 'Soil Health Card Scheme',
    benefit: 'Free 12-parameter soil testing (N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) and crop nutrient dosage recommendations',
    eligibility: 'All farmers across Indian districts',
    link: 'https://soilhealth.dac.gov.in'
  }
];

export default function GovernmentSubsidiesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🏛️ Indian Government Farmer Subsidies & Welfare Schemes
            </h2>
            <p className="text-xs text-slate-400">Direct links and eligibility criteria for central & state agricultural aid</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {SCHEMES.map((scheme, idx) => (
            <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-emerald-600/40 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs font-bold text-emerald-300 block">{scheme.title}</span>
                  <p className="text-xs text-slate-200 mt-1 font-medium">{scheme.benefit}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">🎯 Eligibility: {scheme.eligibility}</span>
                </div>
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1 flex-shrink-0 transition"
                >
                  <span>Apply</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
