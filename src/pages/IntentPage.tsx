import IntentSelectionScreen from "@/components/screens/IntentSelectionScreen";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { saveUser } from "@/services/userService";

const IntentPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();

  const handleIntentSelect = async (intents: string[]) => {
    const intent = intents[0] as "sell" | "buy";
    if (intent && userData?.phone) {
      // Save intent to user data and Firestore
      setUserData({ ...userData, intent });

      await saveUser({
        phone: userData.phone,
        intent,
      } as any).catch((err) =>
        console.error("Failed to save user intent to Firestore:", err)
      );

      // Navigate to VC upload page
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
