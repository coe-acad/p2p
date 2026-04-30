import { useNavigate } from "react-router-dom";
import LocationDeviceScreen from "@/components/screens/LocationDeviceScreen";

const ONBOARDING_DEVICES_KEY = "samai_onboarding_devices_done";

const OnboardingDevicesPage = () => {
  const navigate = useNavigate();

  return (
    <LocationDeviceScreen
      onBack={() => navigate("/home")}
      onContinue={() => {
        localStorage.setItem(ONBOARDING_DEVICES_KEY, "true");
        navigate("/home", { replace: true });
      }}
    />
  );
};

export default OnboardingDevicesPage;
