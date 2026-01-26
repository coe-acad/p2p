import SuccessScreen from "@/components/screens/SuccessScreen";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <SuccessScreen
      onContinue={() => navigate("/onboarding")}
    />
  );
};

export default SuccessPage;
