import SamaiLogo from "../SamaiLogo";

interface WelcomeScreenProps {
  onNewUser: () => void;
  onReturningUser: () => void;
}

const WelcomeScreen = ({ onNewUser, onReturningUser }: WelcomeScreenProps) => {
  return (
    <div className="screen-container relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top warm glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-amber-200/30 via-amber-100/20 to-transparent rounded-full blur-3xl" />
        
        {/* Side accent glows */}
        <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-[250px] h-[250px] bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-3xl" />
        
        {/* Bottom subtle gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-primary/5 to-transparent" />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/40 rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-primary/30 rounded-full animate-[pulse_3s_ease-in-out_infinite]" style={{ animationDelay: "1s" }} />
        <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-accent/40 rounded-full animate-[pulse_5s_ease-in-out_infinite]" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-amber-300/30 rounded-full animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-8 px-6 relative z-10">
        {/* Logo with animation */}
        <div className="animate-fade-in">
          <SamaiLogo size="lg" animated />
        </div>

        {/* Tagline with gradient text */}
        <p className="text-base text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <span className="bg-gradient-to-r from-muted-foreground via-foreground/70 to-muted-foreground bg-clip-text text-transparent">
            Your solar. Your choice.
          </span>
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <button onClick={onNewUser} className="btn-solar w-full text-sm !py-3 relative overflow-hidden group">
            <span className="relative z-10">I am new to Samai</span>
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </button>
          <button onClick={onReturningUser} className="btn-outline-calm w-full text-sm !py-3">
            I am a returning user
          </button>
        </div>

        {/* Bottom accent line */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-fade-in" style={{ animationDelay: "0.6s" }} />
      </div>
    </div>
  );
};

export default WelcomeScreen;
