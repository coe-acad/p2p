import { useNavigate, useLocation } from "react-router-dom";
import DeviceProfileScreen from "@/components/screens/DeviceProfileScreen";

const OnboardingDevicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVCVerified = location.state?.isVCVerified ?? false;
  const devices = location.state?.devices || [];

  return (
    <DeviceProfileScreen
      onContinue={() => navigate("/onboarding/talk", { state: { isVCVerified } })}
      devices={devices}
      onBack={() => navigate("/onboarding/location")}
    />
  );
};

export default OnboardingDevicesPage;
