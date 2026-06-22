import IntentSelectionScreen from "@/components/screens/IntentSelectionScreen";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { saveUser } from "@/services/userService";

const IntentPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();

  const handleIntentSelect = async (intents: string[]) => {
    const intent = intents[0] as "sell" | "buy";
    if (!intent) return;

    try {
      // Update intent in user data
      setUserData({ ...userData, intent });

      // Only attempt to save if phone is available, but don't block on it
      if (userData?.phone) {
        const savePromise = saveUser({
          phone: userData.phone,
          intent,
        } as any);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Save timeout")), 5000)
        );

        await Promise.race([savePromise, timeoutPromise]).catch((err) => {
          console.error("Failed to save user intent:", err);
        });
      }

      // Navigate regardless of save success
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
