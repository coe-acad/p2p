 import { useNavigate, useLocation } from "react-router-dom";
 import EarningsHookScreen from "@/components/screens/EarningsHookScreen";
 
 const EarningsHookPage = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const isVCVerified = location.state?.isVCVerified ?? false;
 
   return (
     <EarningsHookScreen
       onContinue={() => navigate("/prepared", { state: { isVCVerified, fromOnboarding: true } })}
     />
   );
 };
 
 export default EarningsHookPage;