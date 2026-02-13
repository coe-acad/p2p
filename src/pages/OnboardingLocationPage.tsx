import { useNavigate } from "react-router-dom";
import LocationDeviceScreen from "@/components/screens/LocationDeviceScreen";
import { markEarningsModalPending } from "@/utils/earningsSuggestion";

const ONBOARDING_LOCATION_KEY = "samai_onboarding_location_done";
const ONBOARDING_DEVICES_KEY = "samai_onboarding_devices_done";

const OnboardingLocationPage = () => {
  const navigate = useNavigate();

  const handleContinue = (isVerified: boolean, locationData?: { address?: string; city?: string; discom?: string }) => {
    // Mark both location and devices as done (combined step)
    localStorage.setItem(ONBOARDING_LOCATION_KEY, "true");
    localStorage.setItem(ONBOARDING_DEVICES_KEY, "true");
    if (isVerified) {
      markEarningsModalPending();
      navigate("/home", { replace: true, state: { isVCVerified: true } });
      return;
    }
    navigate("/onboarding/talk", { 
      state: { 
        isVCVerified: isVerified,
        address: locationData?.address,
        city: locationData?.city,
        discom: locationData?.discom
      } 
    });
  };

  return (
    <LocationDeviceScreen
      onContinue={handleContinue}
      onBack={() => navigate("/onboarding")}
    />
  );
};

export default OnboardingLocationPage;
