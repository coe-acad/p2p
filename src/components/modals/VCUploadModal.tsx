import { useState } from "react";
import { Upload, FileCheck, X, Shield } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, Typography } from "@mui/material";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { resolveRequiredEnv } from "@/services/apiClient";

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
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, textAlign: "center", pt: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield style={{ color: "#f59e0b", width: 28, height: 28 }} />
          </Box>
        </Box>
        Upload your credentials
      </DialogTitle>
      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
          Add your electricity meter or solar system credentials to enable trading
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {!uploadedFile ? (
            <>
              <input
                id="vc-modal-file-input"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                disabled={isLoading}
              />

              <Button
                onClick={() => document.getElementById("vc-modal-file-input")?.click()}
                disabled={isLoading}
                sx={{
                  width: "100%",
                  py: 4,
                  border: "2px dashed",
                  borderColor: "rgba(245, 158, 11, 0.4)",
                  bgcolor: "rgba(245, 158, 11, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                  textTransform: "none",
                  color: "text.primary",
                  "&:hover": {
                    bgcolor: "rgba(245, 158, 11, 0.1)",
                    borderColor: "rgba(245, 158, 11, 0.6)",
                  },
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={24} style={{ color: "#f59e0b" }} />
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Click to upload credential
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                    JSON file only • Max 10 MB
                  </Typography>
                </Box>
              </Button>
            </>
          ) : (
            <Box sx={{ borderRadius: 1.5, border: "2px solid", borderColor: "rgba(34, 197, 94, 0.2)", bgcolor: "rgba(34, 197, 94, 0.03)", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: "rgba(34, 197, 94, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileCheck size={20} style={{ color: "#22c55e" }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {uploadedFile.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Box>
                <Button
                  onClick={() => setUploadedFile(null)}
                  disabled={isLoading}
                  sx={{ p: 1, minWidth: "auto" }}
                >
                  <X size={16} />
                </Button>
              </Box>

              <Box sx={{ px: 1.5, py: 1, bgcolor: "rgba(34, 197, 94, 0.1)", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: "rgba(34, 197, 94, 0.8)", fontWeight: 600 }}>
                  ✓ File ready to upload. Your credentials are encrypted and secure.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        {uploadedFile ? (
          <>
            <Button
              onClick={handleUpload}
              disabled={isLoading}
              variant="contained"
              fullWidth
            >
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
            <Button
              onClick={() => setUploadedFile(null)}
              disabled={isLoading}
              variant="outlined"
              fullWidth
            >
              Back
            </Button>
          </>
        ) : (
          <Button
            onClick={handleClose}
            variant="outlined"
            fullWidth
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VCUploadModal;
