import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ChevronLeft, Upload, FileCheck, X } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/hooks/useAuth";
import SamaiLogo from "@/components/SamaiLogo";
import { useToast } from "@/hooks/use-toast";
import { resolveRequiredEnv } from "@/services/apiClient";
import { saveUser } from "@/services/userService";

const ONBOARDING_VC_KEY = "samai_onboarding_vc_done";

const OnboardingVCPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vcType, setVcType] = useState<"consumption" | "generation" | null>(null);
  const [wrongVCModal, setWrongVCModal] = useState(false);
  const [wrongVCMessage, setWrongVCMessage] = useState("");

  const getHomeRoute = () => {
    return userData?.intent === "buy" ? "/buyer-home" : "/home";
  };

  const detectVCType = (credential: any): "consumption" | "generation" | null => {
    const types = credential.type || [];
    const subjectType = credential.credentialSubject?.type;
    const credentialType = credential.credentialType || "";

    if (
      types.includes("ConsumptionProfileCredential") ||
      subjectType === "ConsumptionProfileCredential" ||
      credentialType.includes("Consumption")
    ) {
      return "consumption";
    } else if (
      types.includes("GenerationProfileCredential") ||
      subjectType === "GenerationProfileCredential" ||
      credentialType.includes("Generation")
    ) {
      return "generation";
    }
    return null;
  };

  const validateRequiredFields = (credential: any, type: "consumption" | "generation"): string[] => {
    const errors: string[] = [];
    const subject = credential.credentialSubject || {};

    // Common required fields for both types
    if (!subject.fullName) errors.push("Full name is missing");
    if (!subject.issuerName) errors.push("Issuer name is missing");

    if (type === "consumption") {
      if (!subject.meterNumber) errors.push("Meter number is missing");
      if (!subject.consumerNumber) errors.push("Consumer number is missing");
    } else if (type === "generation") {
      if (!subject.inverterNumber && !subject.systemId) errors.push("System ID or Inverter number is missing");
    }

    return errors;
  };

  const extractUserName = (credential: any): string | null => {
    return credential.credentialSubject?.fullName || null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".json")) {
        toast({
          title: "Invalid file format",
          description: "Please upload a JSON file",
          variant: "destructive",
        });
        return;
      }
      setUploadedFile(file);
    }
  };


  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    try {
      const content = await uploadedFile.text();
      let parsedData = JSON.parse(content);

      // Extract credential if wrapped
      let credential = parsedData;
      if (parsedData.credential && !parsedData.type) {
        credential = parsedData.credential;
      }

      const detectedType = detectVCType(credential);
      if (!detectedType) {
        toast({
          title: "Unsupported VC type",
          description: "Please upload a ConsumptionProfileCredential or GenerationProfileCredential",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate VC type matches user intent
      if (userData?.intent === "sell" && detectedType !== "generation") {
        setWrongVCMessage("As a seller, you can only upload Generation Profile credentials. Please choose a valid credential file.");
        setWrongVCModal(true);
        setUploadedFile(null);
        setIsLoading(false);
        return;
      }

      if (userData?.intent === "buy" && detectedType !== "consumption") {
        setWrongVCMessage("As a buyer, you can only upload Consumption Profile credentials. Please choose a valid credential file.");
        setWrongVCModal(true);
        setUploadedFile(null);
        setIsLoading(false);
        return;
      }

      // Validate required fields
      const validationErrors = validateRequiredFields(credential, detectedType);
      if (validationErrors.length > 0) {
        toast({
          title: "Missing required information",
          description: validationErrors.join(". ") + ". Please upload a valid credential.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Extract user name from credential
      const userName = extractUserName(credential);
      if (!userName) {
        toast({
          title: "Invalid credential",
          description: "Cannot extract name from credential. Please upload a valid credential.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setVcType(detectedType);

      // Get fresh Firebase token
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }

      // Call the backend API
      const BACKEND_URL = resolveRequiredEnv(import.meta.env.VITE_BACKEND_URL, "http://localhost:3002", "VITE_BACKEND_URL");
      const response = await fetch(`${BACKEND_URL}/api/vc/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to upload VC");
      }

      toast({
        title: "VC uploaded successfully",
        description: `${detectedType === "consumption" ? "Consumption" : "Generation"} credential saved`,
      });

      // Mark VC as pending verification and continue
      localStorage.setItem(ONBOARDING_VC_KEY, "true");
      localStorage.setItem("samai_onboarding_complete", "true");

      // Update user data with onboarding complete and extracted name
      setUserData({
        isVCVerified: false,
        onboardingComplete: true,
        name: userName
      });

      // Save onboarding completion and user name to Firestore
      if (userData?.phone && userData?.intent) {
        await saveUser({
          phone: userData.phone,
          intent: userData.intent,
          onboardingComplete: true,
          name: userName,
        } as any).catch(err => console.error("Failed to save onboarding completion:", err));
      }

      navigate(getHomeRoute(), { replace: true });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    localStorage.setItem(ONBOARDING_VC_KEY, "true");
    localStorage.setItem("samai_onboarding_complete", "true");

    // Mark onboarding as complete
    setUserData({ onboardingComplete: true });

    // Save onboarding completion to Firestore
    if (userData?.phone && userData?.intent) {
      await saveUser({
        phone: userData.phone,
        intent: userData.intent,
        onboardingComplete: true,
      } as any).catch(err => console.error("Failed to save onboarding completion:", err));
    }

    navigate(getHomeRoute(), { replace: true });
  };

  return (
    <div className="screen-container !py-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 animate-fade-in">
          <button
            onClick={() => navigate(-1)}
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
            Upload your credentials
          </h2>
          <p className="text-2xs text-muted-foreground mt-1">
            Add your electricity meter or solar system credentials to enable trading
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-card rounded-xl border border-border p-3 shadow-card space-y-3 flex-1 animate-slide-up">
          {/* Upload Area */}
          {!uploadedFile ? (
            <>
              <input
                id="vc-file-input"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />

              <button
                onClick={() => document.getElementById("vc-file-input")?.click()}
                disabled={isLoading}
                className="w-full py-6 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 flex flex-col items-center gap-2 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload size={20} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-foreground">
                    Click to upload credential
                  </p>
                  <p className="text-2xs text-muted-foreground mt-0.5">JSON file only</p>
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Selected File */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <FileCheck size={12} className="text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xs font-medium text-foreground truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-2xs text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  disabled={isLoading}
                  className="p-1 rounded-md hover:bg-destructive/10 transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  <X size={12} className="text-muted-foreground hover:text-destructive" />
                </button>
              </div>

              {/* Info Text */}
              <div className="px-2 py-1.5 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-2xs text-muted-foreground">
                  ✅ File ready to upload. Your credentials are encrypted and secure.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-auto pt-4 pb-6 animate-slide-up space-y-2" style={{ animationDelay: "0.1s" }}>
          {uploadedFile ? (
            <>
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50"
              >
                {isLoading ? "Uploading..." : "Upload credential"}
              </button>
              <button
                onClick={() => setUploadedFile(null)}
                disabled={isLoading}
                className="btn-outline-calm w-full text-sm !py-2.5 disabled:opacity-50"
              >
                Choose different file
              </button>
            </>
          ) : (
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="btn-outline-calm w-full text-sm !py-2.5 disabled:opacity-50"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>

      {/* Wrong VC Type Modal */}
      {wrongVCModal && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-lg animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Wrong Credential Type</h3>
              <button onClick={() => setWrongVCModal(false)}>
                <X size={18} className="text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Shield className="text-destructive" size={32} />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Invalid Credential</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {wrongVCMessage}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-border space-y-2">
              <button
                onClick={() => {
                  setWrongVCModal(false);
                  document.getElementById("vc-file-input")?.click();
                }}
                className="btn-solar w-full text-sm !py-2.5"
              >
                Upload Different Credential
              </button>
              <button
                onClick={() => setWrongVCModal(false)}
                className="btn-outline-calm w-full text-sm !py-2.5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingVCPage;
