import { useState } from "react";
import { Zap, Battery, Gauge, User, Check, ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface DeviceProfileScreenProps {
  onContinue: () => void;
  onBack: () => void;
  devices?: Array<{
    device?: {
      id?: string;
      type?: string;
      name?: string;
      meter_id?: string;
      status?: string;
    };
    credentialSubject?: Record<string, any>;
  }>;
}

const DeviceProfileScreen = ({ onContinue, onBack, devices = [] }: DeviceProfileScreenProps) => {
  const [confirmed, setConfirmed] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const mappedDevices = devices.length
    ? devices.map((item) => {
        const subject = item.credentialSubject || {};
        const typeLabel = item.device?.type || subject.type || "Device";
        const loweredType = String(typeLabel).toLowerCase();
        const isConsumption = loweredType.includes("consumption");
        const isGeneration = loweredType.includes("generation");
        const icon = isGeneration ? Zap : isConsumption ? Gauge : User;

        if (isConsumption) {
          const solarType = subject.solarType || subject.connectionType || subject.type || "Consumption";
          const meterNumber = subject.meterNumber || item.device?.meter_id || "";

          return {
            icon,
            title: solarType,
            detail: meterNumber ? `Meter ${meterNumber}` : "Meter unavailable",
            expanded: {
              fullName: subject.fullName,
              connectionType: subject.connectionType,
              meterNumber,
              sanctionedLoad: subject.sanctionedLoadKW,
              premisesType: subject.premisesType,
              tariffCategoryCode: subject.tariffCategoryCode,
            },
          };
        }

        if (isGeneration) {
          const generationType = subject.generationType || subject.storageType || subject.type || "Generation";
          const meterNumber = subject.meterNumber || item.device?.meter_id || "";
          const capacity =
            subject.capacity || subject.powerRatingKW || subject.storageCapacityKWh || subject.generationCapacityKW;

          return {
            icon,
            title: generationType,
            detail: meterNumber ? `Meter ${meterNumber}` : "Meter unavailable",
            expanded: {
              capacity,
              manufacturer: subject.manufacturer || subject.issuerName,
              assetId: subject.assetId,
              commissioningDate: subject.commissioningDate,
            },
          };
        }

        const fallbackDetail = [subject.meterNumber, subject.assetId].filter(Boolean).join(" • ");
        return {
          icon,
          title: item.device?.name || typeLabel,
          detail: fallbackDetail || "Credential linked",
          expanded: {
            type: typeLabel,
            meterNumber: subject.meterNumber || item.device?.meter_id || "",
            assetId: subject.assetId || "",
            fullName: subject.fullName || "",
          },
        };
      })
    : [];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="screen-container !py-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header with Back Button and Logo */}
        <div className="animate-slide-up mb-3">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <SamaiLogo size="sm" showText={false} />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-2xs text-muted-foreground">Step 2 of 3</span>
              <div className="flex gap-1">
                <div className="w-5 h-0.5 rounded-full bg-primary" />
                <div className="w-5 h-0.5 rounded-full bg-primary" />
                <div className="w-5 h-0.5 rounded-full bg-muted" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">We found your solar setup</h2>
          </div>
        </div>

        {/* Compact Device List */}
        <div className="bg-card rounded-xl border border-border shadow-card divide-y divide-border animate-slide-up mb-3" style={{ animationDelay: "0.1s" }}>
          {mappedDevices.map((device, index) => {
            const Icon = device.icon;
            const isExpanded = expandedIndex === index;
            
            return (
              <div key={index}>
                <button 
                  onClick={() => toggleExpand(index)}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/6 flex items-center justify-center">
                      <Icon className="text-primary" size={14} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-foreground">{device.title}</p>
                      <p className="text-2xs text-muted-foreground">{device.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xs text-accent bg-accent/8 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      Verified
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={12} className="text-muted-foreground" />
                    ) : (
                      <ChevronDown size={12} className="text-muted-foreground" />
                    )}
                  </div>
                </button>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 pt-1 bg-secondary/30 animate-slide-up">
                    <div className="space-y-0.5 text-2xs">
                      {Object.entries(device.expanded).filter(([, value]) => value).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-muted-foreground capitalize min-w-[80px]">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-foreground font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {mappedDevices.length === 0 && (
            <div className="p-3 text-xs text-muted-foreground text-center">No devices found yet.</div>
          )}
        </div>

        {/* Confirmation - Enhanced Checkbox Design */}
        <button 
          onClick={() => setConfirmed(!confirmed)}
          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all animate-slide-up text-left w-full ${
            confirmed 
              ? "border-primary bg-primary/5 shadow-sm" 
              : "border-border hover:border-primary/30 bg-card"
          }`}
          style={{ animationDelay: "0.2s" }}
        >
          <div 
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
              confirmed 
                ? "bg-primary shadow-sm" 
                : "border-2 border-input bg-background"
            }`}
          >
            {confirmed && <Check className="text-primary-foreground" size={14} strokeWidth={3} />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Confirm details to continue</span>
            <span className="text-2xs text-muted-foreground">I verify the above information is correct</span>
          </div>
        </button>

        {/* Fixed bottom CTA */}
        <div className="mt-auto pt-4 pb-6">
          <button
            onClick={onContinue}
            disabled={!confirmed}
            className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceProfileScreen;
