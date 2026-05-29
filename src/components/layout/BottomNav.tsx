import SidebarContent from "./SidebarContent";
import MobileBottomNav from "./MobileBottomNav";

type TabType = "chat" | "home" | "statements";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: TabType) => void;
  mode?: "mobile" | "desktop";
}

export const BottomNav = ({ mode }: BottomNavProps) => {
  if (mode === "desktop") return <SidebarContent />;
  if (mode === "mobile") return <MobileBottomNav />;

  return (
    <>
      <div style={{ display: "none" }}>
        <MobileBottomNav />
      </div>
      <SidebarContent />
    </>
  );
};

export default BottomNav;
