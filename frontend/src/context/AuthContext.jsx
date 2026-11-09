import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [farmer, setFarmer] = useState({
    id: "guest",
    clerk_user_id: null,
    full_name: "Guest Farmer",
    email: "",
    avatar_url: null,
    phone_number: "",
    preferred_language: "te", // Default Telugu
    is_authenticated: false
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

  // Sync real-time Clerk user into state when authenticated via Google / Clerk
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const displayName = user.fullName || user.firstName || (user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress.split('@')[0] : "Farmer");
      
      setFarmer({
        id: user.id,
        clerk_user_id: user.id,
        full_name: displayName,
        email: user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : "",
        avatar_url: user.imageUrl,
        phone_number: user.primaryPhoneNumber ? user.primaryPhoneNumber.phoneNumber : "",
        preferred_language: language,
        is_authenticated: true
      });

      setActiveFarm(prev => ({
        ...prev,
        farm_name: `${user.firstName || displayName}'s Farmland`
      }));
    } else if (isLoaded && !isSignedIn) {
      setFarmer(prev => ({
        ...prev,
        id: "guest",
        clerk_user_id: null,
        full_name: "Guest Farmer",
        email: "",
        avatar_url: null,
        is_authenticated: false
      }));
    }
  }, [isLoaded, isSignedIn, user]);

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

  const updateFarmLocation = (coords, areaAcres, geojson, address = null) => {
    setActiveFarm(prev => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
      land_area_acres: areaAcres || prev.land_area_acres,
      boundary_geojson: geojson || prev.boundary_geojson,
      address: address || prev.address
    }));
  };

  return (
    <AuthContext.Provider value={{
      farmer,
      activeFarm,
      plantedCrops,
      language,
      isLoaded,
      isSignedIn,
      updateLanguage,
      addCrop,
      updateFarmLocation,
      setFarmer,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
