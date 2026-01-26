import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Building2 } from "lucide-react";
import { useState } from "react";

const DiscomSettingsPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("Bengaluru, Karnataka");
  const [discom, setDiscom] = useState("BESCOM");

  const discoms = ["BESCOM", "MESCOM", "HESCOM", "GESCOM", "CESC"];

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
          <h1 className="text-lg font-bold text-foreground">DISCOM Settings</h1>
        </div>

        {/* Location */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Your Location</p>
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
