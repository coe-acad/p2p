import { Component, type ErrorInfo, type ReactNode } from "react";

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
        <div className="min-h-screen bg-background px-6 py-10">
          <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              The app hit an unexpected error. Please reload to continue.
            </p>
            <button onClick={this.handleReload} className="btn-solar mt-6 w-full max-w-xs">
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
