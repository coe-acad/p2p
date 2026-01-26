import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface SuccessScreenProps {
  onContinue: () => void;
}

const SuccessScreen = ({ onContinue }: SuccessScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowConfetti(true), 300);
  }, []);

  return (
    <div className="screen-container relative overflow-hidden">
      {/* Confetti dots */}
      {showConfetti && (
        <>
          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-primary rounded-full animate-bounce opacity-40" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-accent rounded-full animate-bounce opacity-40" style={{ animationDelay: "0.1s" }} />
          <div className="absolute top-1/5 left-1/3 w-2 h-2 bg-primary/30 rounded-full animate-bounce opacity-25" style={{ animationDelay: "0.2s" }} />
        </>
      )}

      <div className="w-full max-w-sm flex flex-col items-center gap-5 px-4 z-10">
        {/* Success Icon */}
        <div className="relative animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-glow-green">
            <Check className="text-accent-foreground" size={28} strokeWidth={2.5} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">You're in!</h2>
          <p className="text-sm text-muted-foreground mt-1">Welcome to the Samai community</p>
        </div>

        {/* Logo */}
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <SamaiLogo size="sm" />
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className="btn-solar w-full text-sm !py-2.5 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          Get started
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
