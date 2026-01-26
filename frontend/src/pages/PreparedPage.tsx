import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useForecast } from "@/hooks/use-forecast";
import { useUser } from "@/hooks/use-user";
import PreparedTomorrowScreen from "@/components/screens/PreparedTomorrowScreen";

const PreparedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVCVerified = location.state?.isVCVerified ?? false;
  const { forecastWindows: cachedWindows } = useForecast();
  const { devices } = useUser();
  const forecastWindows = location.state?.forecastWindows || cachedWindows || [];
  const [isPublishing, setIsPublishing] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  const handlePublish = async () => {
    if (isPublishing) return;
    const userId = localStorage.getItem("samai_user_id");
    if (!userId) {
      alert("Missing user ID. Please sign in again.");
      return;
    }

    const meterId = "der://meter/atria-meter-001";

    const buildCatalogueItems = () =>
      forecastWindows.map((window, index) => ({
        id: `item_${Date.now()}_${index + 1}`,
        name: "Solar Energy",
        price: Number((window.price_per_unit || 0).toFixed(2)),
        unit: "kWh",
        available_quantity: Number((window.total_units || 0).toFixed(2)),
        meter_id: meterId || undefined,
        start_time: window.start_time || (window.from_timestamp ? new Date(window.from_timestamp * 1000).toISOString() : undefined),
        end_time: window.end_time || (window.to_timestamp ? new Date(window.to_timestamp * 1000).toISOString() : undefined),
      }));

    try {
      setIsPublishing(true);
      const response = await fetch(`${API_BASE_URL}/api/bpp/catalogue/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          catalogue: {
            id: `catalogue_${Date.now()}`,
            name: "Solar Energy Listing",
            items: buildCatalogueItems(),
          },
        }),
      });

      if (!response.ok) {
        console.error("Publish failed", await response.text());
        alert("Publish failed. Please try again.");
        return;
      }

      navigate("/published", { state: { isVCVerified } });
    } catch (error) {
      console.error("Publish failed", error);
      alert("Publish failed. Please check your connection.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <PreparedTomorrowScreen
      isVCVerified={isVCVerified}
      forecastWindows={forecastWindows}
      onLooksGood={handlePublish}
      onBack={() => navigate("/home")}
      onViewAdjust={() => navigate("/dashboard")}
      onTalkToSamai={() => navigate("/onboarding/talk", { state: { isVCVerified } })}
      onVerifyNow={() => navigate("/onboarding/location")}
    />
  );
};

export default PreparedPage;
