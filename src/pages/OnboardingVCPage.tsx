import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2, ShieldAlert, Upload, X } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { resolveRequiredEnv } from "@/services/apiClient";
import { saveUser } from "@/services/userService";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/BrandMark";

const ONBOARDING_VC_KEY = "samai_onboarding_vc_done";

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
  }
  if (
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

  if (!subject.fullName) errors.push("Full name is missing");
  if (!subject.issuerName) errors.push("Issuer name is missing");

  if (type === "consumption") {
    if (!subject.meterNumber) errors.push("Meter number is missing");
    if (!subject.consumerNumber) errors.push("Consumer number is missing");
  } else if (type === "generation") {
    if (!subject.inverterNumber && !subject.systemId) {
      errors.push("System ID or inverter number is missing");
    }
  }

  return errors;
};

const OnboardingVCPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [wrongVCModal, setWrongVCModal] = useState(false);
  const [wrongVCMessage, setWrongVCMessage] = useState("");

  const intent = (userData as any)?.intent;
  const homeRoute = intent === "buy" ? "/buyer-home" : "/home";
  const credentialLabel = intent === "buy" ? "Consumption" : "Generation";

  // Backstop guard: if Firestore says this user is already VC-verified,
  // never show the upload screen — bounce home immediately. This catches
  // any path that reaches /onboarding/vc by mistake.
  const isVCVerified = Boolean((userData as any)?.is_vc_verified);
  useEffect(() => {
    if (isVCVerified) {
      navigate(homeRoute, { replace: true });
    }
  }, [isVCVerified, homeRoute, navigate]);

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      toast({
        title: "Invalid file format",
        description: "Please upload a JSON file.",
        variant: "destructive",
      });
      return;
    }
    setUploadedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0] ?? undefined);
    // Reset the input so the same file can be re-selected after a clear.
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;
    setIsLoading(true);

    try {
      const content = await uploadedFile.text();
      let parsedData: any;
      try {
        parsedData = JSON.parse(content);
      } catch {
        toast({
          title: "Couldn't read file",
          description: "This doesn't appear to be valid JSON.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Some issuers wrap the credential one level deep.
      const credential = parsedData.credential && !parsedData.type ? parsedData.credential : parsedData;

      const detectedType = detectVCType(credential);
      if (!detectedType) {
        toast({
          title: "Unsupported credential type",
          description: "Upload a ConsumptionProfileCredential or GenerationProfileCredential.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (intent === "sell" && detectedType !== "generation") {
        setWrongVCMessage("Sellers must upload a Generation Profile credential. Please choose a valid file.");
        setWrongVCModal(true);
        setUploadedFile(null);
        setIsLoading(false);
        return;
      }
      if (intent === "buy" && detectedType !== "consumption") {
        setWrongVCMessage("Buyers must upload a Consumption Profile credential. Please choose a valid file.");
        setWrongVCModal(true);
        setUploadedFile(null);
        setIsLoading(false);
        return;
      }

      const validationErrors = validateRequiredFields(credential, detectedType);
      if (validationErrors.length > 0) {
        toast({
          title: "Missing required information",
          description: validationErrors.join(". ") + ".",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userName: string | null = credential.credentialSubject?.fullName || null;
      if (!userName) {
        toast({
          title: "Invalid credential",
          description: "Couldn't extract a name from the credential.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const token = await user?.getIdToken();
      if (!token) throw new Error("Unable to get authentication token");

      const BACKEND_URL = resolveRequiredEnv(
        import.meta.env.VITE_BACKEND_URL,
        "http://localhost:3002",
        "VITE_BACKEND_URL",
      );
      const response = await fetch(`${BACKEND_URL}/api/vc/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to upload credential.");
      }

      toast({
        title: "Credential uploaded",
        description: `${detectedType === "consumption" ? "Consumption" : "Generation"} profile saved.`,
      });

      localStorage.setItem(ONBOARDING_VC_KEY, "true");
      localStorage.setItem("samai_onboarding_complete", "true");

      setUserData({
        isVCVerified: false,
        onboardingComplete: true,
        name: userName,
      } as any);

      if (userData?.phone && intent) {
        await saveUser({
          phone: userData.phone,
          intent,
          onboardingComplete: true,
          name: userName,
        } as any).catch((err) => console.error("Failed to save onboarding completion:", err));
      }

      navigate(homeRoute, { replace: true });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Skip-for-now: lets the user enter the app in browse-only mode.
  // Marks onboarding "complete enough to browse" but does NOT set
  // isVCVerified — so action-level guards on /select still block them
  // until they upload a real VC.
  const handleSkip = async () => {
    localStorage.setItem(ONBOARDING_VC_KEY, "true");
    localStorage.setItem("samai_onboarding_complete", "true");
    setUserData({ onboardingComplete: true } as any);
    if (userData?.phone && intent) {
      await saveUser({
        phone: userData.phone,
        intent,
        onboardingComplete: true,
      } as any).catch((err) => console.error("Failed to save onboarding completion:", err));
    }
    navigate(homeRoute, { replace: true });
  };

  return (
    <div className="min-h-screen min-h-svh min-h-dvh flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-md flex flex-col gap-8 slide-up">
          <div className="flex justify-center">
            <BrandMark size="lg" />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Step 3 of 3
            </p>
            <h1 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
              Verify your {credentialLabel.toLowerCase()} credential
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We use your {credentialLabel} Profile credential to confirm your meter and discom. It takes about a minute.
            </p>
          </div>

          {!uploadedFile ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer ${
                dragOver ? "border-primary bg-primary/[0.04]" : "border-border bg-card hover:border-foreground/30"
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Upload className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Drop your credential here</p>
                <p className="mt-1 text-xs text-muted-foreground">JSON file · up to 1 MB</p>
              </div>
              <input
                ref={inputRef}
                id="vc-file-input"
                type="file"
                accept="application/json,.json"
                onChange={handleFileInputChange}
                className="sr-only"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground nums">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  disabled={isLoading}
                  aria-label="Remove file"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={handleUpload} disabled={!uploadedFile || isLoading} size="lg" className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "Verify and continue"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full text-muted-foreground transition-colors duration-200
                         hover:bg-accent/8 hover:text-foreground
                         focus-visible:bg-accent/10"
            >
              Skip for now
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You can browse the app without a credential, but you'll need to verify before placing a trade.
            </p>
          </div>
        </div>
      </main>

      {wrongVCModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 px-4 sm:items-center">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-card slide-up">
            <div className="flex flex-col items-center text-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">Wrong credential type</h2>
                <p className="mt-2 text-sm text-muted-foreground">{wrongVCMessage}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setWrongVCModal(false);
                  inputRef.current?.click();
                }}
                className="w-full"
              >
                Choose another file
              </Button>
              <Button variant="outline" onClick={() => setWrongVCModal(false)} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingVCPage;
