import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import CalculatingScreen from "@/components/screens/CalculatingScreen";
import { useUserData } from "@/hooks/useUserData";
 
const CalculatingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUserData();
  const loginRaw = localStorage.getItem("samai_login_user");
  let loginIsVerified = false;
  if (loginRaw) {
    try {
      loginIsVerified = Boolean(JSON.parse(loginRaw)?.is_vc_verified);
    } catch {
      loginIsVerified = false;
    }
  }
  const isVCVerified = Boolean(
    location.state?.isVCVerified ?? userData.isVCVerified ?? loginIsVerified
  );

  useEffect(() => {
    if (!isVCVerified) {
      navigate("/home", { replace: true, state: { isVCVerified: false } });
    }
  }, [isVCVerified, navigate]);

  if (!isVCVerified) {
    return null;
  }

  return (
    <CalculatingScreen
      onComplete={() => navigate("/earnings", { state: { isVCVerified: true } })}
    />
  );
};
 
 export default CalculatingPage;
