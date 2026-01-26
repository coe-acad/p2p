import WelcomeScreen from "@/components/screens/WelcomeScreen";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <WelcomeScreen
      onNewUser={() => navigate("/intent")}
      onReturningUser={() => navigate("/returning")}
    />
  );
};

export default WelcomePage;
