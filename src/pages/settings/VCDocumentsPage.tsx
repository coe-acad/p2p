import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Shield } from "lucide-react";
import { useState } from "react";
import SamaiLogo from "@/components/SamaiLogo";
import VCUploadModal from "@/components/modals/VCUploadModal";

const VCDocumentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUploadModal, setShowUploadModal] = useState(true);
  const isOnboardingVerification = location.state?.fromVerification === true;

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    // Navigate to /tomorrow-trades directly after successful upload
    // The backend has already stored the VC, and the auto-redirect will work
    setTimeout(() => {
      navigate("/tomorrow-trades", { replace: true });
    }, 500);
  };

  return (
    <div className="screen-container !py-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 animate-fade-in">
          <button
            onClick={() => navigate(isOnboardingVerification ? "/verify" : "/profile")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Title */}
        <div className="text-center animate-slide-up mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-2">
            <Shield className="text-primary" size={22} />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            {isOnboardingVerification ? "Verify your electricity connection" : "Upload VC Documents"}
          </h2>
          <p className="text-2xs text-muted-foreground mt-1">
            {isOnboardingVerification
              ? "Upload your credentials to verify your connection"
              : "Upload your Verifiable Credentials"}
          </p>
        </div>

        {/* Upload Modal */}
        <VCUploadModal
          isOpen={showUploadModal}
          onClose={() => navigate(isOnboardingVerification ? "/verify" : "/profile")}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
};

export default VCDocumentsPage;
