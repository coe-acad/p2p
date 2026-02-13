import { useNavigate, useLocation } from "react-router-dom";
import PreparedTomorrowScreen from "@/components/screens/PreparedTomorrowScreen";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";
import { useUserData } from "@/hooks/useUserData";

const PreparedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tradesData } = usePublishedTrades();
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
