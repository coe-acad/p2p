import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import SVMCHeaderBrand from "@/components/SVMCHeaderBrand";
import { ProfileMenu } from "./ProfileMenu";

interface MainAppShellProps {
  children: ReactNode;
  contentClassName?: string;
  /** kept for back-compat with existing callsites; no longer rendered. */
  pageTitle?: string;
}

/**
 * Minimal app shell — single sticky top header with brand on the left and a
 * profile menu on the right. No sidebar, no bottom nav, no drawer; everything
 * non-page lives inside the ProfileMenu dropdown.
 *
 * Same layout on mobile and desktop — the only thing that scales is the brand
 * mark size and the horizontal padding.
 */
const MainAppShell = ({ children, contentClassName = "" }: MainAppShellProps) => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Offline banner — only when actually offline */}
      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-1.5 text-xs text-amber-900">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>You're offline — trades will sync when you reconnect.</span>
        </div>
      )}

      {/* Sticky header — safe-area padding keeps the bar clear of the device
          status bar on Android/iOS (Capacitor uses overlay=false, but the env
          variable still adds a couple of pixels on notched landscape). */}
      <header
        className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <SVMCHeaderBrand />
          <ProfileMenu />
        </div>
      </header>

      {/* Page content */}
      <main className={`flex-1 ${contentClassName}`}>{children}</main>
    </div>
  );
};

export default MainAppShell;
