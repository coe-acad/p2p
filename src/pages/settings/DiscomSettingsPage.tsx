import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Zap, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useUserData } from "@/hooks/useUserData";
import SamaiLogo from "@/components/SamaiLogo";

const DiscomSettingsPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();

  const [address, setAddress] = useState(userData.address || "");
  const [city, setCity] = useState(userData.city || "");
  const [discom, setDiscom] = useState(userData.discom || "");

  const discoms = ["BESCOM", "MESCOM", "HESCOM", "GESCOM", "CESC", "MSEDCL", "TPDDL"];

  useEffect(() => {
    setAddress(userData.address || "");
  }, [userData.address]);

  const handleSave = () => {
    setUserData({
      address,
      city,
      discom
    });
    navigate("/profile");
  };

  return (
    <div className="screen-container !py-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 animate-fade-in">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Title */}
        <div className="text-center animate-slide-up mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-2">
            <Shield className="text-primary" size={22} />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Location & DISCOM
          </h2>
          <p className="text-2xs text-muted-foreground mt-1">Update your electricity distribution company and location</p>
        </div>

        {/* Content Card */}
        <div className="bg-card rounded-xl border border-border p-3 shadow-card space-y-3 flex-1 animate-slide-up">
          {/* Address */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-foreground">
              <MapPin size={13} className="text-primary" />
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              rows={2}
              className="w-full text-sm font-medium text-foreground bg-background border border-input rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* City/Region */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-foreground">
              <MapPin size={13} className="text-primary" />
              City / Region
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Bengaluru, Karnataka"
              className="w-full text-sm font-medium text-foreground bg-background border border-input rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* DISCOM Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-foreground">
              <Zap size={13} className="text-primary" />
              Electricity Distribution Company
            </label>
            <div className="grid grid-cols-2 gap-2">
              {discoms.map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscom(d)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    discom === d
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border/50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-auto pt-4 pb-6 space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={handleSave}
            className="btn-solar w-full text-sm !py-2.5"
          >
            Save Changes
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="btn-outline-calm w-full text-sm !py-2.5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscomSettingsPage;
