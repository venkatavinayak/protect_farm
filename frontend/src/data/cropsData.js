// Exhaustive Indian Agricultural Crops & Certified Seed Varieties Database

export const ALL_CROPS = [
  // CEREALS & MILLETS
  {
    id: 'paddy',
    name: 'Paddy (Rice)',
    telugu: 'వరి',
    hindi: 'धान / चावल',
    tamil: 'நெல்',
    kannada: 'ಭತ್ತ',
    category: 'wetland',
    waterRequirement: 'High (Flooded / Wetland)',
    season: 'Kharif / Rabi',
    varieties: [
      'BPT 5204 (Samba Mahsuri)',
      'MTU 1010 (Cottondora Sannalu)',
      'MTU 1061 (Indra)',
      'MTU 7029 (Swarna)',
      'RNR 15048 (Telangana Sona - Low GI)',
      'IR 64',
      'Pusa Basmati 1121',
      'Pusa Basmati 1509',
      'Pusa Basmati 1718',
      'NLR 34449 (Nellore Mahsuri)',
      'CR Dhan 310 (High Protein)',
      'Jaya',
      'PR 126',
      'Co 51',
      'ADT 37',
      'Masuri'
    ]
  },
  {
    id: 'wheat',
    name: 'Wheat',
    telugu: 'గోధుమ',
    hindi: 'गेहूं',
    tamil: 'கோதுமை',
    kannada: 'ಗೋಧಿ',
    category: 'semi_arid',
    waterRequirement: 'Moderate',
    season: 'Rabi',
    varieties: [
      'HD 2967',
      'HD 3086 (Pusa Gautami)',
      'PBW 343',
      'PBW 550',
      'DBW 187 (Karan Vandana)',
      'DBW 222 (Karan Narendra)',
      'GW 322',
      'GW 496',
      'Sharbati (C-306)',
      'Lok-1',
      'HI 1544 (Purna)',
      'WH 1105',
      'Raj 4037',
      'Unnat PBW 343'
    ]
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    telugu: 'మొక్కజొన్న',
    hindi: 'मक्का',
    tamil: 'மக்காச்சோளம்',
    kannada: 'ಮೆಕ್ಕೆಜೋಳ',
    category: 'semi_arid',
    waterRequirement: 'Moderate (Waterlogging Sensitive)',
    season: 'Kharif / Rabi',
    varieties: [
      'DHM 117',
      'DHM 121',
      'Pioneer 3396',
      'Pioneer P3501',
      'DKC 9108 (Monsanto/Bayer)',
      'Dekalb 9120',
      'Syngenta NK6240',
      'Syngenta NK30',
      'Bio 9681',
      'Bio 9637',
      'Ganga 11',
      'African Tall (Fodder)',
      'HQPM 1 (Quality Protein)',
      'PMH 1'
    ]
  },
  {
    id: 'jowar',
    name: 'Jowar (Sorghum)',
    telugu: 'జొన్న',
    hindi: 'ज्वार',
    tamil: 'சோளம்',
    kannada: 'ಜೋಳ',
    category: 'arid_pulse',
    waterRequirement: 'Low (Drought Tolerant)',
    season: 'Kharif / Rabi',
    varieties: [
      'CSH 16',
      'CSH 25',
      'CSH 14',
      'Maldandi (M 35-1)',
      'CSV 20',
      'CSV 27',
      'Parbhani Moti',
      'Phule Vasudha'
    ]
  },
  {
    id: 'bajra',
    name: 'Bajra (Pearl Millet)',
    telugu: 'సజ్జలు',
    hindi: 'बाजरा',
    tamil: 'கம்பு',
    kannada: 'ಸಜ್ಜೆ',
    category: 'arid_pulse',
    waterRequirement: 'Very Low (Arid Dryland)',
    season: 'Kharif',
    varieties: [
      'HHB 67 Improved',
      'Pioneer 86M88',
      'Pioneer 86M38',
      'GHB 558',
      'Proagro 9444',
      'Kaveri Super Boss',
      'RHB 177',
      'Nandi 65'
    ]
  },
  {
    id: 'ragi',
    name: 'Ragi (Finger Millet)',
    telugu: 'రాగులు',
    hindi: 'रागी / मडुआ',
    tamil: 'கேழ்வரகு',
    kannada: 'ರಾಗಿ',
    category: 'arid_pulse',
    waterRequirement: 'Low',
    season: 'Kharif',
    varieties: [
      'GPU 28',
      'GPU 48',
      'ML 365',
      'Indaf 8',
      'KMR 301',
      'PR 202',
      'Vakula'
    ]
  },

  // PULSES & OILSEEDS
  {
    id: 'groundnut',
    name: 'Groundnut (Peanut)',
    telugu: 'వేరుశనగ',
    hindi: 'मूंगफली',
    tamil: 'வேர்க்கடலை',
    kannada: 'ಕಡಲೆಕಾಯಿ',
    category: 'arid_pulse',
    waterRequirement: 'Low (Severe Hypoxia & Root Rot Risk under Rain)',
    season: 'Kharif / Rabi',
    varieties: [
      'Kadiri-6 (K-6)',
      'Kadiri-9',
      'Kadiri Harithandhra',
      'TMV-2',
      'TAG-24',
      'JL-24 (Phule Pragati)',
      'Dharani (TCGS 1043)',
      'GJG-32',
      'TG 37A',
      'Abhaya',
      'Narayani',
      'GG-20'
    ]
  },
  {
    id: 'chickpea',
    name: 'Chickpea / Bengal Gram (Chana)',
    telugu: 'శనగలు',
    hindi: 'चना',
    tamil: 'கொண்டைக்கடலை',
    kannada: 'ಕಡಲೆ',
    category: 'arid_pulse',
    waterRequirement: 'Low',
    season: 'Rabi',
    varieties: [
      'JG 11',
      'JAKI 9218',
      'KAK 2 (Kabuli)',
      'Pusa 372',
      'Vijay',
      'Digvijay',
      'MNK 1',
      'NBeG 3',
      'JG 14 (Heat Tolerant)'
    ]
  },
  {
    id: 'redgram',
    name: 'Red Gram / Pigeonpea (Toor Dal)',
    telugu: 'కందులు',
    hindi: 'अरहर / तूर दाल',
    tamil: 'துவரம்பருப்பு',
    kannada: 'ತೊಗರಿ',
    category: 'semi_arid',
    waterRequirement: 'Low to Moderate',
    season: 'Kharif',
    varieties: [
      'Asha (ICPL 87119)',
      'Maruthi (ICP 8863)',
      'TS 3R',
      'PRG 176',
      'BDN 711',
      'BSMR 736',
      'UPAS 120',
      'WRG 65'
    ]
  },
  {
    id: 'blackgram',
    name: 'Black Gram (Urad Dal)',
    telugu: 'మినుములు',
    hindi: 'उड़द',
    tamil: 'உளுந்து',
    kannada: 'ಉದ್ದು',
    category: 'arid_pulse',
    waterRequirement: 'Low',
    season: 'Kharif / Rabi',
    varieties: [
      'PU 31',
      'LBG 752',
      'LBG 623',
      'T9',
      'Shekhar 2',
      'VBN 8',
      'TBG 104',
      'MASH 114'
    ]
  },
  {
    id: 'greengram',
    name: 'Green Gram (Moong Dal)',
    telugu: 'పెసలు',
    hindi: 'मूंग',
    tamil: 'பாசிப்பயறு',
    kannada: 'ಹೆಸರುಕಾಳು',
    category: 'arid_pulse',
    waterRequirement: 'Low',
    season: 'Kharif / Summer',
    varieties: [
      'IPM 02-3',
      'Virat',
      'Shikha',
      'Shinning Moong',
      'ML 818',
      'Samrat',
      'WGG 42',
      'MH 421'
    ]
  },
  {
    id: 'soybean',
    name: 'Soybean',
    telugu: 'సోయాబీన్',
    hindi: 'सोयाबीन',
    tamil: 'சோயாபீன்ஸ்',
    kannada: 'ಸೋಯಾಬೀನ್',
    category: 'semi_arid',
    waterRequirement: 'Moderate',
    season: 'Kharif',
    varieties: [
      'JS 335',
      'JS 95-60',
      'JS 20-34',
      'JS 20-29',
      'NRC 37',
      'NRC 86',
      'RKS 18',
      'MACS 1407'
    ]
  },
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed',
    telugu: 'ఆవాలు',
    hindi: 'सरसों / राई',
    tamil: 'கடுகு',
    kannada: 'ಸಾಸಿವೆ',
    category: 'semi_arid',
    waterRequirement: 'Low',
    season: 'Rabi',
    varieties: [
      'Pusa Bold',
      'Varuna (T-59)',
      'Kranti',
      'RH 749',
      'RH 0749',
      'Pioneer 45S46',
      'Pioneer 45S42',
      'Giriraj (DRMRIJ-31)',
      'NRCHB 101'
    ]
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    telugu: 'పొద్దుతిరుగుడు',
    hindi: 'सूरजमुखी',
    tamil: 'சூரியகாந்தி',
    kannada: 'ಸೂರ್ಯಕಾಂತಿ',
    category: 'semi_arid',
    waterRequirement: 'Moderate',
    season: 'Kharif / Rabi',
    varieties: [
      'KBSH 44',
      'KBSH 53',
      'DRSH 1',
      'Sunbred 275',
      'PAC 36',
      'Syngenta NK 278',
      'RSFH 130'
    ]
  },

  // CASH & COMMERCIAL CROPS
  {
    id: 'cotton',
    name: 'Cotton',
    telugu: 'పత్తి',
    hindi: 'कपास',
    tamil: 'பருத்தி',
    kannada: 'ಹತ್ತಿ',
    category: 'semi_arid',
    waterRequirement: 'Moderate (Waterlogging causes Boll Shedding)',
    season: 'Kharif',
    varieties: [
      'Bt Cotton (Bollgard II)',
      'RCH 659 BG II',
      'Mallika BG II',
      'Bunny Bt',
      'Jaadoo BG II',
      'Ankur 3028',
      'DCH 32',
      'Bhakti BG II',
      'First Class BG II',
      'Ajeet 155'
    ]
  },
  {
    id: 'chilli',
    name: 'Chilli (Hot Pepper)',
    telugu: 'మిరప',
    hindi: 'मिर्च',
    tamil: 'மிளகாய்',
    kannada: 'ಮೆಣಸಿನಕಾಯಿ',
    category: 'cash_crop',
    waterRequirement: 'Moderate',
    season: 'Kharif / Rabi',
    varieties: [
      'Guntur Sannam (S4)',
      'Teja (S17)',
      'Byadgi Dabbi',
      'Byadgi Kaddi',
      'Armoor',
      'Wonder Hot',
      'Devanur Deluxe',
      'US 341',
      'Indam 5 (Indo-American)',
      'Syngenta Hot Pepper HPH 5531'
    ]
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    telugu: 'చెరకు',
    hindi: 'गन्ना',
    tamil: 'கரும்பு',
    kannada: 'ಕಬ್ಬು',
    category: 'wetland',
    waterRequirement: 'High',
    season: 'Annual',
    varieties: [
      'Co 0238 (Karan 4)',
      'Co 86032 (Nayana)',
      'CoM 0265 (Phule 265)',
      'Co 0118',
      'CoLk 94184',
      'Co 99004',
      'Co 8371'
    ]
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    telugu: 'పసుపు',
    hindi: 'हल्दी',
    tamil: 'மஞ்சள்',
    kannada: 'ಅರಿಶಿನ',
    category: 'cash_crop',
    waterRequirement: 'Moderate (Prone to Rhizome Rot)',
    season: 'Kharif',
    varieties: [
      'Duggirala',
      'Salem',
      'Pragati (IISR)',
      'Rajapore',
      'Alleppey Supreme',
      'Prathibha',
      'Tekurpet'
    ]
  },

  // VEGETABLES & HORTICULTURE
  {
    id: 'tomato',
    name: 'Tomato',
    telugu: 'టమాటా',
    hindi: 'टमाटर',
    tamil: 'தக்காளி',
    kannada: 'ಟೊಮೆಟೊ',
    category: 'horticulture',
    waterRequirement: 'Moderate',
    season: 'All Year',
    varieties: [
      'Arka Rakshak (Triple Disease Resistant)',
      'Arka Samrat',
      'US 440',
      'Abhinav (Syngenta)',
      'Saaho (Syngenta)',
      'NS 501 (Namdhari)',
      'Shivam (Seminis)',
      'Pusa Ruby',
      'Heemsohna'
    ]
  },
  {
    id: 'onion',
    name: 'Onion',
    telugu: 'ఉల్లిపాయ',
    hindi: 'प्याज',
    tamil: 'வெங்காயம்',
    kannada: 'ಈರುಳ್ಳಿ',
    category: 'horticulture',
    waterRequirement: 'Moderate (Bulb Rot Risk)',
    season: 'Kharif / Rabi',
    varieties: [
      'Bhima Super',
      'Bhima Red',
      'Bhima Shakti',
      'Agri Found Dark Red (AFDR)',
      'Pusa Red',
      'Bellary Red',
      'Nashik Red'
    ]
  },
  {
    id: 'potato',
    name: 'Potato',
    telugu: 'బంగాళాదుంప',
    hindi: 'आलू',
    tamil: 'உருளைக்கிழங்கு',
    kannada: 'ಆಲೂಗಡ್ಡೆ',
    category: 'horticulture',
    waterRequirement: 'Moderate',
    season: 'Rabi',
    varieties: [
      'Kufri Jyoti',
      'Kufri Pukhraj',
      'Kufri Chipsona 1',
      'Kufri Chipsona 3',
      'Kufri Bahar',
      'Kufri Surya (Heat Tolerant)',
      'Kufri Sindhuri'
    ]
  },
  {
    id: 'okra',
    name: 'Okra (Ladyfinger / Bhendi)',
    telugu: 'బెండకాయ',
    hindi: 'भिंडी',
    tamil: 'வெண்டைக்காய்',
    kannada: 'ಬೆಂಡೆಕಾಯಿ',
    category: 'horticulture',
    waterRequirement: 'Moderate',
    season: 'Kharif / Summer',
    varieties: [
      'Radhika (Advanta)',
      'Syngenta 102',
      'Parbhani Kranti',
      'Arka Anamika',
      'Mahyco MH-10',
      'Pusa A4'
    ]
  }
];

export const SOIL_CLASSIFICATIONS = [
  'Deep Black Cotton Soil (Vertisol - High Moisture Retention, Low Drainage)',
  'Red Sandy Loam (Alfisol - Free Draining, Porous)',
  'Clay Loam Soil (Balanced Infiltration)',
  'Alluvial River Silt Soil (High Natural Fertility)',
  'Laterite Red Soil (Acidic, Rapid Runoff)'
];

export const IRRIGATION_SYSTEMS = [
  'Borewell / Tube-well Electric Motor',
  'Canal Gravity Inundation',
  'Monsoon Rainfed (Strictly Dependent on Rainfall)',
  'Drip / Micro-Fertigation System',
  'Sprinkler System'
];
