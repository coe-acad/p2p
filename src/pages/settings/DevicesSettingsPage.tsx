import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Zap, Battery, Gauge, Home } from "lucide-react";
import { useState } from "react";

const DevicesSettingsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceType = searchParams.get("type") || "inverter";

  const devicesMap: Record<string, {
    icon: typeof Zap;
    label: string;
    sublabel: string;
    details: { label: string; value: string }[];
  }> = {
    inverter: {
      icon: Zap,
      label: "Solar Inverter",
      sublabel: "Growatt • 5 kW",
      details: [
        { label: "Brand", value: "Growatt" },
        { label: "Model", value: "MIN 5000TL-X" },
        { label: "Capacity", value: "5 kW" },
        { label: "Type", value: "String Inverter" },
      ]
    },
    battery: {
      icon: Battery,
      label: "Battery",
      sublabel: "Luminous • 10 kWh",
      details: [
        { label: "Brand", value: "Luminous" },
        { label: "Model", value: "LPTT12150H" },
        { label: "Capacity", value: "10 kWh" },
        { label: "Type", value: "Lithium-Ion" },
      ]
    },
    meter: {
      icon: Gauge,
      label: "Smart Meter",
      sublabel: "Genus • Bi-directional",
      details: [
        { label: "Brand", value: "Genus" },
        { label: "Model", value: "GENUS-SM-01" },
        { label: "Type", value: "Bi-directional" },
        { label: "Connection", value: "RS485" },
      ]
    },
    profile: {
      icon: Home,
      label: "Home Profile",
      sublabel: "3 BHK • Residential",
      details: [
        { label: "Type", value: "Residential" },
        { label: "Size", value: "3 BHK" },
        { label: "Avg. Consumption", value: "450 kWh/month" },
        { label: "Peak Hours", value: "6 PM - 10 PM" },
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
