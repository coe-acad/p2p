import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import TalkToSamaiScreen from "@/components/screens/TalkToSamaiScreen";

const ONBOARDING_TALK_KEY = "samai_onboarding_talk_done";
const ONBOARDING_COMPLETE_KEY = "samai_onboarding_complete";

const OnboardingTalkPage = () => {
  const navigate = useNavigate();
  const { setUserData } = useUserData();

  const handleContinue = async () => {
    localStorage.setItem(ONBOARDING_TALK_KEY, "true");
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");

    // Update onboardingComplete flag in Firestore
    setUserData({ onboardingComplete: true });

    navigate("/home", { replace: true });
  };

  return (
    <TalkToSamaiScreen
      onContinue={handleContinue}
      onBack={() => navigate(-1)}
    />
  );
};

export default OnboardingTalkPage;
