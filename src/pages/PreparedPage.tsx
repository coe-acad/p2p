import { useNavigate, useLocation } from "react-router-dom";
import PreparedTomorrowScreen from "@/components/screens/PreparedTomorrowScreen";

const PreparedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVCVerified = location.state?.isVCVerified ?? false;
  // Show confirmed trades section if user has confirmed trades
  const hasConfirmedTrades = location.state?.hasConfirmedTrades ?? false;
  // Force walkthrough during onboarding flow (coming from /calculating)
  const fromOnboarding = location.state?.fromOnboarding ?? false;

  return (
    <PreparedTomorrowScreen
      isVCVerified={isVCVerified}
      hasConfirmedTrades={hasConfirmedTrades}
      forceWalkthrough={fromOnboarding}
      onLooksGood={() => navigate("/published", { state: { isVCVerified } })}
      onViewAdjust={() => navigate("/dashboard")}
      onTalkToSamai={() => navigate("/onboarding/talk", { state: { isVCVerified } })}
      onVerifyNow={() => navigate("/onboarding/location")}
      onBack={() => navigate("/home")}
    />
  );
};

export default PreparedPage;
