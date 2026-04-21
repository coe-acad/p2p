import { ReactNode, useState } from "react";
import BottomNav from "./BottomNav";

type TabType = "chat" | "home" | "statements";

interface AppLayoutProps {
  children: ReactNode;
  initialTab?: TabType;
}

export const AppLayout = ({ children, initialTab = "home" }: AppLayoutProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar nav (desktop only) */}
      <div className="hidden md:block">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Bottom nav (mobile only) */}
        <div className="md:hidden">
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
