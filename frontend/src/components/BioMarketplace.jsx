import React, { useState, useEffect } from 'react';
import { ShoppingBag, ExternalLink, ShieldCheck, Bug, Search } from 'lucide-react';

export default function BioMarketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBioPesticides();
  }, []);

  const fetchBioPesticides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/biopesticides');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.recommended_bio_agents);
      } else {
        setProducts(getMockProducts());
      }
    } catch (e) {
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const getMockProducts = () => [
    {
      id: "bio_neem_10000",
      agent_name: "Neem Oil (Azadirachtin 10,000 PPM)",
      category: "Botanical Biopesticide",
      target_pests_diseases: ["Whiteflies", "Aphids", "Jassids", "Leaf Miners", "Thrips"],
      dosage_and_application: "2.0 - 2.5 ml per litre of water. Spray during evening hours.",
      safety_rating: "100% Organic, Safe for Honeybees and Natural Predators",
      commercial_links: [
        { marketplace_name: "BigHaat", product_title: "Neem Gold 10000 PPM (1 Litre)", price_inr: 590, deep_link_url: "https://www.bighaat.com/products/neem-gold-bio-pesticide" },
        { marketplace_name: "AgriBegri", product_title: "EcoNeem 10000 PPM Bio-Protector", price_inr: 540, deep_link_url: "https://agribegri.com/products/econeem-bio-pesticide.php" },
        { marketplace_name: "Amazon India", product_title: "Organic Azadirachtin Concentrate", price_inr: 380, deep_link_url: "https://www.amazon.in/s?k=neem+oil+10000+ppm+agriculture" }
      ]
    },
    {
      id: "bio_trichoderma",
      agent_name: "Trichoderma Viride (Bio-Fungicide 1.5% W.P.)",
      category: "Biological Anti-Fungal Inoculant",
      target_pests_diseases: ["Root Rot (Pythium)", "Collar Rot", "Fusarium Wilt", "Damping-off"],
      dosage_and_application: "Soil drenching: 10g per litre water. Soil application: 2.5 kg mixed with 100 kg compost per acre.",
      safety_rating: "Non-toxic, Builds long-term rhizosphere microbial immunity",
      commercial_links: [
        { marketplace_name: "BigHaat", product_title: "Anand Agro Dr. Bacto's Dermus (1 Kg)", price_inr: 260, deep_link_url: "https://www.bighaat.com/products/trichoderma-viride-bio-fungicide" },
        { marketplace_name: "AgriBegri", product_title: "Sanjeevani Trichoderma Viride", price_inr: 235, deep_link_url: "https://agribegri.com/products/trichoderma-viride-1kg.php" },
        { marketplace_name: "Amazon India", product_title: "Eco-friendly Trichoderma Powder", price_inr: 280, deep_link_url: "https://www.amazon.in/s?k=trichoderma+viride+1kg" }
      ]
    },
    {
      id: "bio_beauveria",
      agent_name: "Beauveria Bassiana (Entomopathogenic Fungi)",
      category: "Bio-Insecticide",
      target_pests_diseases: ["Stem Borer", "Helicoverpa (Pod Borer)", "Fall Armyworm", "Mealybugs"],
      dosage_and_application: "5g per litre of water. Spray when pest larvae are in 1st/2nd instar stage.",
      safety_rating: "Target-specific white muscardine fungus, Zero chemical residues",
      commercial_links: [
        { marketplace_name: "BigHaat", product_title: "Multiplex Baba (1.15% WP) - 1 Kg", price_inr: 310, deep_link_url: "https://www.bighaat.com/products/multiplex-baba-beauveria-bassiana" },
        { marketplace_name: "AgriBegri", product_title: "Utkarsh Beauverite Powder", price_inr: 295, deep_link_url: "https://agribegri.com/products/beauveria-bassiana-1kg.php" }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Eco-Friendly Bio-Pesticide & Bio-Fungicide Linker</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Zero harmful synthetic residues. Certified organic bio-agents with direct purchasing options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((item) => (
          <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500 transition">
            <div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                {item.category}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-2">{item.agent_name}</h4>
              
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <p><strong>Targets:</strong> {item.target_pests_diseases.join(', ')}</p>
                <p className="text-slate-500 text-[11px] pt-1"><strong>Dosage:</strong> {item.dosage_and_application}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-400 font-semibold block mb-2">Purchase Online:</span>
              <div className="flex flex-wrap gap-2">
                {item.commercial_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.deep_link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-white border border-slate-300 hover:border-emerald-600 text-slate-800 text-xs font-bold py-1.5 px-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>{link.marketplace_name}</span>
                    <span className="text-emerald-700 font-bold">₹{link.price_inr}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
