import { useState } from "react";
import { Upload, FileCheck, X, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

      // Call the backend API
      const BACKEND_URL = resolveRequiredEnv(import.meta.env.VITE_BACKEND_URL, "http://localhost:3002", "VITE_BACKEND_URL");
      const token = localStorage.getItem("firebaseToken");
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
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center">
              <Shield className="text-primary" size={24} />
            </div>
          </div>
          <DialogTitle>Upload your credentials</DialogTitle>
          <DialogDescription>
            Add your electricity meter or solar system credentials to enable trading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
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

          {/* Buttons */}
          <div className="flex gap-2">
            {uploadedFile ? (
              <>
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="flex-1 btn-solar text-sm !py-2 disabled:opacity-50"
                >
                  {isLoading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => setUploadedFile(null)}
                  disabled={isLoading}
                  className="flex-1 btn-outline-calm text-sm !py-2 disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="w-full btn-outline-calm text-sm !py-2"
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
