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
        <div className="absolute top-0 left-1/2 h-[280px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-300/40 via-amber-200/25 to-transparent blur-3xl sm:h-[400px] sm:w-[600px]" />
        
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_4s_ease-in-out_infinite]" />
        
        {/* Colorful accent orbs */}
        <div className="absolute top-[18%] -left-24 h-[220px] w-[220px] rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 blur-3xl animate-pulse sm:-left-20 sm:h-[300px] sm:w-[300px]" style={{ animationDuration: "4s" }} />
        <div className="absolute top-[28%] -right-20 h-[180px] w-[180px] rounded-full bg-gradient-to-bl from-teal-400/15 to-green-400/10 blur-3xl animate-pulse sm:h-[250px] sm:w-[250px]" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        
        {/* Bottom warm gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-orange-100/30 to-transparent" />
        
        {/* Floating particles - colorful */}
        <div className="absolute top-1/4 left-1/4 w-2.5 h-2.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full animate-[pulse_3s_ease-in-out_infinite] shadow-lg shadow-orange-400/30" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gradient-to-br from-teal-400 to-green-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-lg shadow-teal-400/30" style={{ animationDelay: "1s" }} />
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full animate-[pulse_5s_ease-in-out_infinite] shadow-lg shadow-amber-400/30" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-lg shadow-orange-300/30" style={{ animationDelay: "2s" }} />
        
        {/* Decorative icons */}
        <div className="absolute right-6 top-16 hidden text-orange-400/20 sm:block">
          <Sun size={40} className="animate-[pulse_6s_ease-in-out_infinite]" />
        </div>
        <div className="absolute bottom-28 left-6 hidden text-amber-400/15 sm:block">
          <Sparkles size={32} className="animate-[pulse_5s_ease-in-out_infinite]" style={{ animationDelay: "2s" }} />
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col justify-between gap-10 px-1 py-4 sm:justify-center sm:gap-12 sm:py-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="animate-fade-in">
            <SamaiLogo size="lg" animated />
          </div>

          <div className="mt-6 max-w-[18rem] animate-slide-up sm:mt-8 sm:max-w-sm" style={{ animationDelay: "0.2s" }}>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-orange-500/80">Peer-to-peer solar trading</p>
            <p className="mt-3 text-xl font-semibold leading-tight text-foreground sm:text-2xl">
              Start trading energy in a flow designed for mobile.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent font-medium">
                Your solar. Your choice.
              </span>
            </p>
          </div>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="rounded-[1.75rem] border border-white/60 bg-white/70 p-4 shadow-[0_24px_60px_-30px_rgba(249,115,22,0.45)] backdrop-blur-md sm:p-5">
            <div className="flex flex-col gap-3">
              <button onClick={onNewUser} className="btn-solar relative w-full overflow-hidden text-sm !py-4 group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  I am new to Samai
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
              <button onClick={onReturningUser} className="btn-outline-calm w-full text-sm !py-4 flex items-center justify-center gap-2">
                <Sun size={16} className="text-primary" />
                I am a returning user
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
              <div className="h-2 w-2 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-400/30" />
              <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
