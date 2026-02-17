 import { useNavigate, useLocation } from "react-router-dom";
 import CalculatingScreen from "@/components/screens/CalculatingScreen";
 
 const CalculatingPage = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const isVCVerified = location.state?.isVCVerified ?? false;
 
   return (
     <CalculatingScreen
       onComplete={() => navigate("/earnings", { state: { isVCVerified } })}
     />
   );
 };
 
 export default CalculatingPage;
