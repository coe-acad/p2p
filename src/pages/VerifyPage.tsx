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
  const { userData: currentUserData, setUserData } = useUserData();

  const handleVerified = async (phone?: string) => {
    if (!phone) return;

    const phoneWithCountry = `+91${phone}`;

    // Check if user already exists via backend API (doesn't require auth)
    let isReturning = false;
    let existingUser = null;
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3002";
      const response = await fetch(`${BACKEND_URL}/api/user/exists?phone_number=${encodeURIComponent(phoneWithCountry)}`);
      if (response.ok) {
        const result = await response.json();
        if (result.exists) {
          isReturning = true;
          // After auth, we'll load full user data from Firestore
        }
      }
    } catch (err) {
      console.error("Failed to check if user exists:", err);
      // Continue anyway - will be treated as new user if check fails
    }

    if (isReturning) {
      // Returning user: load full profile from Firestore now that they're authenticated
      try {
        existingUser = await loadUser(phoneWithCountry);
      } catch (err) {
        console.error("Failed to load returning user profile:", err);
      }

      if (existingUser) {
        // Returning user: intent is only what is stored in Firestore (never localStorage or navigation state).
        const resolvedIntent = isIntentValue(existingUser.intent) ? existingUser.intent : undefined;

        const { intent: _existingIntent, ...existingWithoutIntent } = existingUser;
        setUserData({
          ...existingWithoutIntent,
          phone: phoneWithCountry,
          aadhaarVerified: true,
          ...(resolvedIntent ? { intent: resolvedIntent } : {}),
          onboardingComplete: true, // Lock all user details for returning users
        });

        // Save to Firestore BEFORE navigating to ensure intent is persisted
        await saveUser({
          phone: phoneWithCountry,
          ...(resolvedIntent ? { intent: resolvedIntent } : {}),
          name: existingUser.name || "",
          address: existingUser.address || "",
          city: existingUser.city || "",
          discom: existingUser.discom || "",
          consumerId: existingUser.consumerId || "",
          automationLevel: existingUser.automationLevel || "recommend",
          aadhaarVerified: true,
          onboardingComplete: true,
        } as any).catch(err => console.error("Failed to save profile to Firestore:", err));

        ensureUserOnServer({
          name: existingUser.name || "",
          meter_number: existingUser.consumerId || "",
          discom: existingUser.discom || "",
          consumerId: existingUser.consumerId || "",
        }).catch((err) => console.error("Failed to ensure user on server:", err));

        // Mark all onboarding steps as complete
        localStorage.setItem("samai_onboarding_complete", "true");
        localStorage.setItem("samai_aadhaar_verified", "true");
        localStorage.setItem("samai_onboarding_location_done", "true");
        localStorage.setItem("samai_onboarding_devices_done", "true");
        localStorage.setItem("samai_onboarding_talk_done", "true");

        const targetRoute =
          resolvedIntent === "buy" ? "/buyer-home" : resolvedIntent === "sell" ? "/home" : "/intent";
        navigate(targetRoute, { replace: true });
      }
    } else {
      // New user: intent only from this signup flow (navigation state, then pre-verify stash if the page was refreshed).
      const intentFromStorage = localStorage.getItem("samai_selected_intent");
      const newUserIntent: "sell" | "buy" | undefined =
        (isIntentValue(selectedIntent) ? selectedIntent : undefined) ||
        (isIntentValue(intentFromStorage) ? intentFromStorage : undefined);
      if (!newUserIntent) {
        navigate("/intent", { replace: true });
        return;
      }
      const newUserData = {
        phone: phoneWithCountry,
        aadhaarVerified: true,
        intent: newUserIntent,
        name: currentUserData.name || "",
        consumerId: currentUserData.consumerId || "",
        address: currentUserData.address || "",
        city: currentUserData.city || "",
        discom: currentUserData.discom || "",
        automationLevel: "recommend" as const,
        onboardingComplete: false, // New users must complete onboarding first
      };

      setUserData(newUserData);

      localStorage.removeItem("samai_selected_intent");
      // Clear onboarding flags for new users - they need to complete these steps
      localStorage.removeItem("samai_onboarding_complete");
      localStorage.removeItem("samai_onboarding_location_done");
      localStorage.removeItem("samai_onboarding_devices_done");
      localStorage.removeItem("samai_onboarding_talk_done");
      localStorage.setItem("samai_aadhaar_verified", "true");

      // Save to Firestore BEFORE navigating to ensure intent is persisted
      await saveUser(newUserData as any).catch((err) =>
        console.error("Failed to save user intent to Firestore:", err)
      );

      ensureUserOnServer({
        name: newUserData.name,
        meter_number: newUserData.consumerId,
        discom: newUserData.discom,
        consumerId: newUserData.consumerId,
      }).catch((err) => console.error("Failed to ensure user on server:", err));

      // New sellers go to onboarding, new buyers go directly to buyer-home
      const targetRoute = newUserIntent === "buy" ? "/buyer-home" : "/onboarding";
      navigate(targetRoute, { replace: true });
    }
  };

  return (
    <VerificationScreen
      onVerified={handleVerified}
      onBack={() => navigate("/")}
      isReturningUser={isReturningUser}
      selectedIntent={selectedIntent}
    />
  );
};

export default VerifyPage;
