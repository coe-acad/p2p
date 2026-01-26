import { useNavigate, useLocation } from "react-router-dom";
import TalkToSamaiScreen from "@/components/screens/TalkToSamaiScreen";

const OnboardingTalkPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVCVerified = location.state?.isVCVerified ?? false;

  return (
    <TalkToSamaiScreen
      onContinue={() => navigate("/calculating", { state: { isVCVerified } })}
      onBack={() => navigate("/onboarding/devices", { state: { isVCVerified } })}
    />
  );
};

export default OnboardingTalkPage;
