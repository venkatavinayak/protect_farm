import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const [farmer, setFarmer] = useState({
    id: "guest",
    clerk_user_id: null,
    full_name: "",
    email: "",
    avatar_url: null,
    phone_number: "",
    preferred_language: "te",
    is_authenticated: false
  });

  const [activeFarm, setActiveFarm] = useState({
    id: 1,
    farm_name: "My Farmland Parcel",
    address: "Kandi Village, Sangareddy, Telangana",
    latitude: 17.6192,
    longitude: 78.0818,
    land_area_acres: 3.5,
    soil_type: "Deep Black Cotton Soil (Vertisol)",
    irrigation: "Borewell / Tube-well Motor"
  });

  const [plantedCrops, setPlantedCrops] = useState([]);
  const [language, setLanguage] = useState("te");

  // Sync Clerk authenticated user & check saved profile
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const displayName = user.fullName || user.firstName || (user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress.split('@')[0] : "Farmer");
      
      const currentFarmer = {
        id: user.id,
        clerk_user_id: user.id,
        full_name: displayName,
        email: user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : "",
        avatar_url: user.imageUrl,
        phone_number: user.primaryPhoneNumber ? user.primaryPhoneNumber.phoneNumber : "",
        preferred_language: language,
        is_authenticated: true
      };

      setFarmer(currentFarmer);

      // Check if user has previously completed onboarding
      const savedCompleted = localStorage.getItem(`protectfarm_setup_completed_${user.id}`);
      const savedProfileRaw = localStorage.getItem(`protectfarm_profile_${user.id}`);

      if (savedCompleted === 'true' && savedProfileRaw) {
        try {
          const profile = JSON.parse(savedProfileRaw);
          if (profile.farmerName) {
            setFarmer(prev => ({ ...prev, full_name: profile.farmerName, phone_number: profile.phone || prev.phone_number }));
          }
          if (profile.language) {
            setLanguage(profile.language);
          }
          if (profile.farm) {
            setActiveFarm({
              id: 1,
              farm_name: `${profile.farmerName || displayName}'s Farmland`,
              address: profile.farm.address || "Field Parcel",
              latitude: profile.farm.latitude || 17.6192,
              longitude: profile.farm.longitude || 78.0818,
              land_area_acres: profile.farm.land_area_acres || 3.5,
              soil_type: profile.farm.soil_type || "Deep Black Cotton Soil",
              irrigation: profile.farm.irrigation || "Borewell"
            });
          }
          if (profile.crop) {
            setPlantedCrops([profile.crop]);
          }
          setIsSetupComplete(true);
        } catch (e) {
          setIsSetupComplete(false);
        }
      } else {
        // First-time user needs setup
        setIsSetupComplete(false);
      }

    } else if (isLoaded && !isSignedIn) {
      setFarmer({
        id: "guest",
        clerk_user_id: null,
        full_name: "",
        email: "",
        avatar_url: null,
        phone_number: "",
        preferred_language: language,
        is_authenticated: false
      });
      setIsSetupComplete(false);
      setPlantedCrops([]);
    }
  }, [isLoaded, isSignedIn, user]);

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

  const completeSetup = (setupData) => {
    if (setupData.crop) {
      setPlantedCrops([setupData.crop]);
    }
    setIsSetupComplete(true);
  };

  const reopenSetup = () => {
    setIsSetupComplete(false);
  };

  return (
    <AuthContext.Provider value={{
      farmer,
      activeFarm,
      plantedCrops,
      language,
      isLoaded,
      isSignedIn,
      isSetupComplete,
      completeSetup,
      reopenSetup,
      updateLanguage,
      addCrop,
      updateFarmLocation,
      setFarmer,
      setPlantedCrops,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
