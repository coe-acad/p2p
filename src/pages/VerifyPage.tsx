import VerificationScreen from "@/components/screens/VerificationScreen";
import { toast } from "@/components/ui/sonner";
import { saveUserCache } from "@/hooks/use-user";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intent = location.state?.intent || "sell";
  const role = intent === "sell" ? "Prosumer" : "Consumer";

  return (
    <VerificationScreen
      onVerified={async ({ name, phone }) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/bpp/onboarding/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, role }),
          });

          if (!response.ok) {
            console.error("Signup failed", await response.text());
            alert("Signup failed. Please try again.");
            return;
          }

          const data = await response.json();
          toast.success("Signed in successfully");
          localStorage.setItem("samai_user_id", data.user?.id || "");
          localStorage.setItem("samai_user_role", role);
          localStorage.setItem("samai_user_name", data.user?.name || "");
          localStorage.setItem("samai_user_phone", data.user?.phone || "");
          localStorage.setItem("samai_last_login", String(Date.now()));
          saveUserCache({
            success: true,
            user: data.user,
            credentials: {
              utilityCustomer: null,
              consumptionProfile: null,
              generationProfile: null,
              storageProfile: null,
            },
            devices: [],
          });
          navigate("/onboarding");
        } catch (error) {
          console.error("Signup failed", error);
          alert("Signup failed. Please check your connection.");
        }
      }}
      onBack={() => navigate("/intent")}
    />
  );
};

export default VerifyPage;
