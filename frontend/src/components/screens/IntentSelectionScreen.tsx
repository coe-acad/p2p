import { useState } from "react";
import { ArrowLeft, Zap, Leaf, Check } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface IntentSelectionScreenProps {
  onSelect: (intents: ("sell" | "buy")[]) => void;
  onBack: () => void;
}

const IntentSelectionScreen = ({ onSelect, onBack }: IntentSelectionScreenProps) => {
  const [selectedIntents, setSelectedIntents] = useState<("sell" | "buy")[]>([]);

  const toggleIntent = (intent: "sell" | "buy") => {
    setSelectedIntents(prev => 
      prev.includes(intent) 
        ? prev.filter(i => i !== intent)
        : [...prev, intent]
    );
  };

  const handleContinue = () => {
    if (selectedIntents.length > 0) {
      onSelect(selectedIntents);
    }
  };

  return (
    <div className="screen-container !py-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top warm glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-amber-200/20 via-amber-100/10 to-transparent rounded-full blur-3xl" />
        
        {/* Left accent - primary/solar */}
        <div className="absolute top-1/3 -left-20 w-[250px] h-[250px] bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl" />
        
        {/* Right accent - green/eco */}
        <div className="absolute top-1/2 -right-20 w-[200px] h-[200px] bg-gradient-to-bl from-accent/8 to-transparent rounded-full blur-3xl" />
        
        {/* Bottom subtle gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-primary/3 to-transparent" />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 bg-amber-400/30 rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-primary/25 rounded-full animate-[pulse_3s_ease-in-out_infinite]" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-accent/30 rounded-full animate-[pulse_5s_ease-in-out_infinite]" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="w-full max-w-md flex flex-col h-full px-4 relative z-10">
        {/* Header with Back and Logo */}
        <div className="flex items-center justify-between animate-fade-in mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Title */}
        <div className="text-center animate-slide-up mb-4">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            What would you like to do?
          </h2>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2.5 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <button 
            onClick={() => toggleIntent("sell")} 
            className={`group flex items-center gap-3 p-3 bg-card border rounded-xl transition-all text-left relative overflow-hidden ${
              selectedIntents.includes("sell") 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/30 hover:bg-primary/5"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${
              selectedIntents.includes("sell") ? "scale-105" : "group-hover:scale-105"
            } bg-gradient-to-br from-primary/15 to-amber-400/10`}>
              <Zap className="text-primary drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" size={18} />
            </div>
            <span className="text-sm font-medium text-foreground flex-1">Sell excess solar energy</span>
            {selectedIntents.includes("sell") && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check size={12} className="text-primary-foreground" />
              </div>
            )}
            {/* Shimmer on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </button>

          <button 
            onClick={() => toggleIntent("buy")} 
            className={`group flex items-center gap-3 p-3 bg-card border rounded-xl transition-all text-left relative overflow-hidden ${
              selectedIntents.includes("buy") 
                ? "border-accent bg-accent/5" 
                : "border-border hover:border-accent/30 hover:bg-accent/5"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${
              selectedIntents.includes("buy") ? "scale-105" : "group-hover:scale-105"
            } bg-gradient-to-br from-accent/15 to-emerald-400/10`}>
              <Leaf className="text-accent drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]" size={18} />
            </div>
            <span className="text-sm font-medium text-foreground flex-1">Buy clean energy</span>
            {selectedIntents.includes("buy") && (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Check size={12} className="text-accent-foreground" />
              </div>
            )}
            {/* Shimmer on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </button>
        </div>

        {/* Spacer + Continue button */}
        <div className="mt-auto pt-4 pb-6 space-y-3">
          <button 
            onClick={handleContinue}
            disabled={selectedIntents.length === 0}
            className="btn-solar w-full !py-3 text-sm"
          >
            Continue
          </button>
          <p className="text-center text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            You can change this anytime later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntentSelectionScreen;
