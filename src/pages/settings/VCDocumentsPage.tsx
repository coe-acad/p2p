import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, FileCheck, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { uploadVcDocuments } from "@/api/vcUpload";
import { getUserProfile } from "@/api/users";
import { useUserData } from "@/hooks/useUserData";
import { markEarningsModalPending, saveEarningsSuggestion } from "@/utils/earningsSuggestion";

const VCDocumentsPage = () => {
  const navigate = useNavigate();
  const { setUserData } = useUserData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const getMobileNumber = () => localStorage.getItem("samai_mobile_number") || "";

  useEffect(() => {
    const mobileNumber = getMobileNumber();
    if (!mobileNumber) return;
    const cached = localStorage.getItem("samai_vc_uploaded_files");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setExistingFiles(parsed);
          return;
        }
      } catch {
        // ignore cache parse errors
      }
    }
    (async () => {
      try {
        const profile = await getUserProfile(mobileNumber);
        const files = (profile.documents || [])
          .map(doc => doc?.vc_type)
          .filter(Boolean);
        if (files.length) {
          setExistingFiles(files);
          localStorage.setItem("samai_vc_uploaded_files", JSON.stringify(files));
        }
      } catch (error) {
        console.error("Failed to fetch uploaded VC files:", error);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const mobileNumber = getMobileNumber();
      if (!mobileNumber) {
        setSubmitError("Mobile number not found. Please verify your phone first.");
        return;
      }
      await uploadVcDocuments(uploadedFiles, mobileNumber);
      const profile = await getUserProfile(mobileNumber);
      const mergedData = profile.merged || {};

      if (profile.is_vc_verified) {
        const files = (profile.documents || [])
          .map(doc => doc?.vc_type)
          .filter(Boolean);
        if (files.length) {
          setExistingFiles(files);
          localStorage.setItem("samai_vc_uploaded_files", JSON.stringify(files));
        }
        localStorage.setItem("samai_vc_data", JSON.stringify(mergedData));
        saveEarningsSuggestion(mergedData as Record<string, unknown>);
        markEarningsModalPending();
        setUserData({
          name: mergedData.fullName || profile.user?.name || "",
          address: mergedData.address || "",
          discom: mergedData.issuerName || "",
          consumerId: mergedData.consumerNumber || "",
          isVCVerified: true,
        });
        setUploadedFiles([]);
        navigate("/home", { replace: true, state: { isVCVerified: true } });
      } else {
        setSubmitError("Verification incomplete. Please upload all required VC documents.");
        return;
      }
      setSubmitSuccess(true);
    } catch (error) {
      console.error("VC upload failed:", error);
      const details = (error as any)?.details;
      if (typeof details === "string") {
        setSubmitError(details);
      } else if (details?.missing_types) {
        const missing = details.missing_types.join(", ");
        const duplicates = details.duplicate_types?.length
          ? ` Duplicate types: ${details.duplicate_types.join(", ")}.`
          : "";
        setSubmitError(`Missing required VC(s): ${missing}.${duplicates}`);
      } else if (details?.message) {
        setSubmitError(details.message);
      } else {
        setSubmitError("Upload failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <div className="w-full max-w-md flex flex-col gap-5 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button 
            onClick={() => navigate("/profile")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">VC Documents</h1>
        </div>

        {/* Info */}
        <p className="text-sm text-muted-foreground animate-fade-in">
          Upload your DISCOM Verifiable Credentials (Connection VC + Consumer or Generation VC)
        </p>

        {/* Uploaded Docs Summary */}
        {existingFiles.length > 0 && (
          <div className="space-y-2 animate-slide-up">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Verified Documents ({existingFiles.length})
            </p>
            {existingFiles.map((name, index) => (
              <div 
                key={`${name}-${index}`}
                className="flex items-center justify-between bg-card rounded-xl p-3 shadow-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileCheck size={16} className="text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate max-w-[220px]">{name}</p>
                    <p className="text-xs text-muted-foreground">Verified</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json,.pdf,application/json,application/pdf"
          onChange={handleUpload}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-8 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 flex flex-col items-center gap-3 animate-slide-up"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload size={24} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Tap to upload files</p>
            <p className="text-xs text-muted-foreground mt-1">JSON or PDF • Multiple files allowed</p>
          </div>
        </button>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 animate-slide-up">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Uploaded ({uploadedFiles.length})
            </p>
            {uploadedFiles.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between bg-card rounded-xl p-3 shadow-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileCheck size={16} className="text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <X size={16} className="text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 animate-slide-up">
            <button className="btn-solar w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Submit Documents"}
            </button>
            {submitError && (
              <p className="text-xs text-destructive">{submitError}</p>
            )}
            {submitSuccess && (
              <p className="text-xs text-accent">Documents uploaded successfully.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VCDocumentsPage;
