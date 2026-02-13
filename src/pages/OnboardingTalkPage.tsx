import { useNavigate, useLocation } from "react-router-dom";
import TalkToSamaiScreen from "@/components/screens/TalkToSamaiScreen";
import { useUserData } from "@/hooks/useUserData";
import { markEarningsModalPending } from "@/utils/earningsSuggestion";

const ONBOARDING_TALK_KEY = "samai_onboarding_talk_done";
const ONBOARDING_COMPLETE_KEY = "samai_onboarding_complete";

const OnboardingTalkPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUserData();
  const loginRaw = localStorage.getItem("samai_login_user");
  let loginIsVerified = false;
  if (loginRaw) {
    try {
      loginIsVerified = Boolean(JSON.parse(loginRaw)?.is_vc_verified);
    } catch {
      loginIsVerified = false;
    }
  }
  const isVCVerified = Boolean(
    location.state?.isVCVerified ?? userData.isVCVerified ?? loginIsVerified
  );

  const handleContinue = () => {
    localStorage.setItem(ONBOARDING_TALK_KEY, "true");
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    if (isVCVerified) {
      markEarningsModalPending();
      navigate("/home", { replace: true, state: { isVCVerified: true } });
      return;
    }
    navigate("/home", { replace: true, state: { isVCVerified: false } });
  };

  return (
    <TalkToSamaiScreen
      onContinue={handleContinue}
      onBack={() => navigate("/onboarding/location", { state: { isVCVerified } })}
    />
  );
};

export default OnboardingTalkPage;
