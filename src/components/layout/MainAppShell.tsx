import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface MainAppShellProps {
  children: ReactNode;
  contentClassName?: string;
}

const MainAppShell = ({ children, contentClassName = "" }: MainAppShellProps) => {
  return (
    <div className="min-h-[100dvh] bg-background">
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
