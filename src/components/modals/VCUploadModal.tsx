import { useState } from "react";
import { CheckCircle, FileCheck, Shield, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { resolveRequiredEnv } from "@/services/apiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VCUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const VCUploadModal = ({ isOpen, onClose, onSuccess }: VCUploadModalProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { userData } = useUserData();
  const userIntent = userData?.intent;

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

  const detectVCType = (credential: any): "consumption" | "generation" | null => {
    // Try multiple field names for credential type
    const types = credential.type || [];
    const subjectType = credential.credentialSubject?.type;
    const credentialType = credential.credentialType || "";
    const credentialTypeString = JSON.stringify(credential).toLowerCase();

    console.log("🔎 Checking for consumption indicators...");
    if (
      types.includes("ConsumptionProfileCredential") ||
      subjectType === "ConsumptionProfileCredential" ||
      credentialType.includes("Consumption") ||
      credentialTypeString.includes("consumption")
    ) {
      console.log("✅ Found: Consumption");
      return "consumption";
    }

    console.log("🔎 Checking for generation indicators...");
    if (
      types.includes("GenerationProfileCredential") ||
      subjectType === "GenerationProfileCredential" ||
      credentialType.includes("Generation") ||
      credentialTypeString.includes("generation")
    ) {
      console.log("✅ Found: Generation");
      return "generation";
    }

    console.log("⚠️ Could not determine type from:", {
      types,
      subjectType,
      credentialType,
      allKeys: Object.keys(credential).slice(0, 5),
    });
    return null;
  };

  const handleUpload = async () => {
    console.log("🔵 Upload button clicked, file:", uploadedFile?.name);
    if (!uploadedFile) {
      console.log("❌ No file selected");
      return;
    }

    setIsLoading(true);
    try {
      console.log("📖 Reading file content...");
      const content = await uploadedFile.text();
      console.log("📝 File content read, parsing JSON...");
      let parsedData = JSON.parse(content);
      console.log("✅ JSON parsed successfully");

      // Extract credential if it's wrapped in { credential: {...}, credentialSchemaId: ..., createdAt: ... }
      let credential = parsedData;
      if (parsedData.credential && !parsedData.type) {
        // If top level has 'credential' key but no 'type' (meaning this is the wrapper), extract it
        console.log("📦 Detected wrapped format, extracting credential from wrapper");
        credential = parsedData.credential;
      }
      console.log("🔐 Extracted credential keys:", Object.keys(credential).slice(0, 8));
      console.log("🔐 Credential type array:", credential.type);

      console.log("🔍 Detecting VC type from credential...");
      const detectedType = detectVCType(credential);
      console.log("📌 Detected type:", detectedType);

      if (!detectedType) {
        console.log("❌ VC type not recognized. Credential types:", credential.type);
        console.log("Credential subject type:", credential.credentialSubject?.type);
        toast({
          title: "Unsupported VC type",
          description: "Please upload a ConsumptionProfileCredential or GenerationProfileCredential",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      console.log("✅ VC type recognized:", detectedType);

      // Validate VC type matches user intent
      if (userIntent === "sell" && detectedType !== "generation") {
        toast({
          title: "Wrong credential type",
          description: "As a seller, you can only upload Generation Profile credentials",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (userIntent === "buy" && detectedType !== "consumption") {
        toast({
          title: "Wrong credential type",
          description: "As a buyer, you can only upload Consumption Profile credentials",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get fresh Firebase token
      console.log("🔐 Getting Firebase token...");
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      console.log("✅ Token obtained");

      // Call the backend API
      const BACKEND_URL = resolveRequiredEnv(import.meta.env.VITE_BACKEND_URL, "http://localhost:3002", "VITE_BACKEND_URL");
      console.log("🚀 Uploading to:", `${BACKEND_URL}/api/vc/upload`);
      console.log("📤 Sending credential to backend:", {
        hasType: !!credential.type,
        typeValue: credential.type,
        credentialKeys: Object.keys(credential).slice(0, 5),
      });
      const requestBody = JSON.stringify({ credential });
      console.log("📦 Request body size:", requestBody.length, "bytes");

      const response = await fetch(`${BACKEND_URL}/api/vc/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: requestBody,
      });

      console.log("📍 Response status:", response.status);
      if (!response.ok) {
        const error = await response.json();
        console.error("❌ API error:", error);
        throw new Error(error.detail || "Failed to upload VC");
      }
      console.log("✅ Upload successful");

      console.log("🎉 Success! VC uploaded successfully");
      toast({
        title: "VC uploaded successfully",
        description: `${detectedType === "consumption" ? "Consumption" : "Generation"} credential saved`,
      });

      setUploadedFile(null);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("❌ Upload error:", error);
      const errorMsg = error instanceof Error ? error.message : "Please try again";
      console.log("📢 Showing toast with error:", errorMsg);
      toast({
        title: "Upload failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      console.log("🔄 Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    onClose();
  };

  // Persona-by-color: buyer = green identity, seller = blue identity.
  const isBuyer = userIntent === "buy";
  const tone = isBuyer
    ? {
        tile: "bg-accent/10 text-accent",
        dashedBorder: "border-accent/40 hover:border-accent/60",
        dashedBg: "bg-accent/[0.04] hover:bg-accent/[0.08]",
        innerTile: "bg-accent/15 group-hover:bg-accent/20 text-accent",
      }
    : {
        tile: "bg-primary/10 text-primary",
        dashedBorder: "border-primary/40 hover:border-primary/60",
        dashedBg: "bg-primary/[0.04] hover:bg-primary/[0.08]",
        innerTile: "bg-primary/15 group-hover:bg-primary/20 text-primary",
      };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-3 flex justify-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${tone.tile}`}>
              <Shield className="h-7 w-7" />
            </div>
          </div>
          <DialogTitle className="text-xl">Upload your credentials</DialogTitle>
          <DialogDescription className="text-sm">
            Add your electricity meter or solar system credentials to enable trading.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {!uploadedFile ? (
            <>
              <input
                id="vc-modal-file-input"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />

              <button
                onClick={() => document.getElementById("vc-modal-file-input")?.click()}
                disabled={isLoading}
                className={`group flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed
                            ${tone.dashedBorder} ${tone.dashedBg}
                            py-8 transition-colors duration-200 disabled:opacity-50`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone.innerTile} transition-colors`}>
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Click to upload credential
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">JSON file only · Max 10 MB</p>
                </div>
              </button>
            </>
          ) : (
            // Selected file — green success card (semantic, regardless of persona)
            <div className="space-y-3 rounded-xl border border-accent/25 bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {uploadedFile.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground nums">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  disabled={isLoading}
                  aria-label="Remove file"
                  className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-accent/15 bg-accent/[0.06] px-3 py-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                <p className="text-xs text-foreground">
                  File ready to upload. Your credentials are encrypted and secure.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            {uploadedFile ? (
              <>
                <Button
                  onClick={() => setUploadedFile(null)}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Uploading…" : "Upload"}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose} variant="outline" className="w-full">
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VCUploadModal;
