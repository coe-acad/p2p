import { useNavigate, useLocation } from "react-router-dom";
import PreparedTomorrowScreen from "@/components/screens/PreparedTomorrowScreen";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";

const PreparedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tradesData } = usePublishedTrades();
  const isVCVerified = location.state?.isVCVerified ?? false;
  
  // Only show confirmed trades if explicitly flagged via showConfirmed state OR tradesData flag
  const showConfirmedFromState = location.state?.showConfirmed ?? false;
  const hasConfirmedTrades = showConfirmedFromState && tradesData.showConfirmedTrades && tradesData.confirmedTrades.length > 0;
  
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
