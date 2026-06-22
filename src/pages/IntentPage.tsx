import IntentSelectionScreen from "@/components/screens/IntentSelectionScreen";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { saveUser } from "@/services/userService";

const IntentPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();

  const handleIntentSelect = async (intents: string[]) => {
    const intent = intents[0] as "sell" | "buy";
    if (!intent || !userData?.phone) return;

    try {
      // Save intent to user data and Firestore
      setUserData({ ...userData, intent });

      // Add timeout to prevent hanging
      const savePromise = saveUser({
        phone: userData.phone,
        intent,
      } as any);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Save timeout")), 5000)
      );

      await Promise.race([savePromise, timeoutPromise]).catch((err) => {
        console.error("Failed to save user intent:", err);
        // Continue navigation even if save fails
      });

      // If the user has already verified their VC (Firestore source of truth),
      // skip the onboarding upload step and go straight to their home.
      const isVCVerified = Boolean((userData as any)?.is_vc_verified);
      const hasCompletedOnboarding = Boolean((userData as any)?.onboardingComplete);
      const homeRoute = intent === "buy" ? "/buyer-home" : "/home";

      if (isVCVerified || hasCompletedOnboarding) {
        navigate(homeRoute, { replace: true });
      } else {
        navigate("/onboarding/vc", { replace: true });
      }
    } catch (error) {
      console.error("Intent selection error:", error);
      // Still navigate even if there's an error
      const homeRoute = intent === "buy" ? "/buyer-home" : "/home";
      navigate("/onboarding/vc", { replace: true });
    }
  };

  return (
    <IntentSelectionScreen
      onSelect={handleIntentSelect}
      onBack={() => navigate("/")}
    />
  );
};

export default IntentPage;
