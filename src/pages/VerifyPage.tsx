import VerificationScreen from "@/components/screens/VerificationScreen";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intent = location.state?.intent || "sell";

  return (
    <VerificationScreen
      onVerified={() => navigate("/success", { state: { intent } })}
      onBack={() => navigate("/intent")}
    />
  );
};

export default VerifyPage;
