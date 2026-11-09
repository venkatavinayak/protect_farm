import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [farmer, setFarmer] = useState({
    id: 1,
    clerk_user_id: "user_clerk_dev_farmer_123",
    full_name: "Ramu Kisan",
    email: "farmer.ramu@protectfarm.org",
    phone_number: "+91 98480 22334",
    preferred_language: "te" // Default Telugu
  });

  const [activeFarm, setActiveFarm] = useState({
    id: 1,
    farm_name: "Sangareddy Field Parcel #4",
    address: "Kandi Village, Sangareddy District, Telangana, 502285",
    latitude: 17.6192,
    longitude: 78.0818,
    land_area_acres: 4.2,
    soil_type: "Deep Black Cotton Soil (Vertisol)"
  });

  const [plantedCrops, setPlantedCrops] = useState([
    {
      id: 1,
      farm_id: 1,
      crop_name: "Paddy",
      crop_category: "wetland",
      variety: "BPT 5204 (Samba Mahsuri)",
      sowing_date: "2026-08-15",
      growth_stage: "Tillering",
      is_active: true
    },
    {
      id: 2,
      farm_id: 1,
      crop_name: "Groundnut",
      crop_category: "arid_pulse",
      variety: "Kadiri-6 (K-6)",
      sowing_date: "2026-09-01",
      growth_stage: "Flowering",
      is_active: true
    }
  ]);

  const [language, setLanguage] = useState("te");

  // Sync language with farmer preference
  const updateLanguage = (newLang) => {
    setLanguage(newLang);
    setFarmer(prev => ({ ...prev, preferred_language: newLang }));
  };

  const addCrop = (cropData) => {
    const newCrop = {
      ...cropData,
      id: Date.now(),
      farm_id: activeFarm.id,
      is_active: true
    };
    setPlantedCrops(prev => [...prev, newCrop]);
  };

  const updateFarmLocation = (coords, areaAcres, geojson) => {
    setActiveFarm(prev => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
      land_area_acres: areaAcres || prev.land_area_acres,
      boundary_geojson: geojson
    }));
  };

  return (
    <AuthContext.Provider value={{
      farmer,
      activeFarm,
      plantedCrops,
      language,
      updateLanguage,
      addCrop,
      updateFarmLocation,
      setFarmer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
