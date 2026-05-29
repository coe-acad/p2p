import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wallet, MessageCircle } from "lucide-react";
import { BottomNavigation, BottomNavigationAction, Box, Avatar } from "@mui/material";
import { useUserData } from "@/hooks/useUserData";
import chatbotIcon from "@/assets/chatbot-icon.png";
import SamaiLogo from "@/components/SamaiLogo";

type TabType = "chat" | "home" | "statements";

const getRouteTab = (pathname: string): TabType => {
  if (pathname.startsWith("/ask-samai") || pathname.startsWith("/buyer-ask-samai")) return "chat";
  if (pathname.startsWith("/payments") || pathname.startsWith("/buyer-payments")) return "statements";
  if (pathname.startsWith("/buyer-home")) return "home";
  if (pathname.startsWith("/home")) return "home";
  return "home";
};

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { userData } = useUserData();
  const isBuyer = userData.intent === "buy";
  const activeTab = getRouteTab(location.pathname);

  const navigateTo = (tab: TabType) => {
    if (tab === "chat") navigate(isBuyer ? "/buyer-ask-samai" : "/ask-samai");
    if (tab === "home") navigate(isBuyer ? "/buyer-home" : "/home");
    if (tab === "statements") navigate(isBuyer ? "/buyer-payments" : "/payments");
  };

  return (
    <BottomNavigation
      value={activeTab}
      onChange={(_, newValue: TabType) => navigateTo(newValue)}
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        "& .MuiBottomNavigationAction-root": {
          color: "text.secondary",
          transition: "all 0.2s ease",
          minWidth: 80,
          py: 1,
          "&.Mui-selected": {
            color: "primary.main",
          },
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.04)",
          },
        },
      }}
    >
      <BottomNavigationAction
        label={t("nav.askSamai")}
        value="chat"
        icon={<img src={chatbotIcon} alt="Ask Samai" style={{ width: 24, height: 24 }} />}
      />
      <BottomNavigationAction
        label="Home"
        value="home"
        icon={
          <Box
            sx={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SamaiLogo size="sm" showText={false} />
          </Box>
        }
      />
      <BottomNavigationAction
        label={t("nav.payments")}
        value="statements"
        icon={<Wallet size={24} />}
      />
    </BottomNavigation>
  );
};

export default MobileBottomNav;
