import { Sun, Sparkles } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface WelcomeScreenProps {
  onNewUser: () => void;
  onReturningUser: () => void;
}

const WelcomeScreen = ({ onNewUser, onReturningUser }: WelcomeScreenProps) => {
  return (
    <div className="screen-container relative overflow-hidden">
      {/* Background gradient effects - Warm & Vibrant */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top warm sunlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-orange-300/40 via-amber-200/25 to-transparent rounded-full blur-3xl" />
        
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_4s_ease-in-out_infinite]" />
        
        {/* Colorful accent orbs */}
        <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] bg-gradient-to-br from-orange-400/20 to-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/3 -right-20 w-[250px] h-[250px] bg-gradient-to-bl from-teal-400/15 to-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        
        {/* Bottom warm gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-orange-100/30 to-transparent" />
        
        {/* Floating particles - colorful */}
        <div className="absolute top-1/4 left-1/4 w-2.5 h-2.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full animate-[pulse_3s_ease-in-out_infinite] shadow-lg shadow-orange-400/30" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gradient-to-br from-teal-400 to-green-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-lg shadow-teal-400/30" style={{ animationDelay: "1s" }} />
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full animate-[pulse_5s_ease-in-out_infinite] shadow-lg shadow-amber-400/30" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-lg shadow-orange-300/30" style={{ animationDelay: "2s" }} />
        
        {/* Decorative icons */}
        <div className="absolute top-20 right-10 text-orange-400/20">
          <Sun size={40} className="animate-[pulse_6s_ease-in-out_infinite]" />
        </div>
        <div className="absolute bottom-32 left-8 text-amber-400/15">
          <Sparkles size={32} className="animate-[pulse_5s_ease-in-out_infinite]" style={{ animationDelay: "2s" }} />
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-8 px-6 relative z-10">
        {/* Logo with animation */}
        <div className="animate-fade-in">
          <SamaiLogo size="lg" animated />
        </div>

        {/* Tagline with vibrant gradient text */}
        <p className="text-base text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent font-medium">
            Your solar. Your choice.
          </span>
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <button onClick={onNewUser} className="btn-solar w-full text-sm !py-3.5 relative overflow-hidden group">
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Sparkles size={16} />
              I am new to Samai
            </span>
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </button>
          <button onClick={onReturningUser} className="btn-outline-calm w-full text-sm !py-3.5 flex items-center justify-center gap-2">
            <Sun size={16} className="text-primary" />
            I am a returning user
          </button>
        </div>

        {/* Bottom accent decoration */}
        <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-400/30" />
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
