import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import BottomNav from "./BottomNav";

interface MainAppShellProps {
  children: ReactNode;
  contentClassName?: string;
}

const MainAppShell = ({ children, contentClassName = "" }: MainAppShellProps) => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              You're offline — trades will sync when connection returns
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto flex flex-1 w-full max-w-[1680px] min-w-0 overflow-hidden">
        {/* Desktop Sidebar - Sticky at top, scrolls internally */}
        <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-full lg:overflow-y-auto">
          <BottomNav mode="desktop" />
        </aside>

        {/* Main Content Area - Scrollable */}
        <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className={`mx-auto w-full px-4 pt-4 sm:px-6 lg:px-8 lg:pb-8 ${contentClassName}`}>
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile/Tablet Bottom Navigation - Fixed */}
      <nav className="lg:hidden flex-shrink-0">
        <BottomNav mode="mobile" />
      </nav>
    </div>
  );
};

export default MainAppShell;
