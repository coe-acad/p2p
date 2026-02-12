import VerificationScreen from "@/components/screens/VerificationScreen";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { getUserProfile } from "@/api/users";
import { VCExtractedData } from "@/utils/vcPdfParser";

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intent = location.state?.intent || "sell";
  const isReturningUser = location.state?.isReturningUser || false;
  const { setUserData } = useUserData();

  const handleVerified = async () => {
    if (isReturningUser) {
      const loginRaw = localStorage.getItem("samai_login_user");
      if (!loginRaw) {
        navigate("/intent");
        return;
      }
      const loginUser = JSON.parse(loginRaw);
      const mobileNumber = loginUser.mobile_number || "";
      const isVCVerified = Boolean(loginUser.is_vc_verified);
      let mergedData: VCExtractedData = {};
      if (!isVCVerified) {
        localStorage.removeItem("samai_vc_data");
      } else if (mobileNumber) {
        try {
          const profile = await getUserProfile(mobileNumber);
          mergedData = profile.merged || {};
          localStorage.setItem("samai_vc_data", JSON.stringify(mergedData));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }

      // Mark onboarding as complete for returning users
      localStorage.setItem("samai_onboarding_complete", "true");
      localStorage.setItem("samai_aadhaar_verified", "true");
      localStorage.setItem("samai_onboarding_location_done", "true");
      localStorage.setItem("samai_onboarding_devices_done", "true");
      localStorage.setItem("samai_onboarding_talk_done", "true");

      const nextUserData = {
        name: mergedData.fullName || "",
        phone: mobileNumber,
        address: mergedData.address || "",
        city: "",
        discom: mergedData.issuerName || "",
        consumerId: mergedData.consumerNumber || "",
        email: "",
        upiId: "",
        userContext: "",
        isReturningUser: true,
        isVCVerified,
      };
      setUserData(nextUserData);
      // Persist immediately so Home/Profile can read without waiting for hook sync
      localStorage.setItem("samai_user_data", JSON.stringify(nextUserData));

      navigate("/home", { replace: true, state: { isVCVerified } });
    } else {
      // New user - continue to success/onboarding
      navigate("/success", { state: { intent } });
    }
  };

  return (
    <VerificationScreen
      onVerified={handleVerified}
      onBack={() => navigate(isReturningUser ? "/" : "/intent")}
      isReturningUser={isReturningUser}
    />
  );
};

export default VerifyPage;
