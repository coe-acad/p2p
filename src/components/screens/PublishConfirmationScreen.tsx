import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublishConfirmationScreenProps {
  onGoHome: () => void;
}

const PublishConfirmationScreen = ({ onGoHome }: PublishConfirmationScreenProps) => {
  const [autoRedirect, setAutoRedirect] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoRedirect((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoRedirect <= 0) onGoHome();
  }, [autoRedirect, onGoHome]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Success check — solid green with ping ring. No gradients. */}
        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-accent/30 animate-ping"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent shadow-[0_10px_24px_-10px_rgba(31,138,82,0.55)]">
            <Check className="h-7 w-7 text-accent-foreground" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title + note */}
        <div className="text-center">
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Your energy is now listed
          </h2>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/[0.05] p-3 text-left">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Bell className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs text-muted-foreground">
              Samai will find the best buyers and notify you as trades confirm.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="w-full">
          <Button onClick={onGoHome} className="w-full" size="lg">
            Go to home
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground nums">
            Redirecting in {autoRedirect}s…
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublishConfirmationScreen;
