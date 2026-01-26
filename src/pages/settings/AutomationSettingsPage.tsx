import { useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, Sparkles, Check } from "lucide-react";
import { useState } from "react";

const AutomationSettingsPage = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<"manual" | "auto">("auto");

  const modes = [
    {
      id: "manual" as const,
      icon: Eye,
      title: "Show me the best times & prices",
      description: "Samai will recommend optimal times but ask for your confirmation before placing orders",
    },
    {
      id: "auto" as const,
      icon: Sparkles,
      title: "Sell automatically at the best times & prices",
      description: "Samai will automatically execute trades when conditions are optimal",
    },
  ];

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
          <h1 className="text-lg font-bold text-foreground">How should Samai help?</h1>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left animate-slide-up ${
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Icon size={18} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{mode.title}</p>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check size={12} className="text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Samai will always notify you before any order is placed. You can change this anytime.
        </p>

        {/* Save Button */}
        <button
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          Save Preference
        </button>
      </div>
    </div>
  );
};

export default AutomationSettingsPage;
