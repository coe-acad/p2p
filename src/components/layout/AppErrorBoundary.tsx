import { Component, type ErrorInfo, type ReactNode } from "react";
import { Zap, ZapOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

const reportError = (error: Error, errorInfo: ErrorInfo) => {
  // Telemetry hook point: replace with Sentry/Datadog/etc in production.
  console.error("Unhandled app error:", error, errorInfo);
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="circuit-bg app-viewport-min flex items-center justify-center bg-background px-6 py-10">
          <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-[0_18px_40px_-18px_rgba(20,24,100,0.35)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/[0.05]">
              <ZapOff className="h-7 w-7" />
            </span>
            <p className="kicker-zap mt-5 text-xs font-medium uppercase tracking-[0.18em] text-destructive">Power interrupted</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The app hit an unexpected error. Please reload to continue.
            </p>
            <button onClick={this.handleReload} className={buttonVariants({ size: "lg", className: "mt-6 w-full" })}>
              Reload app
              <Zap className="btn-zap fill-current" strokeWidth={0} />
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
