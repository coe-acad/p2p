import { Shield, FileText, Copy, Upload, ChevronLeft, Trash2 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { resolveRequiredEnv } from "@/services/apiClient";
import { useState } from "react";
import VCUploadModal from "@/components/modals/VCUploadModal";

interface VCDetailsViewProps {
  onBack: () => void;
}

const VCDetailsView = ({ onBack }: VCDetailsViewProps) => {
  const { userData } = useUserData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const vcData = userData?.vc_data as any || {};
  const consumption = vcData?.consumption;
  const generation = vcData?.generation;
  const userIntent = userData?.intent; // "sell" or "buy"

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClearVC = async () => {
    if (!window.confirm("Are you sure you want to clear all VC data? You will need to re-upload your credentials.")) {
      return;
    }

    setIsClearing(true);
    try {
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }

      const BACKEND_URL = resolveRequiredEnv(import.meta.env.VITE_BACKEND_URL, "http://localhost:3002", "VITE_BACKEND_URL");
      const response = await fetch(`${BACKEND_URL}/api/vc/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If endpoint not found, show helpful message
        if (response.status === 404) {
          toast({
            title: "Clear feature coming soon",
            description: "The backend needs to restart. For now, just re-upload your VC to update it with all fields.",
            variant: "destructive",
          });
          return;
        }
        const error = await response.json();
        throw new Error(error.detail || "Failed to clear VC data");
      }

      toast({
        title: "VC data cleared",
        description: "You can now re-upload your credentials",
      });

      // Reload page to refresh VC status
      window.location.reload();
    } catch (error) {
      console.error("Error clearing VC:", error);
      toast({
        title: "Failed to clear VC",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const CredentialField = ({ label, value, fieldId }: { label: string; value: any; fieldId: string }) => {
    if (!value) return null;
    return (
      <div className="flex items-start justify-between gap-2 p-3 bg-muted/30 rounded-lg">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground mt-1">{value}</p>
        </div>
        <button
          onClick={() => copyToClipboard(String(value), fieldId)}
          className="p-1.5 rounded hover:bg-muted transition-colors flex-shrink-0"
          title="Copy to clipboard"
        >
          <Copy size={14} className={copiedField === fieldId ? "text-green-600" : "text-muted-foreground"} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold">VC Documents</h2>
      </div>

      {/* Consumption Credential - Only for buyers */}
      {consumption && userIntent === "buy" && (
        <div className="bg-card rounded-xl p-4 shadow-card border border-emerald-200/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FileText size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Consumption Profile</p>
              <p className="text-xs text-muted-foreground">Electricity meter credentials</p>
            </div>
          </div>

          <div className="space-y-2">
            <CredentialField label="Consumer Number" value={consumption.consumerNumber} fieldId="consumption-consumer" />
            <CredentialField label="Full Name" value={consumption.fullName} fieldId="consumption-name" />
            <CredentialField label="Meter Number" value={consumption.meterNumber} fieldId="consumption-meter" />
            <CredentialField label="Premises Type" value={consumption.premisesType} fieldId="consumption-premises" />
            <CredentialField label="Tariff Category Code" value={consumption.tariffCategoryCode} fieldId="consumption-tariff" />
            <CredentialField label="Sanctioned Load (kW)" value={consumption.sanctionedLoadKW} fieldId="consumption-load" />
            <CredentialField label="Connection Type" value={consumption.connectionType} fieldId="consumption-connection" />
            <CredentialField label="Issuer Name" value={consumption.issuerName} fieldId="consumption-issuer" />

            <div className="pt-2 border-t border-border/50 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Credential Information</p>
              <CredentialField label="VC ID" value={consumption.vcId} fieldId="consumption-vcid" />
              <CredentialField label="Issuance Date" value={consumption.issuanceDate} fieldId="consumption-issued" />
              <CredentialField label="Expiration Date" value={consumption.expirationDate} fieldId="consumption-expires" />
            </div>
          </div>
        </div>
      )}

      {/* Generation Credential - Only for sellers */}
      {generation && userIntent === "sell" && (
        <div className="bg-card rounded-xl p-4 shadow-card border border-orange-200/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <FileText size={16} className="text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Generation Profile</p>
              <p className="text-xs text-muted-foreground">Solar system credentials</p>
            </div>
          </div>

          <div className="space-y-2">
            <CredentialField label="Asset ID" value={generation.assetId} fieldId="generation-assetid" />
            <CredentialField label="Full Name" value={generation.fullName} fieldId="generation-name" />
            <CredentialField label="Capacity (kW)" value={generation.capacityKW} fieldId="generation-capacity" />
            <CredentialField label="Generation Type" value={generation.generationType} fieldId="generation-type" />
            <CredentialField label="Commissioning Date" value={generation.commissioningDate} fieldId="generation-commissioned" />
            <CredentialField label="Manufacturer" value={generation.manufacturer} fieldId="generation-manufacturer" />
            <CredentialField label="Model Number" value={generation.modelNumber} fieldId="generation-model" />
            <CredentialField label="Meter Number" value={generation.meterNumber} fieldId="generation-meter" />
            <CredentialField label="Consumer Number" value={generation.consumerNumber} fieldId="generation-consumer" />
            <CredentialField label="Issuer Name" value={generation.issuerName} fieldId="generation-issuer" />

            <div className="pt-2 border-t border-border/50 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Credential Information</p>
              <CredentialField label="VC ID" value={generation.vcId} fieldId="generation-vcid" />
              <CredentialField label="Issuance Date" value={generation.issuanceDate} fieldId="generation-issued" />
              <CredentialField label="Expiration Date" value={generation.expirationDate} fieldId="generation-expires" />
            </div>
          </div>
        </div>
      )}

      {/* No VC Uploaded */}
      {!consumption && !generation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <Shield size={24} className="text-blue-600" />
          </div>
          <p className="font-semibold text-blue-900 mb-2">No Credentials Uploaded</p>
          <p className="text-sm text-blue-700 mb-4">
            {userIntent === "sell"
              ? "Upload your solar system generation profile to start selling energy."
              : "Upload your electricity meter consumption profile to start buying energy."}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Upload size={16} />
            Upload {userIntent === "sell" ? "Generation" : "Consumption"} Credential
          </button>
        </div>
      )}

      {/* For Sellers: Only show generation VC option */}
      {userIntent === "sell" && generation && (
        <button
          onClick={handleClearVC}
          disabled={isClearing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
        >
          <Trash2 size={16} />
          {isClearing ? "Clearing..." : "Clear & Re-upload Generation VC"}
        </button>
      )}

      {/* For Buyers: Only show consumption VC option */}
      {userIntent === "buy" && consumption && (
        <button
          onClick={handleClearVC}
          disabled={isClearing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
        >
          <Trash2 size={16} />
          {isClearing ? "Clearing..." : "Clear & Re-upload Consumption VC"}
        </button>
      )}

      {/* VC Upload Modal */}
      <VCUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => setShowUploadModal(false)}
      />
    </div>
  );
};

export default VCDetailsView;
