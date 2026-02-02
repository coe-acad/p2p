import { useState, useEffect } from "react";
import { Mic, MicOff, MessageSquare, ChevronLeft, Bell, Zap, MessageCircle } from "lucide-react";
import SamaiLogo from "../SamaiLogo";
import { useUserData } from "@/hooks/useUserData";

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
  const { userData, setUserData } = useUserData();
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [ghostTextIndex, setGhostTextIndex] = useState(0);
  const [automationLevel, setAutomationLevel] = useState<"recommend" | "auto">(userData.automationLevel || "auto");

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
    <div className="min-h-screen flex flex-col px-4 py-3 relative overflow-hidden bg-background">
      {/* Background gradient effects - Compact */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-purple-300/20 via-indigo-200/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-16 w-[150px] h-[150px] bg-gradient-to-br from-purple-400/12 to-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-12 w-[130px] h-[130px] bg-gradient-to-bl from-orange-400/10 to-amber-500/6 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col flex-1 relative z-10">
        {/* Header - Compact */}
        <div className="animate-slide-up mb-2">
          <div className="flex items-center justify-between mb-1">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <SamaiLogo size="xs" showText={false} />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xs text-muted-foreground">Step 3 of 3</span>
              <div className="flex gap-0.5">
                <div className="w-4 h-0.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500" />
                <div className="w-4 h-0.5 rounded-full bg-gradient-to-r from-teal-400 to-green-500" />
                <div className="w-4 h-0.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-500/10 flex items-center justify-center">
                <MessageCircle className="text-purple-500" size={14} />
              </div>
              <h2 className="text-base font-semibold text-foreground">Help Samai understand you</h2>
            </div>
          </div>
        </div>

        {/* Input Area - Compact */}
        <div className="relative rounded-xl p-2.5 shadow-card animate-slide-up mb-2 overflow-hidden border border-purple-300/30" 
          style={{ background: "linear-gradient(135deg, hsl(270 60% 55% / 0.08) 0%, hsl(250 60% 55% / 0.04) 50%, hsl(35 95% 55% / 0.03) 100%)" }}>
          
          <div className="relative">
            {/* Mode Toggle - Compact */}
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => setInputMode("text")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
                  inputMode === "text" 
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm" 
                    : "bg-white/50 text-purple-700/70"
                }`}
              >
                <MessageSquare size={12} /> Type
              </button>
              <button
                onClick={() => setInputMode("voice")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
                  inputMode === "voice" 
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm" 
                    : "bg-white/50 text-purple-700/70"
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
                className="w-full h-14 px-2.5 py-2 rounded-lg border border-purple-200/50 bg-white/70 text-xs text-foreground placeholder:text-purple-400/60 focus:outline-none focus:ring-1 focus:ring-purple-400/50 resize-none"
              />
            ) : (
              <div className="flex flex-col items-center py-2">
                <button
                  onClick={handleMicToggle}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                    isListening 
                      ? "bg-gradient-to-br from-red-500 to-red-600 animate-pulse" 
                      : "bg-gradient-to-br from-purple-500 to-indigo-600 hover:scale-105"
                  }`}
                >
                  {isListening ? <MicOff className="text-white" size={20} /> : <Mic className="text-white" size={20} />}
                </button>
                <p className="text-2xs text-purple-700 mt-1.5 font-medium">
                  {isListening ? "Listening..." : "Tap to speak"}
                </p>
                
                {/* Guiding prompts - Single row compact */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  <span className="text-2xs px-2 py-1 bg-orange-50 rounded-full text-orange-700 border border-orange-200/50">👤 Usage</span>
                  <span className="text-2xs px-2 py-1 bg-teal-50 rounded-full text-teal-700 border border-teal-200/50">🏠 Type</span>
                  <span className="text-2xs px-2 py-1 bg-purple-50 rounded-full text-purple-700 border border-purple-200/50">📅 Week</span>
                </div>
                
                {/* Bhashini Badge - Compact */}
                <div className="flex items-center gap-1 mt-2 px-2 py-0.5 bg-purple-50 rounded-full border border-purple-200/50">
                  <span className="text-2xs text-purple-600">भाषिणी</span>
                </div>
              </div>
            )}

            {userInput && (
              <div className="mt-2 p-2 bg-white/60 rounded-lg border border-green-200/50">
                <p className="text-2xs text-foreground">{userInput}</p>
                <span className="text-2xs text-green-600 font-medium">✓ Understood</span>
              </div>
            )}
          </div>
        </div>

        {/* Automation Toggle - Compact */}
        <div className="bg-card rounded-xl border border-border p-2.5 shadow-card animate-slide-up">
          <p className="text-xs font-semibold text-foreground mb-2 text-center">How should Samai help?</p>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                automationLevel === "recommend" 
                  ? "bg-blue-50 border-2 border-blue-400" 
                  : "bg-secondary/50 border-2 border-transparent"
              }`}
              onClick={() => setAutomationLevel("recommend")}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${
                automationLevel === "recommend" 
                  ? "bg-gradient-to-br from-blue-400 to-indigo-500" 
                  : "bg-muted"
              }`}>
                <Bell size={16} className={automationLevel === "recommend" ? "text-white" : "text-muted-foreground"} />
              </div>
              <span className="text-2xs font-semibold text-foreground">I'll decide</span>
              <span className="text-2xs text-muted-foreground">Notify first</span>
            </button>
            
            <button
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                automationLevel === "auto" 
                  ? "bg-orange-50 border-2 border-primary" 
                  : "bg-secondary/50 border-2 border-transparent"
              }`}
              onClick={() => setAutomationLevel("auto")}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${
                automationLevel === "auto" 
                  ? "bg-gradient-to-br from-orange-400 to-amber-500" 
                  : "bg-muted"
              }`}>
                <Zap size={16} className={automationLevel === "auto" ? "text-white" : "text-muted-foreground"} />
              </div>
              <span className="text-2xs font-semibold text-foreground">Auto-sell</span>
              <span className="text-2xs text-primary font-medium">Recommended</span>
            </button>
          </div>
        </div>

        {/* Fixed bottom CTA */}
        <div className="mt-auto pt-3 pb-4">
          <button 
            onClick={() => {
              const currentData = JSON.parse(localStorage.getItem("samai_user_data") || "{}");
              localStorage.setItem("samai_user_data", JSON.stringify({ ...currentData, automationLevel }));
              setUserData({ automationLevel });
              onContinue();
            }} 
            disabled={!isFormValid}
            className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalkToSamaiScreen;
