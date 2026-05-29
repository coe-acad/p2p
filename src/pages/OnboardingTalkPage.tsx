import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import TalkToSamaiScreen from "@/components/screens/TalkToSamaiScreen";

const ONBOARDING_TALK_KEY = "samai_onboarding_talk_done";

const OnboardingTalkPage = () => {
  const navigate = useNavigate();
  const { setUserData } = useUserData();

  const handleContinue = async () => {
    localStorage.setItem(ONBOARDING_TALK_KEY, "true");

    // Continue to VC upload step
    navigate("/onboarding/vc", { replace: true });
  };

  return (
    <TalkToSamaiScreen
      onContinue={handleContinue}
      onBack={() => navigate(-1)}
    />
  );
};

export default OnboardingTalkPage;
