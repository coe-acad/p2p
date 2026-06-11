import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { resolveRequiredEnv } from "@/services/apiClient";
import { saveUser } from "@/services/userService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { unwrapCredential } from "@/utils/vcCredential";

interface VCUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const VCUploadModal = ({ isOpen, onClose, onSuccess }: VCUploadModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { userData, setUserData } = useUserData();

  const intent = (userData as any)?.intent;
  const credentialLabel = intent === "buy" ? "Consumption" : "Generation";

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

      const credential = unwrapCredential(parsedData);

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

      const userName: string | null = credential.credentialSubject?.fullName || null;

      toast({
        title: "Credential uploaded",
        description: `${credentialLabel} profile saved.`,
      });

      setUserData({
        isVCVerified: false,
        ...(userName ? { name: userName } : {}),
      } as any);

      if (userData?.phone && intent && userName) {
        await saveUser({
          phone: userData.phone,
          intent,
          name: userName,
        } as any).catch((err) => console.error("Failed to save credential name:", err));
      }

      setUploadedFile(null);
      onSuccess?.();
      onClose();
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

  const handleClose = () => {
    setUploadedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Verify your {credentialLabel.toLowerCase()} credential
          </DialogTitle>
          <DialogDescription className="text-sm">
            We use your {credentialLabel} Profile credential to confirm your meter and discom. It takes about a minute.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
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

          <Button onClick={handleUpload} disabled={!uploadedFile || isLoading} size="lg" className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : "Verify and continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VCUploadModal;
