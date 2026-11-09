import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext();

const DEFAULT_INITIAL_FARM = {
  id: "farm-1",
  farm_name: "Ramesh's Farm Parcel #1",
  address: "Kandi Village, Sangareddy, Telangana, India",
  latitude: 17.6192,
  longitude: 78.0818,
  land_area_acres: 4.5,
  soil_type: "Deep Black Cotton Soil (Vertisol)",
  irrigation: "Borewell / Tube-well Electric Motor",
  crops: [
    {
      id: 1,
      crop_name: "Paddy (Rice)",
      category: "wetland",
      variety: "BPT 5204 (Samba Mahsuri)",
      growth_stage: "Flowering Stage",
      acres: 2.5
    },
    {
      id: 2,
      crop_name: "Maize (Corn)",
      category: "semi_arid",
      variety: "DHM 117",
      growth_stage: "Vegetative Stage",
      acres: 2.0
    }
  ]
};

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Farmer User State
  const [farmer, setFarmer] = useState({
    id: "guest",
    clerk_user_id: null,
    full_name: "",
    email: "",
    avatar_url: null,
    phone_number: "",
    is_authenticated: false
  });

  // Multiple Farmlands State
  const [farms, setFarms] = useState([DEFAULT_INITIAL_FARM]);
  const [activeFarmId, setActiveFarmId] = useState(DEFAULT_INITIAL_FARM.id);

  // Active Farm Helper
  const activeFarm = farms.find(f => f.id === activeFarmId) || farms[0] || DEFAULT_INITIAL_FARM;
  const plantedCrops = activeFarm.crops || [];

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
        is_authenticated: true
      };

      setFarmer(currentFarmer);

      // Check for saved multiple farms
      const savedCompleted = localStorage.getItem(`protectfarm_setup_completed_${user.id}`);
      const savedFarmsRaw = localStorage.getItem(`protectfarm_farms_${user.id}`);

      if (savedCompleted === 'true' && savedFarmsRaw) {
        try {
          const parsedFarms = JSON.parse(savedFarmsRaw);
          if (Array.isArray(parsedFarms) && parsedFarms.length > 0) {
            setFarms(parsedFarms);
            setActiveFarmId(parsedFarms[0].id);
            setIsSetupComplete(true);
            return;
          }
        } catch (e) {
          console.error("Failed to load saved farms:", e);
        }
      }

      // Check legacy single-farm profile
      const savedProfileRaw = localStorage.getItem(`protectfarm_profile_${user.id}`);
      if (savedCompleted === 'true' && savedProfileRaw) {
        try {
          const profile = JSON.parse(savedProfileRaw);
          const singleFarm = {
            id: "farm-1",
            farm_name: `${profile.farmerName || displayName}'s Farmland (4.5 Acres)`,
            address: profile.farm?.address || "Field Parcel",
            latitude: profile.farm?.latitude || 17.6192,
            longitude: profile.farm?.longitude || 78.0818,
            land_area_acres: profile.acres || profile.farm?.land_area_acres || 4.5,
            soil_type: profile.farm?.soil_type || "Deep Black Cotton Soil",
            irrigation: profile.farm?.irrigation || "Borewell",
            crops: profile.crop ? [profile.crop] : DEFAULT_INITIAL_FARM.crops
          };
          setFarms([singleFarm]);
          setActiveFarmId(singleFarm.id);
          setIsSetupComplete(true);
          return;
        } catch (e) {}
      }

      // New user
      setIsSetupComplete(false);

    } else if (isLoaded && !isSignedIn) {
      setFarmer({
        id: "guest",
        clerk_user_id: null,
        full_name: "",
        email: "",
        avatar_url: null,
        phone_number: "",
        is_authenticated: false
      });
      setIsSetupComplete(false);
      setFarms([DEFAULT_INITIAL_FARM]);
    }
  }, [isLoaded, isSignedIn, user]);

  // Persist farms to localStorage whenever updated
  const saveFarmsToStorage = (updatedFarms) => {
    if (farmer.clerk_user_id) {
      localStorage.setItem(`protectfarm_farms_${farmer.clerk_user_id}`, JSON.stringify(updatedFarms));
      localStorage.setItem(`protectfarm_setup_completed_${farmer.clerk_user_id}`, 'true');
    }
  };

  // Switch Active Farm
  const switchFarm = (farmId) => {
    setActiveFarmId(farmId);
  };

  // Add a New Farmland
  const addFarm = (newFarmData) => {
    const newFarm = {
      id: `farm-${Date.now()}`,
      farm_name: newFarmData.farm_name || `Farmland #${farms.length + 1}`,
      address: newFarmData.address || "Field Location",
      latitude: parseFloat(newFarmData.latitude) || 17.6192,
      longitude: parseFloat(newFarmData.longitude) || 78.0818,
      land_area_acres: parseFloat(newFarmData.land_area_acres) || 3.0,
      soil_type: newFarmData.soil_type || "Deep Black Cotton Soil",
      irrigation: newFarmData.irrigation || "Borewell",
      crops: newFarmData.crops || []
    };

    setFarms(prev => {
      const next = [...prev, newFarm];
      saveFarmsToStorage(next);
      return next;
    });

    setActiveFarmId(newFarm.id);
  };

  // Update Active Farm Location
  const updateFarmLocation = (coords, areaAcres, geojson, address = null) => {
    setFarms(prev => {
      const updated = prev.map(f => {
        if (f.id === activeFarmId) {
          return {
            ...f,
            latitude: coords.lat,
            longitude: coords.lng,
            land_area_acres: areaAcres || f.land_area_acres,
            address: address || f.address,
            boundary_geojson: geojson || f.boundary_geojson
          };
        }
        return f;
      });
      saveFarmsToStorage(updated);
      return updated;
    });
  };

  // Assign or Add Crop to Active Farm
  const addCrop = (cropData) => {
    setFarms(prev => {
      const updated = prev.map(f => {
        if (f.id === activeFarmId) {
          const currentCrops = f.crops || [];
          const newCrop = {
            id: Date.now(),
            ...cropData
          };
          return {
            ...f,
            crops: [...currentCrops, newCrop]
          };
        }
        return f;
      });
      saveFarmsToStorage(updated);
      return updated;
    });
  };

  // Complete Initial Onboarding
  const completeSetup = (setupData) => {
    const initialFarm = {
      id: "farm-1",
      farm_name: `${setupData.farmerName}'s Farm (${setupData.acres} Acres)`,
      address: setupData.location?.address || "Field Parcel",
      latitude: setupData.location?.lat || 17.6192,
      longitude: setupData.location?.lng || 78.0818,
      land_area_acres: parseFloat(setupData.acres) || 4.5,
      soil_type: setupData.soilType || "Deep Black Cotton Soil (Vertisol)",
      irrigation: setupData.irrigation || "Borewell / Tube-well Motor",
      crops: setupData.crop ? [setupData.crop] : DEFAULT_INITIAL_FARM.crops
    };

    const newFarms = [initialFarm];
    setFarms(newFarms);
    setActiveFarmId(initialFarm.id);
    saveFarmsToStorage(newFarms);
    setIsSetupComplete(true);
  };

  const reopenSetup = () => {
    setIsSetupComplete(false);
  };

  return (
    <AuthContext.Provider value={{
      farmer,
      farms,
      activeFarmId,
      activeFarm,
      plantedCrops,
      isLoaded,
      isSignedIn,
      isSetupComplete,
      switchFarm,
      addFarm,
      addCrop,
      updateFarmLocation,
      completeSetup,
      reopenSetup,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
