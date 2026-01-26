import { useNavigate } from "react-router-dom";
import LocationDiscomScreen from "@/components/screens/LocationDiscomScreen";

const OnboardingLocationPage = () => {
  const navigate = useNavigate();

  return (
    <LocationDiscomScreen
      onContinue={(payload) => navigate("/onboarding/devices", { state: payload })}
      onBack={() => navigate("/onboarding")}
    />
  );
};

export default OnboardingLocationPage;
