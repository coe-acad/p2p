import IntentSelectionScreen from "@/components/screens/IntentSelectionScreen";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const IntentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.isReturningUser) {
      navigate("/verify", { state: { isReturningUser: true }, replace: true });
    }
  }, [location.state, navigate]);

  return (
    <IntentSelectionScreen
      onSelect={(intents) => {
        const role = intents.includes("sell") ? "PROSUMER" : "CONSUMER";
        localStorage.setItem("samai_user_role", role);
        navigate("/verify", { state: { intents } });
      }}
      onBack={() => navigate("/")}
    />
  );
};

export default IntentPage;
