import SuccessScreen from "@/components/screens/SuccessScreen";
import { useLocation, useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const afterVCVerification = location.state?.afterVCVerification === true;

  const handleContinue = () => {
    if (afterVCVerification) {
      localStorage.setItem("samai_onboarding_complete", "true");
      localStorage.setItem("samai_onboarding_location_done", "true");
      localStorage.setItem("samai_onboarding_devices_done", "true");
      localStorage.setItem("samai_onboarding_talk_done", "true");

      navigate("/home", {
        replace: true,
        state: { isVCVerified: true },
      });
      return;
    }

    navigate("/onboarding");
  };

  return (
    <SuccessScreen
      onContinue={handleContinue}
    />
  );
};

export default SuccessPage;
