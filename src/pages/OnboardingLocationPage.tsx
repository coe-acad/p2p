import { useNavigate } from "react-router-dom";
import LocationDiscomScreen from "@/components/screens/LocationDiscomScreen";

const ONBOARDING_LOCATION_KEY = "samai_onboarding_location_done";

const OnboardingLocationPage = () => {
  const navigate = useNavigate();

  const handleContinue = (isVerified: boolean, locationData?: { address?: string; city?: string; discom?: string }) => {
    localStorage.setItem(ONBOARDING_LOCATION_KEY, "true");
    navigate("/onboarding/devices", { 
      state: { 
        isVCVerified: isVerified,
        address: locationData?.address,
        city: locationData?.city,
        discom: locationData?.discom
      } 
    });
  };

  return (
    <LocationDiscomScreen
      onContinue={handleContinue}
      onBack={() => navigate("/onboarding")}
    />
  );
};

export default OnboardingLocationPage;
