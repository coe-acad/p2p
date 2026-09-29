import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Zap, ZapOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="circuit-bg app-viewport-min flex items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-[0_18px_40px_-18px_rgba(20,24,100,0.35)]">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/[0.05]">
          <ZapOff className="h-7 w-7" />
        </span>
        <p className="mt-5 text-6xl font-light tracking-tight text-foreground nums">404</p>
        <p className="kicker-zap mt-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">No power on this line</p>
        <p className="mt-2 text-sm text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className={buttonVariants({ size: "lg", className: "mt-6 w-full" })}>
          Return to Home
          <Zap className="btn-zap fill-current" strokeWidth={0} />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
