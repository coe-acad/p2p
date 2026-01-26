import ReturningUserScreen from "@/components/screens/ReturningUserScreen";
import { toast } from "@/components/ui/sonner";
import { saveUserCache } from "@/hooks/use-user";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const ReturningUserPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (phone: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bpp/onboarding/user/phone/${phone}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        console.error("Lookup failed", await response.text());
        toast.error("User not found. Please sign up.");
        return;
      }
      if (!contentType.includes("application/json")) {
        const bodyText = await response.text();
        console.error("Lookup failed: non-JSON response", bodyText);
        toast.error("Server returned an unexpected response. Check API base URL.");
        return;
      }
      const data = await response.json();
      localStorage.setItem("samai_user_id", data.user?.id || "");
      localStorage.setItem("samai_user_role", data.user?.role || "");
      localStorage.setItem("samai_user_name", data.user?.name || "");
      localStorage.setItem("samai_user_phone", data.user?.phone || "");
      localStorage.setItem("samai_last_login", String(Date.now()));
      saveUserCache(data);
      toast.success("Welcome back!");
      navigate("/home");
    } catch (error) {
      console.error("Lookup failed", error);
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReturningUserScreen
      onSubmit={handleSubmit}
      onBack={() => navigate("/")}
      isLoading={isLoading}
    />
  );
};

export default ReturningUserPage;
