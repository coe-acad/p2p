import { useState } from "react";
import { Zap, Battery, Gauge, User, Check, ChevronDown, ChevronUp, ChevronLeft, Sun, Sparkles, Cpu } from "lucide-react";
import SamaiLogo from "../SamaiLogo";
import { useUserData, extractLocality } from "@/hooks/useUserData";

interface LocationData {
  address?: string;
  city?: string;
  discom?: string;
}

interface DeviceProfileScreenProps {
  locationData?: LocationData;
  onContinue: () => void;
  onBack: () => void;
}

const DeviceProfileScreen = ({ locationData, onContinue, onBack }: DeviceProfileScreenProps) => {
  const { userData } = useUserData();
  const [confirmed, setConfirmed] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const isVerified = Boolean(userData.isVCVerified);
  const placeholder = "—";

  // Use location data from route state (step 1) or fallback to userData
  const address = isVerified ? (locationData?.address || userData.address) : "";
  const city = isVerified ? (locationData?.city || userData.city) : "";
  const locality = isVerified ? extractLocality(address) : "";

  const devices = [
    { 
      icon: Zap, 
      title: "Solar Inverter", 
      detail: placeholder,
      expanded: {
        brand: placeholder,
        model: placeholder,
        capacity: placeholder,
        installDate: placeholder,
        serialNo: placeholder
      }
    },
    { 
      icon: Battery, 
      title: "Battery", 
      detail: placeholder,
      expanded: {
        brand: placeholder,
        model: placeholder,
        capacity: placeholder,
        cycles: placeholder,
        warranty: placeholder
      }
    },
    { 
      icon: Gauge, 
      title: "Smart Meter", 
      detail: placeholder,
      expanded: {
        brand: placeholder,
        type: placeholder,
        meterNo: placeholder,
        sanctionedLoad: placeholder,
        phase: placeholder
      }
    },
    { 
      icon: User, 
      title: "Profile", 
      detail: isVerified ? [userData.name, locality].filter(Boolean).join(", ") : placeholder,
      expanded: {
        name: isVerified ? (userData.name || placeholder) : placeholder,
        address: isVerified ? (address || placeholder) : placeholder,
        city: isVerified ? (city || placeholder) : placeholder,
        consumerId: isVerified ? (userData.consumerId || placeholder) : placeholder,
        tariff: placeholder
      }
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="screen-container !py-4 relative overflow-hidden">
      {/* Background gradient effects - Vibrant & Warm */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top warm sunlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-teal-300/25 via-green-200/15 to-transparent rounded-full blur-3xl" />
        
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_4s_ease-in-out_infinite]" />
        
        {/* Colorful accent orbs */}
        <div className="absolute top-1/3 -left-20 w-[200px] h-[200px] bg-gradient-to-br from-teal-400/15 to-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/2 -right-16 w-[180px] h-[180px] bg-gradient-to-bl from-orange-400/12 to-amber-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
        
        {/* Decorative icons */}
        <div className="absolute top-14 right-6 text-teal-400/15">
          <Cpu size={32} className="animate-[pulse_6s_ease-in-out_infinite]" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-24 left-8 w-1.5 h-1.5 bg-gradient-to-br from-teal-400 to-green-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-lg shadow-teal-400/30" />
        <div className="absolute bottom-32 right-12 w-1.5 h-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full animate-[pulse_3s_ease-in-out_infinite] shadow-lg shadow-orange-400/30" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md flex flex-col h-full px-4 relative z-10">
        {/* Header with Back Button and Logo */}
        <div className="animate-slide-up mb-3">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <SamaiLogo size="sm" showText={false} />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-2xs text-muted-foreground">Step 2 of 3</span>
              <div className="flex gap-1">
                <div className="w-5 h-1 rounded-full bg-gradient-to-r from-orange-400 to-amber-500" />
                <div className="w-5 h-1 rounded-full bg-gradient-to-r from-teal-400 to-green-500" />
                <div className="w-5 h-1 rounded-full bg-muted" />
              </div>
            </div>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-400/20 to-green-500/10 mb-2">
              <Cpu className="text-accent" size={18} />
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">We found your solar setup</h2>
          </div>
        </div>

        {/* Device Summary Card - Vibrant */}
        <div className="relative rounded-xl p-3 shadow-card animate-slide-up overflow-hidden border border-accent/30 mb-3" 
          style={{ animationDelay: "0.1s", background: "linear-gradient(135deg, hsl(165 60% 42% / 0.1) 0%, hsl(155 55% 42% / 0.05) 100%)" }}>
          
          {/* Decorative orbs */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-teal-400/25 to-green-400/15 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-teal-400/20 to-emerald-400/10 rounded-full blur-xl" />
          
          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center shadow-lg shadow-teal-400/30">
                <Zap className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Solar System Detected</p>
                <p className="text-2xs text-muted-foreground">{locality}</p>
              </div>
              {isVerified ? (
                <div className="ml-auto flex items-center gap-1 bg-gradient-to-r from-teal-500/15 to-green-500/10 px-2 py-1 rounded-full border border-accent/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-2xs font-medium text-accent">Verified</span>
                </div>
              ) : null}
            </div>
            
            {/* Quick Stats Grid - Colorful */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 text-center border border-border/50 hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-1 shadow-md shadow-orange-400/20">
                  <Zap className="text-white" size={14} />
                </div>
                <p className="text-sm font-bold text-foreground">{placeholder}</p>
                <p className="text-2xs text-muted-foreground">Inverter</p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 text-center border border-border/50 hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center mx-auto mb-1 shadow-md shadow-teal-400/20">
                  <Battery className="text-white" size={14} />
                </div>
                <p className="text-sm font-bold text-foreground">{placeholder}</p>
                <p className="text-2xs text-muted-foreground">Battery</p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 text-center border border-border/50 hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mx-auto mb-1 shadow-md shadow-purple-400/20">
                  <Gauge className="text-white" size={14} />
                </div>
                <p className="text-sm font-bold text-foreground">{placeholder}</p>
                <p className="text-2xs text-muted-foreground">Meter</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <div className="bg-card rounded-xl border border-border shadow-card divide-y divide-border animate-slide-up mb-3" style={{ animationDelay: "0.15s" }}>
          {devices.map((device, index) => {
            const Icon = device.icon;
            const isExpanded = expandedIndex === index;
            
            return (
              <div key={index}>
                <button 
                  onClick={() => toggleExpand(index)}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="text-muted-foreground" size={14} />
                    <span className="text-xs font-medium text-foreground">{device.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xs text-muted-foreground">{device.detail}</span>
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
                      {Object.entries(device.expanded).map(([key, value]) => (
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
        </div>

        {/* Confirmation - Simplified */}
        <button 
          onClick={() => setConfirmed(!confirmed)}
          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all animate-slide-up w-full ${
            confirmed 
              ? "border-primary bg-primary/8" 
              : "border-border hover:border-primary/30 bg-card"
          }`}
          style={{ animationDelay: "0.2s" }}
        >
          <div 
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
              confirmed 
                ? "bg-primary" 
                : "border-2 border-input bg-background"
            }`}
          >
            {confirmed && <Check className="text-primary-foreground" size={14} strokeWidth={3} />}
          </div>
          <span className="text-sm font-medium text-foreground">I confirm these details are correct</span>
        </button>

        {/* Fixed bottom CTA */}
        <div className="mt-auto pt-4 pb-6">
          <button
            onClick={onContinue}
            disabled={!confirmed}
            className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceProfileScreen;
