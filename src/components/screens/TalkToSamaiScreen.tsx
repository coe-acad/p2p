import { useState, useEffect } from "react";
import { Mic, MicOff, MessageSquare, ChevronLeft } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface TalkToSamaiScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const GHOST_TEXTS = [
  "I work from home on weekdays",
  "My shop is closed on Sundays",
  "This solar is for my school",
];

const TalkToSamaiScreen = ({ onContinue, onBack }: TalkToSamaiScreenProps) => {
  const [inputMode, setInputMode] = useState<"voice" | "text">("text");
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [ghostTextIndex, setGhostTextIndex] = useState(0);
  const [automationLevel, setAutomationLevel] = useState<"recommend" | "auto" | null>(null);

  const isFormValid = automationLevel !== null;

  useEffect(() => {
    const interval = setInterval(() => {
      setGhostTextIndex((prev) => (prev + 1) % GHOST_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMicToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setUserInput("मेरा घर दिन में ज्यादा बिजली इस्तेमाल करता है");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="screen-container !py-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header with Back Button and Logo */}
        <div className="animate-slide-up mb-3">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <SamaiLogo size="sm" showText={false} />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-2xs text-muted-foreground">Step 3 of 3</span>
              <div className="flex gap-1">
                <div className="w-5 h-0.5 rounded-full bg-primary" />
                <div className="w-5 h-0.5 rounded-full bg-primary" />
                <div className="w-5 h-0.5 rounded-full bg-primary" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Help Samai understand you</h2>
          </div>
        </div>

        {/* Input Area - Compact with Bhashini */}
        <div className="bg-card rounded-xl border border-border p-3 shadow-card animate-slide-up mb-3" style={{ animationDelay: "0.1s" }}>
          {/* Mode Toggle */}
          <div className="flex gap-1.5 mb-2">
            <button
              onClick={() => setInputMode("text")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-all ${
                inputMode === "text" ? "bg-primary/8 text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <MessageSquare size={12} /> Type
            </button>
            <button
              onClick={() => setInputMode("voice")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-all ${
                inputMode === "voice" ? "bg-primary/8 text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <Mic size={12} /> Speak
            </button>
          </div>

          {inputMode === "text" ? (
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={GHOST_TEXTS[ghostTextIndex]}
              className="w-full h-14 px-2.5 py-2 rounded-lg border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          ) : (
            <div className="flex flex-col items-center py-2">
              <button
                onClick={handleMicToggle}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isListening ? "bg-destructive animate-pulse" : "bg-gradient-to-br from-orange-500 to-orange-600"
                }`}
              >
                {isListening ? <MicOff className="text-destructive-foreground" size={18} /> : <Mic className="text-white" size={18} />}
              </button>
              <p className="text-2xs text-muted-foreground mt-1.5">
                {isListening ? "Listening..." : "Tap to speak in any language"}
              </p>
              {/* Bhashini Badge */}
              <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-orange-50 rounded-full border border-orange-200">
                <span className="text-2xs font-medium text-orange-700">Powered by</span>
                <span className="text-2xs font-bold text-orange-600">भाषिणी</span>
              </div>
            </div>
          )}

          {userInput && (
            <div className="mt-2 p-2 bg-accent/6 rounded-lg">
              <p className="text-xs text-foreground">{userInput}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-2xs text-accent">✓ Understood</span>
                {userInput.includes("मेरा") && (
                  <span className="text-2xs text-muted-foreground">• Translated from Hindi</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Automation Toggle - Compact */}
        <div className="bg-card rounded-xl border border-border p-3 shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-xs font-medium text-foreground mb-2">How should Samai help?</p>
          
          <div className="space-y-1.5">
            {[
              { value: "recommend", label: "Show me the best times & prices", description: "Samai will suggest. You decide and confirm." },
              { value: "auto", label: "Sell automatically at the best times & prices", description: "Samai will sell for you. You can stop it anytime." },
            ].map((option) => (
              <button
                key={option.value}
                className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg transition-all text-left ${
                  automationLevel === option.value ? "bg-primary/6 border border-primary/20" : "hover:bg-secondary border border-transparent"
                }`}
                onClick={() => setAutomationLevel(option.value as "recommend" | "auto")}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  automationLevel === option.value ? "border-primary" : "border-input"
                }`}>
                  {automationLevel === option.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-foreground">{option.label}</span>
                  <span className="text-2xs text-muted-foreground">{option.description}</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-2xs text-muted-foreground mt-2 text-center">
            Samai notifies before placing orders. You can update your choice anytime.
          </p>
        </div>

        {/* Fixed bottom CTA */}
        <div className="mt-auto pt-4 pb-6">
          <button 
            onClick={onContinue} 
            disabled={!isFormValid}
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

export default TalkToSamaiScreen;
