import { useEffect, useRef, useState } from "react";
import { EnergyLoader } from "@/components/EnergyLoader";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, X, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { BorderBeam } from "border-beam";
import { useQueryClient } from "@tanstack/react-query";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { VC_STATUS_QUERY_KEY } from "@/hooks/useVCStatus";
import { BACKEND_URL } from "@/services/apiClient";
import { saveUser } from "@/services/userService";
import { Button } from "@/components/ui/button";
import SamaiLogo from "@/components/SamaiLogo";
import { credentialFullName, unwrapCredential } from "@/utils/vcCredential";

const ONBOARDING_VC_KEY = "samai_onboarding_vc_done";

const OnboardingVCPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const intent = userData?.intent;
  const homeRoute = intent === "buy" ? "/buyer-home" : "/home";
  const credentialLabel = intent === "buy" ? "Consumption" : "Generation";

  // Backstop guard: if Firestore says this user is already VC-verified,
  // never show the upload screen — bounce home immediately. This catches
  // any path that reaches /onboarding/vc by mistake.
  const isVCVerified = Boolean(userData?.is_vc_verified);
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
      let parsedData: unknown;
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

      const credential = unwrapCredential(parsedData);

      const token = await user?.getIdToken();
      if (!token) throw new Error("Unable to get authentication token");

      const response = await fetch(`${BACKEND_URL}/api/vc/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to upload credential.");
      }

      // Backend response tells us which VC bucket was written and what
      // fields it extracted. Mirror it into userData so the "Verification
      // required" banner clears immediately after re-upload without
      // needing a logout/login round-trip (was writing `isVCVerified` —
      // wrong field name and wrong value — leaving the banner stuck).
      const result: {
        vc_type?: string;
        stored_under?: string;
        fields?: Record<string, unknown>;
        is_vc_verified?: boolean;
      } = await response.json().catch(() => ({}));

      const vcBucket: "consumption" | "generation" =
        result.vc_type === "ConsumptionProfileCredential" ? "consumption" : "generation";
      const userName = credentialFullName(credential);

      toast({
        title: "Credential uploaded",
        description: `${credentialLabel} profile saved.`,
      });

      localStorage.setItem(ONBOARDING_VC_KEY, "true");
      localStorage.setItem("samai_onboarding_complete", "true");

      setUserData({
        is_vc_verified: result.is_vc_verified ?? true,
        vc_data: {
          ...(userData?.vc_data || {}),
          [vcBucket]: result.fields || { fullName: userName || "" },
        },
        onboardingComplete: true,
        ...(userName ? { name: userName } : {}),
      });

      if (userData?.phone && intent) {
        await saveUser({
          phone: userData.phone,
          intent,
          onboardingComplete: true,
          ...(userName ? { name: userName } : {}),
        }).catch((err) => console.error("Failed to save onboarding completion:", err));
      }

      await queryClient.invalidateQueries({ queryKey: VC_STATUS_QUERY_KEY });

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
    setUserData({ onboardingComplete: true });
    if (userData?.phone && intent) {
      await saveUser({
        phone: userData.phone,
        intent,
        onboardingComplete: true,
      }).catch((err) => console.error("Failed to save onboarding completion:", err));
    }
    navigate(homeRoute, { replace: true });
  };

  return (
    <div className="circuit-bg min-h-screen min-h-svh min-h-dvh flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-md flex flex-col gap-8 slide-up">
          <div className="flex justify-center">
            <SamaiLogo size="lg" showText={true} />
          </div>

          <div className="text-center">
            <p className="kicker-zap text-sm font-medium uppercase tracking-[0.18em] text-accent">
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
            // Soft breathing border (border-beam) invites the upload.
            <BorderBeam size="pulse-inner" colorVariant="ocean" theme={isDark ? "dark" : "light"} strength={0.6} borderRadius={12}>
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
                dragOver ? "border-primary bg-primary/[0.08]" : "border-border bg-primary/[0.04] hover:border-primary/40"
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
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
            </BorderBeam>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
              {isLoading ? (
                <EnergyLoader label="Verifying" />
              ) : (
                <>
                  Verify and continue
                  <Zap className="btn-zap fill-current" strokeWidth={0} />
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full bg-accent/10 font-semibold text-accent transition-colors duration-200
                         hover:bg-accent/15 hover:text-accent
                         focus-visible:bg-accent/15"
            >
              Skip for now
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You can browse the app without a credential, but you'll need to verify before placing a trade.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingVCPage;
