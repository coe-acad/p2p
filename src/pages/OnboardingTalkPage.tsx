import { useNavigate, useLocation } from "react-router-dom";
import TalkToSamaiScreen from "@/components/screens/TalkToSamaiScreen";

const ONBOARDING_TALK_KEY = "samai_onboarding_talk_done";

const OnboardingTalkPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVCVerified = location.state?.isVCVerified ?? false;

  const handleContinue = () => {
    localStorage.setItem(ONBOARDING_TALK_KEY, "true");
    navigate("/calculating", { state: { isVCVerified } });
  };

  return (
    <TalkToSamaiScreen
      onContinue={handleContinue}
      onBack={() => navigate("/onboarding/devices", { state: { isVCVerified } })}
    />
  );
};

export default OnboardingTalkPage;
