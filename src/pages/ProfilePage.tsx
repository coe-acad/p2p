import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/use-user";
import {
  ChevronLeft,
  User,
  Zap,
  Battery,
  Gauge,
  Bell,
  Globe,
  FileText,
  Settings,
  ChevronRight,
  MessageSquare,
  Sparkles,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<{
    label: string;
    sublabel: string;
    details: Record<string, any>;
    kind: "consumption" | "generation" | "other";
    subject: Record<string, any>;
  } | null>(null);
  const { user, devices: fetchedDevices, sessionValid } = useUser();
  const devices = fetchedDevices;
  const userName = user?.name || "User";
  const userPhone = user?.phone || "";
  const userRole = user?.role || localStorage.getItem("samai_user_role") || "";

  useEffect(() => {
    if (!sessionValid) {
      localStorage.removeItem("samai_user_id");
      localStorage.removeItem("samai_user_role");
      localStorage.removeItem("samai_last_login");
      navigate("/returning");
      return;
    }
  }, [fetchedDevices, navigate, sessionValid]);

  const solarItems = useMemo(() => {
    if (!devices.length) {
      return [{ icon: Gauge, label: "No devices yet", sublabel: "Verify VCs to add devices", details: {} }];
    }

    return devices.map((device) => {
      const info = device.information || {};
      const subject = info.credentialSubject || {};
      const subjectType = String(subject.type || device.type || "Device");
      const loweredType = subjectType.toLowerCase();
      const isConsumption = loweredType.includes("consumption");
      const isGeneration = loweredType.includes("generation");
      const typeLabel = isConsumption
        ? `${subject.connectionType || "Connection"} : ${subject.premisesType || "Premises"}`
        : isGeneration
          ? subject.generationType || "Generation"
          : device.name || subjectType;
      const icon =
        loweredType.includes("battery") || loweredType.includes("storage")
          ? Battery
          : loweredType.includes("generation") || loweredType.includes("solar")
            ? Zap
            : Gauge;

      const meterNumber = subject.meterNumber || device.meter_id || "";
      const sublabel = meterNumber ? `Meter ${meterNumber}` : "Meter number unavailable";

      return {
        icon,
        label: typeLabel,
        sublabel,
        details: {
          type: subject.type || typeLabel,
          meterNumber: subject.meterNumber || device.meter_id || "",
          assetId: subject.assetId || "",
          consumerNumber: subject.consumerNumber || "",
          fullName: subject.fullName || "",
          connectionType: subject.connectionType || "",
          premisesType: subject.premisesType || "",
          sanctionedLoad: subject.sanctionedLoadKW || "",
          tariffCategoryCode: subject.tariffCategoryCode || "",
          generationType: subject.generationType || "",
          manufacturer: subject.manufacturer || subject.issuerName || "",
          commissioningDate: subject.commissioningDate || "",
          capacity: subject.capacityKW || subject.powerRatingKW || subject.storageCapacityKWh || "",
        },
        kind: isConsumption ? "consumption" : isGeneration ? "generation" : "other",
        subject,
      };
    });
  }, [devices]);

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Personal Details", sublabel: userName, route: "/settings/mobile" },
        { icon: ShoppingCart, label: "Your Role", sublabel: userRole || "Prosumer", route: "/settings/role" },
        { icon: Settings, label: "Home Profile", sublabel: "", route: "/settings/devices?type=profile" },
      ],
    },
    {
      title: "Devices",
      items: solarItems,
    },
    {
      title: "Location & DISCOM",
      items: [
        { icon: Globe, label: "DISCOM Settings", sublabel: "BESCOM • Bengaluru", route: "/settings/discom" },
        { icon: FileText, label: "VC Documents", sublabel: "Connection VC Verified ✓", route: "/settings/vc-documents" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Sparkles, label: "How Samai Helps", sublabel: "Auto-place orders", route: "/settings/automation" },
        { icon: MessageSquare, label: "Your Context", sublabel: "Work from home, peak hours...", route: "/settings/context" },
        { icon: Bell, label: "Notifications", sublabel: "Enabled", route: null },
      ],
    },
  ];

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <div className="w-full max-w-md flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button 
            onClick={() => navigate("/home")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Profile & Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3 animate-slide-up">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userPhone ? `+91 ${userPhone}` : " "}</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {sections.map((section, sIndex) => (
            <div key={sIndex} className="animate-slide-up" style={{ animationDelay: `${0.1 * (sIndex + 1)}s` }}>
              <p className="text-xs font-medium text-muted-foreground mb-2 px-1">{section.title}</p>
              <div className="bg-card rounded-xl shadow-card divide-y divide-border">
                {section.items.map((item, iIndex) => {
                  const Icon = item.icon;
                  const isDevicesSection = section.title === "Devices";
                  const route = (item as any).route as string | null | undefined;

                  return (
                    <div key={iIndex} className="first:rounded-t-xl last:rounded-b-xl">
                      <button
                        onClick={() => {
                          if (isDevicesSection) {
                          setSelectedDevice({
                            label: item.label,
                            sublabel: item.sublabel,
                            details: (item as any).details || {},
                            kind: (item as any).kind || "other",
                            subject: (item as any).subject || {},
                          });
                            return;
                          }
                          if (route) navigate(route);
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <Icon size={16} className="text-muted-foreground" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            {item.sublabel && (
                              <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Demo Reset */}
        <button
          onClick={() => navigate("/")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
        >
          ← Start demo over
        </button>
      </div>

      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card shadow-lg animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground">Device details</p>
                <h3 className="text-base font-bold text-foreground">{selectedDevice.label}</h3>
                <p className="text-xs text-muted-foreground">{selectedDevice.sublabel}</p>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <ChevronDown size={16} className="text-muted-foreground rotate-180" />
              </button>
            </div>
            <div className="p-4">
              {selectedDevice.kind === "consumption" ? (
                <div className="space-y-2 text-xs">
                  {[
                    { label: "ID", value: selectedDevice.subject.id },
                    { label: "Type", value: selectedDevice.subject.type },
                    { label: "Full Name", value: selectedDevice.subject.fullName },
                    { label: "Issuer Name", value: selectedDevice.subject.issuerName },
                    { label: "Meter Number", value: selectedDevice.subject.meterNumber },
                    { label: "Premises Type", value: selectedDevice.subject.premisesType },
                    { label: "Connection Type", value: selectedDevice.subject.connectionType },
                    { label: "Consumer Number", value: selectedDevice.subject.consumerNumber },
                    { label: "Sanctioned Load (kW)", value: selectedDevice.subject.sanctionedLoadKW },
                    { label: "Tariff Category Code", value: selectedDevice.subject.tariffCategoryCode },
                  ]
                    .filter((item) => item.value)
                    .map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-3">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-foreground font-medium text-right break-words max-w-[55%]">
                          {item.value as string}
                        </span>
                      </div>
                    ))}
                </div>
              ) : selectedDevice.kind === "generation" ? (
                <div className="space-y-2 text-xs">
                  {[
                    { label: "ID", value: selectedDevice.subject.id },
                    { label: "Type", value: selectedDevice.subject.type },
                    { label: "Asset ID", value: selectedDevice.subject.assetId },
                    { label: "Full Name", value: selectedDevice.subject.fullName },
                    { label: "Capacity (kW)", value: selectedDevice.subject.capacityKW },
                    { label: "Issuer Name", value: selectedDevice.subject.issuerName },
                    { label: "Meter Number", value: selectedDevice.subject.meterNumber },
                    { label: "Model Number", value: selectedDevice.subject.modelNumber },
                    { label: "Manufacturer", value: selectedDevice.subject.manufacturer },
                    { label: "Consumer Number", value: selectedDevice.subject.consumerNumber },
                    { label: "Generation Type", value: selectedDevice.subject.generationType },
                    { label: "Commissioning Date", value: selectedDevice.subject.commissioningDate },
                  ]
                    .filter((item) => item.value)
                    .map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-3">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-foreground font-medium text-right break-words max-w-[55%]">
                          {item.value as string}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  {Object.entries(selectedDevice.details)
                    .filter(([, value]) => value)
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="text-foreground font-medium text-right">{value as string}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="p-4 pt-0">
              <button onClick={() => setSelectedDevice(null)} className="btn-outline-calm w-full">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
