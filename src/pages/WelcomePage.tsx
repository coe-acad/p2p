import WelcomeScreen from "@/components/screens/WelcomeScreen";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleNewUser = () => {
    // Clear any existing user data for a fresh start
    localStorage.removeItem("samai_user_data");
    localStorage.removeItem("samai_onboarding_complete");
    localStorage.removeItem("samai_aadhaar_verified");
    localStorage.removeItem("samai_onboarding_location_done");
    localStorage.removeItem("samai_onboarding_devices_done");
    localStorage.removeItem("samai_onboarding_talk_done");
    localStorage.removeItem("samai_published_trades");
    localStorage.removeItem("samai_hide_setup_banner");
    navigate("/intent");
  };

  return (
    <WelcomeScreen
      onNewUser={handleNewUser}
      onReturningUser={() => navigate("/intent", { state: { isReturningUser: true } })}
    />
  );
};

export default WelcomePage;
