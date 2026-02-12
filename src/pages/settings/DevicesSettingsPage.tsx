import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Zap, Battery, Gauge, Home } from "lucide-react";
import { useUserData, extractLocality } from "@/hooks/useUserData";
import { VCExtractedData } from "@/utils/vcPdfParser";

const DevicesSettingsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceType = searchParams.get("type") || "inverter";
  const { userData } = useUserData();

  const isVerified = Boolean(userData.isVCVerified);
  const vcRaw = isVerified ? localStorage.getItem("samai_vc_data") : null;
  let vcData: VCExtractedData | null = null;
  if (vcRaw) {
    try {
      vcData = JSON.parse(vcRaw);
    } catch {
      vcData = null;
    }
  }

  const withUnit = (value: string | undefined, unit: string) => {
    if (!value) return "—";
    return /[a-zA-Z]/.test(value) ? value : `${value} ${unit}`;
  };

  const locality = extractLocality(vcData?.address || userData.address);
  const nameValue = vcData?.fullName || userData.name || "—";
  const discomValue = vcData?.issuerName || userData.discom || "—";

  const devicesMap: Record<string, {
    icon: typeof Zap;
    label: string;
    sublabel: string;
    details: { label: string; value: string }[];
  }> = {
    inverter: {
      icon: Zap,
      label: "Solar Inverter",
      sublabel: isVerified ? (vcData?.generationCapacity ? `Solar • ${withUnit(vcData.generationCapacity, "kW")}` : "—") : "—",
      details: [
        { label: "Brand", value: vcData?.manufacturer || "—" },
        { label: "Model", value: vcData?.modelNumber || "—" },
        { label: "Capacity", value: withUnit(vcData?.generationCapacity, "kW") },
        { label: "Type", value: vcData?.generationType || "—" },
      ]
    },
    battery: {
      icon: Battery,
      label: "Battery",
      sublabel: isVerified ? (vcData?.batteryCapacity ? `Storage • ${vcData.batteryCapacity}` : "—") : "—",
      details: [
        { label: "Brand", value: "—" },
        { label: "Model", value: "—" },
        { label: "Capacity", value: vcData?.batteryCapacity || "—" },
        { label: "Type", value: "—" },
      ]
    },
    meter: {
      icon: Gauge,
      label: "Smart Meter",
      sublabel: isVerified ? ([vcData?.issuerName, vcData?.meterNumber].filter(Boolean).join(" • ") || "—") : "—",
      details: [
        { label: "DISCOM", value: discomValue },
        { label: "Consumer ID", value: vcData?.consumerNumber || "—" },
        { label: "Meter ID", value: vcData?.meterNumber || "—" },
        { label: "Customer Type", value: vcData?.premisesType || "—" },
      ]
    },
    profile: {
      icon: Home,
      label: "Home Profile",
      sublabel: isVerified ? ([nameValue, locality].filter(Boolean).join(", ") || "—") : "—",
      details: [
        { label: "Name", value: nameValue },
        { label: "DISCOM", value: discomValue },
        { label: "Address", value: vcData?.address || userData.address || "—" },
        { label: "Connection Date", value: vcData?.serviceConnectionDate || "—" },
      ]
    },
  };

  const device = devicesMap[deviceType];
  const Icon = device?.icon || Zap;

  if (!device) {
    return null;
  }

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <div className="w-full max-w-md flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button 
            onClick={() => navigate("/profile")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{device.label}</h1>
        </div>

        {/* Device Details Card */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
          <div className="p-4 flex items-center gap-3 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{device.label}</p>
              <p className="text-xs text-muted-foreground">{device.sublabel}</p>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {device.details.map((detail, dIndex) => (
                <div key={dIndex}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{detail.label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{detail.value}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesSettingsPage;
