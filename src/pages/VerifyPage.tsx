import VerificationScreen from "@/components/screens/VerificationScreen";
import { useNavigate, useLocation } from "react-router-dom";
import { usePublishedTrades, type ConfirmedTrade } from "@/hooks/usePublishedTrades";

// Generate mock 30-day trading history for returning users
const generateReturningUserData = () => {
  const confirmedTrades: ConfirmedTrade[] = [];
  
  // Generate trades for past 30 days
  for (let day = 0; day < 30; day++) {
    // 2-4 trades per day
    const tradesPerDay = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < tradesPerDay; i++) {
      const hour = 6 + Math.floor(Math.random() * 12); // 6 AM to 6 PM
      const kWh = 2 + Math.floor(Math.random() * 6); // 2-7 kWh
      const rate = 6 + Math.random(); // ₹6-7 per unit
      confirmedTrades.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        kWh,
        rate: Math.round(rate * 10) / 10,
        earnings: Math.round(kWh * rate),
        buyer: ["BESCOM Grid", "Neighbour - Flat 3B", "Community Pool"][Math.floor(Math.random() * 3)],
      });
    }
  }
  
  return { confirmedTrades };
};

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intent = location.state?.intent || "sell";
  const isReturningUser = location.state?.isReturningUser || false;
  const { confirmTrades, setShowConfirmedTrades } = usePublishedTrades();

  const handleVerified = () => {
    if (isReturningUser) {
      // Returning user - populate with 30 days of trading history and go to home
      const { confirmedTrades } = generateReturningUserData();
      confirmTrades(confirmedTrades);
      setShowConfirmedTrades(true);
      
      // Mark onboarding as complete for returning users
      localStorage.setItem("samai_onboarding_complete", "true");
      localStorage.setItem("samai_aadhaar_verified", "true");
      // Mark all onboarding steps as done (removes setup banner)
      localStorage.setItem("samai_onboarding_location_done", "true");
      localStorage.setItem("samai_onboarding_devices_done", "true");
      localStorage.setItem("samai_onboarding_talk_done", "true");
      
      // Set Jyotirmayee's profile data for returning users
      const returningUserContext = "आई एम ए स्कूल टीचर मेरे लिए स्कूल इंपॉर्टेंट है मैं 5 दिन स्कूल चलाती हूं 5 दिन सुबह से शाम तक बिजली का इस्तेमाल होता है ज्यादातर पंख लाइट एक्स्ट्रा सैटरडे संडे को स्कूल की छुट्टी होती है";
      const currentData = JSON.parse(localStorage.getItem("samai_user_data") || "{}");
      localStorage.setItem("samai_user_data", JSON.stringify({ 
        ...currentData, 
        name: "Jyotirmayee",
        phone: "+91 97697 21566",
        address: "abc street, Delhi, India",
        city: "Delhi, India",
        discom: "TPDDL",
        consumerId: "80000190017",
        upiId: "jyotirmayee@upi",
        userContext: returningUserContext,
        automationLevel: "auto",
        isReturningUser: true,
        isVCVerified: true
      }));
      
      navigate("/home", { replace: true });
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
