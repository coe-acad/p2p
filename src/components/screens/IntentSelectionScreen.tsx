import { useState } from "react";
import { ArrowLeft, Zap, Leaf, Check, Sun, Sparkles } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface IntentSelectionScreenProps {
  onSelect: (intents: ("sell" | "buy")[]) => void;
  onBack: () => void;
}

const IntentSelectionScreen = ({ onSelect, onBack }: IntentSelectionScreenProps) => {
  const [selectedIntent, setSelectedIntent] = useState<"sell" | "buy" | null>(null);

  const handleContinue = () => {
    if (selectedIntent) {
      onSelect([selectedIntent]);
    }
  };

  return (
    <div className="screen-container !py-4 relative overflow-hidden">
      {/* Background gradient effects - Vibrant & Warm */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top warm sunlight glow */}
        <div className="absolute top-0 left-1/2 h-[240px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-300/35 via-amber-200/20 to-transparent blur-3xl sm:h-[300px] sm:w-[500px]" />
        
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_4s_ease-in-out_infinite]" />
        
        {/* Colorful accent orbs */}
        <div className="absolute top-[28%] -left-24 h-[220px] w-[220px] rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 blur-3xl animate-pulse sm:-left-20 sm:h-[250px] sm:w-[250px]" style={{ animationDuration: "4s" }} />
        <div className="absolute top-[46%] -right-20 h-[170px] w-[170px] rounded-full bg-gradient-to-bl from-teal-400/15 to-green-400/10 blur-3xl animate-pulse sm:h-[200px] sm:w-[200px]" style={{ animationDuration: "5s" }} />
        
        {/* Bottom warm gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-orange-100/20 to-transparent" />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-lg shadow-orange-400/30" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-gradient-to-br from-teal-400 to-green-500 rounded-full animate-[pulse_3s_ease-in-out_infinite] shadow-lg shadow-teal-400/30" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full animate-[pulse_5s_ease-in-out_infinite] shadow-lg shadow-amber-400/30" style={{ animationDelay: "0.5s" }} />
        
        {/* Decorative icons */}
        <div className="absolute right-6 top-14 hidden text-orange-400/20 sm:block">
          <Sun size={36} className="animate-[pulse_6s_ease-in-out_infinite]" />
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col px-1 py-2 sm:py-4">
        {/* Header with Back and Logo */}
        <div className="mb-6 flex items-center justify-between animate-fade-in sm:mb-8">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 rounded-full border border-white/60 bg-white/65 px-3 py-2 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back</span>
          </button>
          <div className="rounded-full border border-white/60 bg-white/65 p-2 shadow-sm backdrop-blur-sm">
            <SamaiLogo size="sm" showText={false} />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-6 sm:gap-8">
          {/* Title with icon */}
          <div className="text-center animate-slide-up">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 sm:mb-4">
              <Sparkles className="text-primary" size={22} />
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-500/80">Set up your trade intent</p>
            <h2 className="mx-auto mt-3 max-w-[15rem] text-xl font-semibold tracking-tight text-foreground sm:max-w-sm sm:text-2xl">
              What would you like Samai to help you do?
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Start with the action you want right now. You can adjust your role later from profile settings.
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <button
              onClick={() => setSelectedIntent("sell")}
              className={`group relative flex w-full items-start gap-4 overflow-hidden rounded-[1.5rem] border-2 p-4 text-left transition-all sm:p-5 ${
                selectedIntent === "sell"
                  ? "border-primary bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg shadow-orange-200/30"
                  : "border-border bg-white/70 shadow-sm backdrop-blur-sm hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <div className={`mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-all ${
                selectedIntent === "sell"
                  ? "scale-105 bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-400/40"
                  : "bg-gradient-to-br from-orange-400/15 to-amber-400/10 group-hover:scale-105"
              }`}>
                <Zap className={selectedIntent === "sell" ? "text-white" : "text-primary"} size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">Sell excess solar energy</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Share surplus generation when your home is producing more than it needs.
                    </p>
                  </div>
                  {selectedIntent === "sell" && (
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-400/30">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>

            <button
              onClick={() => setSelectedIntent("buy")}
              className={`group relative flex w-full items-start gap-4 overflow-hidden rounded-[1.5rem] border-2 p-4 text-left transition-all sm:p-5 ${
                selectedIntent === "buy"
                  ? "border-primary bg-gradient-to-r from-teal-50 to-green-50 shadow-lg shadow-teal-200/30"
                  : "border-border bg-white/70 shadow-sm backdrop-blur-sm hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <div className={`mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-all ${
                selectedIntent === "buy"
                  ? "scale-105 bg-gradient-to-br from-teal-400 to-green-500 shadow-lg shadow-teal-400/40"
                  : "bg-gradient-to-br from-teal-400/15 to-green-400/10 group-hover:scale-105"
              }`}>
                <Leaf className={selectedIntent === "buy" ? "text-white" : "text-teal-600"} size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">Buy clean energy</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Source clean energy from local solar producers in your community.
                    </p>
                  </div>
                  {selectedIntent === "buy" && (
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-green-500 shadow-lg shadow-teal-400/30">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </div>

          {/* Continue button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleContinue}
              disabled={!selectedIntent}
              className="btn-solar w-full text-sm !py-4 disabled:opacity-50"
            >
              Continue
            </button>
            <p className="text-center text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
              You can change this anytime later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntentSelectionScreen;
