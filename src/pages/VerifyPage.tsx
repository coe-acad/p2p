import VerificationScreen from "@/components/screens/VerificationScreen";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { ensureUserOnServer, loadUser, saveUser } from "@/services/userService";

const isIntentValue = (value: unknown): value is "sell" | "buy" => value === "sell" || value === "buy";

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Intent from IntentPage selection (only present for new-user flow)
  const selectedIntent = location.state?.intent as "sell" | "buy" | undefined;
  const isReturningUser = location.state?.isReturningUser || false;
  const { setUserData } = useUserData();

  const handleVerified = async (phone?: string) => {
    if (!phone) return;

    const phoneWithCountry = `+91${phone}`;

    // Check if user already exists in database
    const existingUser = await loadUser(phoneWithCountry);
    const isReturning = !!existingUser;

    if (isReturning && existingUser) {
      // Returning user - intent comes from Firestore, NOT from localStorage or selection.
      // Returning users skip IntentPage, so their stored role is the source of truth.
      const storedIntent = localStorage.getItem("samai_selected_intent");
      const resolvedIntent =
        (isIntentValue(existingUser.intent) ? existingUser.intent : undefined) ||
        (isIntentValue(storedIntent) ? storedIntent : undefined);

      setUserData({
        ...existingUser,
        phone: phoneWithCountry,
        aadhaarVerified: true,
        ...(resolvedIntent ? { intent: resolvedIntent } : {}),
      });

      if (resolvedIntent) {
        localStorage.setItem("samai_selected_intent", resolvedIntent);
      }

      // Explicitly save intent to Firestore
      saveUser({
        phone: phoneWithCountry,
        ...(resolvedIntent ? { intent: resolvedIntent } : {}),
        name: existingUser.name || "",
        address: existingUser.address || "",
        city: existingUser.city || "",
        discom: existingUser.discom || "",
        consumerId: existingUser.consumerId || "",
        automationLevel: existingUser.automationLevel || "recommend",
        aadhaarVerified: true,
      } as any).catch(err => console.error("Failed to save intent to Firestore:", err));

      // Mark all onboarding steps as complete
      localStorage.setItem("samai_onboarding_complete", "true");
      localStorage.setItem("samai_aadhaar_verified", "true");
      localStorage.setItem("samai_onboarding_location_done", "true");
      localStorage.setItem("samai_onboarding_devices_done", "true");
      localStorage.setItem("samai_onboarding_talk_done", "true");

      const targetRoute = resolvedIntent === "buy" ? "/buyer-home" : "/home";
      navigate(targetRoute, { replace: true });
    } else {
      // New user - intent comes from IntentPage selection
      const intentFromStorage = localStorage.getItem("samai_selected_intent");
      const intentFromUserData = JSON.parse(localStorage.getItem("samai_user_data") || "{}")?.intent;
      const newUserIntent: "sell" | "buy" =
        selectedIntent ||
        (isIntentValue(intentFromStorage) ? intentFromStorage : undefined) ||
        (isIntentValue(intentFromUserData) ? intentFromUserData : "sell");
      const existingData = JSON.parse(localStorage.getItem("samai_user_data") || "{}");
      const userData = {
        phone: phoneWithCountry,
        aadhaarVerified: true,
        intent: newUserIntent,
        name: existingData.name || "",
        consumerId: existingData.consumerId || "",
        address: existingData.address || "",
        city: existingData.city || "",
        discom: existingData.discom || "",
        automationLevel: "recommend" as const,
      };

      setUserData(userData);

      localStorage.setItem("samai_selected_intent", newUserIntent);

      saveUser(userData as any).catch((err) =>
        console.error("Failed to save user intent to Firestore:", err)
      );

      ensureUserOnServer().catch((err) =>
        console.error("Failed to ensure user on server:", err)
      );

      localStorage.setItem("samai_onboarding_complete", "true");
      localStorage.setItem("samai_aadhaar_verified", "true");
      localStorage.setItem("samai_onboarding_location_done", "true");
      localStorage.setItem("samai_onboarding_devices_done", "true");
      localStorage.setItem("samai_onboarding_talk_done", "true");

      const targetRoute = newUserIntent === "buy" ? "/buyer-home" : "/home";
      navigate(targetRoute, { replace: true });
    }
  };

  return (
    <VerificationScreen
      onVerified={handleVerified}
      onBack={() => navigate(isReturningUser ? "/" : "/intent")}
      isReturningUser={isReturningUser}
      selectedIntent={selectedIntent}
    />
  );
};

export default VerifyPage;
