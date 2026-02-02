import { useNavigate, useLocation } from "react-router-dom";
import DeviceProfileScreen from "@/components/screens/DeviceProfileScreen";

const ONBOARDING_DEVICES_KEY = "samai_onboarding_devices_done";

const OnboardingDevicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVCVerified = location.state?.isVCVerified ?? false;
  const locationData = {
    address: location.state?.address,
    city: location.state?.city,
    discom: location.state?.discom
  };

  const handleContinue = () => {
    localStorage.setItem(ONBOARDING_DEVICES_KEY, "true");
    navigate("/onboarding/talk", { state: { isVCVerified } });
  };

  return (
    <DeviceProfileScreen
      locationData={locationData}
      onContinue={handleContinue}
      onBack={() => navigate("/onboarding/location")}
    />
  );
};

export default OnboardingDevicesPage;
