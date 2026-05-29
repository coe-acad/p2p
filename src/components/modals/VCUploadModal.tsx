import { useState } from "react";
import { Upload, FileCheck, X, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { resolveRequiredEnv } from "@/services/apiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    const types = credential.type || [];
    const subjectType = credential.credentialSubject?.type;

    if (
      types.includes("ConsumptionProfileCredential") ||
      subjectType === "ConsumptionProfileCredential"
    ) {
      return "consumption";
    } else if (
      types.includes("GenerationProfileCredential") ||
      subjectType === "GenerationProfileCredential"
    ) {
      return "generation";
    }
    return null;
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    try {
      const content = await uploadedFile.text();
      const credential = JSON.parse(content);

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

      setUploadedFile(null);
      onSuccess?.();
      onClose();
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

  const handleClose = () => {
    setUploadedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="text-primary" size={28} />
            </div>
          </div>
          <DialogTitle className="text-xl">Upload your credentials</DialogTitle>
          <DialogDescription className="text-sm">
            Add your electricity meter or solar system credentials to enable trading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
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
                className="w-full py-8 rounded-xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 hover:border-primary/60 transition-all duration-300 flex flex-col items-center gap-3 disabled:opacity-50 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload size={24} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Click to upload credential
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JSON file only • Max 10 MB</p>
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Selected File - Success State */}
              <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <FileCheck size={20} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    disabled={isLoading}
                    className="p-2 rounded-lg hover:bg-emerald-100/50 transition-colors flex-shrink-0 disabled:opacity-50"
                  >
                    <X size={16} className="text-muted-foreground hover:text-destructive" />
                  </button>
                </div>

                {/* Success Message */}
                <div className="px-3 py-2 bg-emerald-100/40 rounded-lg border border-emerald-200/60">
                  <p className="text-xs text-emerald-700 font-medium">
                    ✓ File ready to upload. Your credentials are encrypted and secure.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            {uploadedFile ? (
              <>
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="flex-1 btn-solar text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-all"
                >
                  {isLoading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => setUploadedFile(null)}
                  disabled={isLoading}
                  className="flex-1 btn-outline-calm text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-all"
                >
                  Back
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="w-full btn-outline-calm text-sm font-semibold py-2.5 rounded-lg transition-all"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VCUploadModal;
