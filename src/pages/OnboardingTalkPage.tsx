import { useNavigate, useLocation } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import TalkToSamaiScreen from "@/components/screens/TalkToSamaiScreen";

const ONBOARDING_TALK_KEY = "samai_onboarding_talk_done";
const ONBOARDING_COMPLETE_KEY = "samai_onboarding_complete";

const OnboardingTalkPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserData } = useUserData();
  const isVCVerified = location.state?.isVCVerified ?? false;

  const handleContinue = async () => {
    localStorage.setItem(ONBOARDING_TALK_KEY, "true");
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");

    // Update onboardingComplete flag in Firestore
    setUserData({ onboardingComplete: true });

    navigate("/calculating", { state: { isVCVerified } });
  };

  return (
    <TalkToSamaiScreen
      onContinue={handleContinue}
      onBack={() => navigate(-1)}
    />
  );
};

export default OnboardingTalkPage;
