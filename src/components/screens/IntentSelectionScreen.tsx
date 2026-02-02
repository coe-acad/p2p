import { useState } from "react";
import { ArrowLeft, Zap, Leaf, Check, Sun, Sparkles } from "lucide-react";
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
      {/* Background gradient effects - Vibrant & Warm */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top warm sunlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-orange-300/35 via-amber-200/20 to-transparent rounded-full blur-3xl" />
        
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_4s_ease-in-out_infinite]" />
        
        {/* Colorful accent orbs */}
        <div className="absolute top-1/3 -left-20 w-[250px] h-[250px] bg-gradient-to-br from-orange-400/20 to-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/2 -right-20 w-[200px] h-[200px] bg-gradient-to-bl from-teal-400/15 to-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
        
        {/* Bottom warm gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-orange-100/20 to-transparent" />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-lg shadow-orange-400/30" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-gradient-to-br from-teal-400 to-green-500 rounded-full animate-[pulse_3s_ease-in-out_infinite] shadow-lg shadow-teal-400/30" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full animate-[pulse_5s_ease-in-out_infinite] shadow-lg shadow-amber-400/30" style={{ animationDelay: "0.5s" }} />
        
        {/* Decorative icons */}
        <div className="absolute top-16 right-8 text-orange-400/20">
          <Sun size={36} className="animate-[pulse_6s_ease-in-out_infinite]" />
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col h-full px-4 relative z-10">
        {/* Header with Back and Logo */}
        <div className="flex items-center justify-between animate-fade-in mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back</span>
          </button>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Title with icon */}
        <div className="text-center animate-slide-up mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 mb-3">
            <Sparkles className="text-primary" size={22} />
          </div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            What would you like to do?
          </h2>
        </div>

        {/* Cards - Vibrant style */}
        <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <button 
            onClick={() => toggleIntent("sell")} 
            className={`group flex items-center gap-4 p-4 rounded-xl transition-all text-left relative overflow-hidden ${
              selectedIntents.includes("sell") 
                ? "bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-primary shadow-lg shadow-orange-200/30" 
                : "bg-card border-2 border-border hover:border-primary/40 hover:shadow-md"
            }`}
          >
            {/* Icon with glow */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              selectedIntents.includes("sell") 
                ? "bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-400/40 scale-105" 
                : "bg-gradient-to-br from-orange-400/15 to-amber-400/10 group-hover:scale-105"
            }`}>
              <Zap className={selectedIntents.includes("sell") ? "text-white" : "text-primary"} size={22} />
            </div>
            <span className="text-sm font-semibold text-foreground flex-1">Sell excess solar energy</span>
            {selectedIntents.includes("sell") && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-400/30">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
            )}
            {/* Shimmer on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </button>

          <div className="group flex items-center gap-4 p-4 bg-card border-2 rounded-xl text-left relative overflow-hidden border-border opacity-60 cursor-not-allowed">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-400/10 to-green-400/5">
              <Leaf className="text-muted-foreground" size={22} />
            </div>
            <span className="text-sm font-medium text-muted-foreground flex-1">Buy clean energy</span>
            <span className="text-2xs font-bold uppercase tracking-wide text-white bg-gradient-to-r from-teal-500 to-green-500 px-2.5 py-1 rounded-full shadow-md">
              Coming soon!
            </span>
          </div>
        </div>

        {/* Spacer + Continue button */}
        <div className="mt-auto pt-4 pb-6 space-y-3">
          <button 
            onClick={handleContinue}
            disabled={selectedIntents.length === 0}
            className="btn-solar w-full !py-3.5 text-sm"
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
