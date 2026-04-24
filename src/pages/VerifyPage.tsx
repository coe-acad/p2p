import VerificationScreen from "@/components/screens/VerificationScreen";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { ensureUserOnServer, loadUser } from "@/services/userService";

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intent = location.state?.intent || localStorage.getItem("samai_selected_intent") || "sell";
  const isReturningUser = location.state?.isReturningUser || false;
  const { setUserData } = useUserData();

  // Save intent to localStorage so it persists on refresh
  if (intent) {
    localStorage.setItem("samai_selected_intent", intent);
  }

  const handleVerified = async (phone?: string) => {
    if (!phone) return;

    const phoneWithCountry = `+91${phone}`;

    // Check if user already exists in database
    const existingUser = await loadUser(phoneWithCountry);
    const isReturning = !!existingUser;

    if (isReturning && existingUser) {
      // Returning user - load their existing data and go to home
      // Use the intent from current session (user's current choice), not the original user's intent
      const userIntent = intent || existingUser.intent || "sell";

      setUserData({
        ...existingUser,
        phone: phoneWithCountry,
        aadhaarVerified: true,
        intent: userIntent, // Preserve the user's selected intent
      });

      // Mark all onboarding steps as complete
      localStorage.setItem("samai_onboarding_complete", "true");
      localStorage.setItem("samai_aadhaar_verified", "true");
      localStorage.setItem("samai_onboarding_location_done", "true");
      localStorage.setItem("samai_onboarding_devices_done", "true");
      localStorage.setItem("samai_onboarding_talk_done", "true");

      const targetRoute = userIntent === "buy" ? "/buyer-home" : "/home";
      navigate(targetRoute, { replace: true });
    } else {
      // New user - continue with 5-step verification
      const existingData = JSON.parse(localStorage.getItem("samai_user_data") || "{}");
      setUserData({
        phone: phoneWithCountry,
        aadhaarVerified: true,
        intent,
        name: existingData.name,
        consumerId: existingData.consumerId,
        address: existingData.address,
        city: existingData.city,
        discom: existingData.discom,
      });

      ensureUserOnServer().catch((err) =>
        console.error("Failed to ensure user on server:", err)
      );

      // Mark onboarding as complete for new users too
      localStorage.setItem("samai_onboarding_complete", "true");
      localStorage.setItem("samai_aadhaar_verified", "true");
      localStorage.setItem("samai_onboarding_location_done", "true");
      localStorage.setItem("samai_onboarding_devices_done", "true");
      localStorage.setItem("samai_onboarding_talk_done", "true");

      const targetRoute = intent === "buy" ? "/buyer-home" : "/home";
      navigate(targetRoute, { replace: true });
    }
  };

  return (
    <VerificationScreen
      onVerified={handleVerified}
      onBack={() => navigate("/")}
      isReturningUser={isReturningUser}
    />
  );
};

export default VerifyPage;
