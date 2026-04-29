import IntentSelectionScreen from "@/components/screens/IntentSelectionScreen";
import { useNavigate } from "react-router-dom";

const IntentPage = () => {
  const navigate = useNavigate();

  return (
    <IntentSelectionScreen
      onSelect={(intents) => {
        const intent = intents[0];
        if (intent) {
          localStorage.setItem("samai_selected_intent", intent);
        }
        navigate("/verify", { state: { intents, intent } });
      }}
      onBack={() => navigate("/")}
    />
  );
};

export default IntentPage;
