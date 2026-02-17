import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Building2, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useUserData } from "@/hooks/useUserData";

const DiscomSettingsPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  
  const [address, setAddress] = useState(userData.address || "");
  const [location, setLocation] = useState(userData.city || "Bengaluru, Karnataka");
  const [discom, setDiscom] = useState(userData.discom || "BESCOM");

  const discoms = ["BESCOM", "MESCOM", "HESCOM", "GESCOM", "CESC"];

  useEffect(() => {
    setAddress(userData.address || "");
  }, [userData.address]);

  const handleSave = () => {
    setUserData({
      address,
      city: location,
      discom
    });
    navigate("/profile");
  };

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
          <h1 className="text-lg font-bold text-foreground">Location & DISCOM</h1>
        </div>

        {/* Address - from VC Documents */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Home size={14} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Address</p>
            </div>
            <span className="text-2xs text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">From VC</span>
          </div>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address from your VC documents"
            rows={2}
            className="w-full text-sm font-medium text-foreground bg-muted/30 border border-border rounded-lg px-3 py-2 focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Location */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">City / Region</p>
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full text-sm font-medium text-foreground bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 transition-colors"
          />
        </div>

        {/* DISCOM Selection */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={14} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Select DISCOM</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {discoms.map((d) => (
              <button
                key={d}
                onClick={() => setDiscom(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  discom === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default DiscomSettingsPage;
