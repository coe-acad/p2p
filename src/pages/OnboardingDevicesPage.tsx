import { useNavigate } from "react-router-dom";
import LocationDeviceScreen from "@/components/screens/LocationDeviceScreen";

const ONBOARDING_DEVICES_KEY = "samai_onboarding_devices_done";

const OnboardingDevicesPage = () => {
  const navigate = useNavigate();

  return (
    <LocationDeviceScreen
      onBack={() => navigate(-1)}
      onContinue={() => {
        localStorage.setItem(ONBOARDING_DEVICES_KEY, "true");
        navigate("/onboarding/talk", { replace: true });
      }}
    />
  );
};

export default OnboardingDevicesPage;
