import { useNavigate, useLocation } from "react-router-dom";
import PublishConfirmationScreen from "@/components/screens/PublishConfirmationScreen";

const PublishedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVCVerified = location.state?.isVCVerified ?? true;

  return (
    <PublishConfirmationScreen
      onGoHome={() => navigate("/home", { state: { isVCVerified, justPublished: true } })}
    />
  );
};

export default PublishedPage;
