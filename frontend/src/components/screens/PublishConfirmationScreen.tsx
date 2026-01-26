import { useEffect, useState } from "react";
import { Check, Bell } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface PublishConfirmationScreenProps {
  onGoHome: () => void;
}

const PublishConfirmationScreen = ({ onGoHome }: PublishConfirmationScreenProps) => {
  const [autoRedirect, setAutoRedirect] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoRedirect((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [onGoHome]);

  useEffect(() => {
    if (autoRedirect === 0) {
      onGoHome();
    }
  }, [autoRedirect, onGoHome]);

  return (
    <div className="screen-container">
      <div className="w-full max-w-sm flex flex-col items-center gap-5 px-4">
        {/* Success Icon */}
        <div className="relative animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-glow-green">
            <Check className="text-accent-foreground" size={28} strokeWidth={2.5} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Your energy is now listed
          </h2>
          <div className="flex items-start gap-2 p-2.5 bg-primary/5 rounded-lg text-left mt-3">
            <Bell className="text-primary flex-shrink-0 mt-0.5" size={14} />
            <p className="text-xs text-muted-foreground">
              Samai will find the best buyers and notify you daily.
            </p>
          </div>
        </div>

        {/* Logo */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <SamaiLogo size="sm" />
        </div>

        {/* CTA */}
        <div className="w-full animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <button onClick={onGoHome} className="btn-solar w-full text-sm !py-2.5">
            Go to Home
          </button>
          <p className="text-2xs text-center text-muted-foreground mt-2">
            Redirecting in {autoRedirect}s...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublishConfirmationScreen;
