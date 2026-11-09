import React from 'react';
import { useAuth } from './context/AuthContext';
import AuthLandingPage from './components/AuthLandingPage';
import FarmOnboardingScreen from './components/FarmOnboardingScreen';
import AgriGuardDashboard from './components/AgriGuardDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { isLoaded, isSignedIn, isSetupComplete, completeSetup } = useAuth();

  // 1. Loading State while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#070E0C] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
        <span className="text-sm font-bold text-emerald-200">Initializing AgriGuard AI Intelligence...</span>
      </div>
    );
  }

  // 2. Unauthenticated State -> Open Login / Sign In Page
  if (!isSignedIn) {
    return <AuthLandingPage />;
  }

  // 3. Authenticated but Needs Onboarding Setup -> Ask Farmer Name, Crop Variety, Land Area, Map Coordinates
  if (!isSetupComplete) {
    return <FarmOnboardingScreen onComplete={(setup) => completeSetup(setup)} />;
  }

  // 4. Authenticated & Setup Complete -> Full Modern AgriGuard AI Dashboard
  return <AgriGuardDashboard />;
}
