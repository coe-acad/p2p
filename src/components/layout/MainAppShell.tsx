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
    <div className="min-h-[100dvh] bg-background">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              You're offline — trades will sync when connection returns
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1680px]">
        <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0">
          <div className="sticky top-0 h-[100dvh]">
            <BottomNav mode="desktop" />
          </div>
        </aside>

        <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
          <main className="flex-1 overflow-y-auto">
            <div className={`mx-auto w-full px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8 ${contentClassName}`}>
              {children}
            </div>
          </main>

          <div className="lg:hidden">
            <BottomNav mode="mobile" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainAppShell;
