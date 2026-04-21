import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, FileCheck, X, Shield } from "lucide-react";
import { useState, useRef } from "react";
import SamaiLogo from "@/components/SamaiLogo";
import { useUserData } from "@/hooks/useUserData";

const VCDocumentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserData } = useUserData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const isOnboardingVerification = location.state?.fromVerification === true;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setUserData({
      isVCVerified: true,
      vcVerifiedAt: new Date().toISOString(),
    });

    navigate("/success", {
      state: {
        afterVCVerification: true,
        isVCVerified: true,
      },
    });
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
              ? "Upload DISCOM verifiable credentials to verify your connection"
              : "Upload your DISCOM Verifiable Credentials"}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-card rounded-xl border border-border p-3 shadow-card space-y-3 flex-1 animate-slide-up">
          {/* Upload Area */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.json,.jpg,.jpeg,.png"
            onChange={handleUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload size={20} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-foreground">Click to upload documents</p>
              <p className="text-2xs text-muted-foreground mt-0.5">PDF, JSON, JPG, PNG</p>
            </div>
          </button>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Uploaded files ({uploadedFiles.length})
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <FileCheck size={12} className="text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-2xs font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-2xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 rounded-md hover:bg-destructive/10 transition-colors flex-shrink-0"
                    >
                      <X size={12} className="text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Text */}
          <div className="px-2 py-1.5 bg-accent/5 rounded-lg border border-accent/20">
            <p className="text-2xs text-muted-foreground">
              🔒 Your documents are encrypted and secure. We'll verify them instantly.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-auto pt-4 pb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {uploadedFiles.length > 0 ? (
            <button
              onClick={handleSubmit}
              className="btn-solar w-full text-sm !py-2.5"
            >
              {isOnboardingVerification ? "Verify and continue" : "Submit Documents"}
            </button>
          ) : (
            <button
              onClick={() => navigate(isOnboardingVerification ? "/verify" : "/profile")}
              className="btn-outline-calm w-full text-sm !py-2.5"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VCDocumentsPage;
