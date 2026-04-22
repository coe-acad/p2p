import IntentSelectionScreen from "@/components/screens/IntentSelectionScreen";
import { useNavigate } from "react-router-dom";

const IntentPage = () => {
  const navigate = useNavigate();

  return (
    <IntentSelectionScreen
      onSelect={(intents) => navigate("/verify", { state: { intents, intent: intents[0] } })}
      onBack={() => navigate("/")}
    />
  );
};

export default IntentPage;
