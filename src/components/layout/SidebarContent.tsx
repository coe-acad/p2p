import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, MessageCircle, Wallet, User } from "lucide-react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Avatar,
} from "@mui/material";
import { useUserData } from "@/hooks/useUserData";
import chatbotIcon from "@/assets/chatbot-icon.png";
import SamaiLogo from "@/components/SamaiLogo";

type TabType = "chat" | "home" | "statements";

const getRouteTab = (pathname: string): TabType => {
  if (pathname.startsWith("/ask-samai") || pathname.startsWith("/buyer-ask-samai")) return "chat";
  if (pathname.startsWith("/payments") || pathname.startsWith("/buyer-payments")) return "statements";
  return "home";
};

const SidebarContent = () => {
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

  const navItems = [
    {
      id: "home" as const,
      label: "Home",
      description: "Overview, trades, and setup",
      icon: Home,
    },
    {
      id: "chat" as const,
      label: t("nav.askSamai"),
      description: "Voice and text commands",
      icon: MessageCircle,
      image: chatbotIcon,
    },
    {
      id: "statements" as const,
      label: t("nav.payments"),
      description: "Settlements and history",
      icon: Wallet,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: `linear-gradient(180deg, rgba(245, 158, 11, 0.02) 0%, rgba(26, 158, 122, 0.01) 100%)`,
        bgcolor: "background.paper",
      }}
    >
      {/* Logo / Brand Section */}
      <Box sx={{ p: 2.5 }}>
        <Button
          fullWidth
          onClick={() => navigate(isBuyer ? "/buyer-home" : "/home")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textTransform: "none",
            color: "text.primary",
            justifyContent: "flex-start",
            p: 1.5,
            borderRadius: 1.5,
            background: `linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(26, 158, 122, 0.05) 100%)`,
            border: "none",
            transition: "all 0.2s ease",
            "&:hover": {
              background: `linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(26, 158, 122, 0.08) 100%)`,
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.12)",
            },
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "transparent",
            }}
          >
            <SamaiLogo size="sm" showText={false} />
          </Avatar>
          <Box sx={{ textAlign: "left" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main" }}>
              Samai
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {isBuyer ? "Clean energy marketplace" : "Solar trading workspace"}
            </Typography>
          </Box>
        </Button>
      </Box>

      {/* Navigation Items */}
      <Stack sx={{ p: 1.5, gap: 0.5, flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              fullWidth
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                textTransform: "none",
                justifyContent: "flex-start",
                p: 1.5,
                borderRadius: 1.5,
                border: "none",
                background: isActive
                  ? `linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(26, 158, 122, 0.04) 100%)`
                  : "transparent",
                color: isActive ? "primary.main" : "text.primary",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: isActive
                    ? `linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(26, 158, 122, 0.08) 100%)`
                    : "rgba(245, 158, 11, 0.06)",
                  boxShadow: isActive ? "0 2px 8px rgba(245, 158, 11, 0.12)" : "none",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  background: isActive
                    ? `linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)`
                    : "rgba(245, 158, 11, 0.1)",
                  color: isActive ? "#fff" : "primary.main",
                }}
              >
                {item.image ? (
                  <img src={item.image} alt={item.label} style={{ width: 24, height: 24 }} />
                ) : (
                  <Icon size={18} />
                )}
              </Avatar>
              <Box sx={{ textAlign: "left" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isActive ? "primary.main" : "text.primary" }}>
                  {item.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: isActive ? "primary.main" : "text.secondary" }}
                >
                  {item.description}
                </Typography>
              </Box>
            </Button>
          );
        })}
      </Stack>

      {/* Profile Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          onClick={() => navigate(isBuyer ? "/buyer-profile" : "/profile")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textTransform: "none",
            justifyContent: "flex-start",
            p: 1.5,
            borderRadius: 1.5,
            border: "none",
            background: "linear-gradient(135deg, rgba(26, 158, 122, 0.04) 0%, rgba(245, 158, 11, 0.02) 100%)",
            color: "text.primary",
            transition: "all 0.2s ease",
            "&:hover": {
              background: "linear-gradient(135deg, rgba(26, 158, 122, 0.08) 0%, rgba(245, 158, 11, 0.06) 100%)",
              boxShadow: "0 2px 8px rgba(26, 158, 122, 0.1)",
            },
          }}
        >
          <Avatar sx={{ width: 44, height: 44, background: "linear-gradient(135deg, #2fb88a 0%, #1a9e7a 100%)" }}>
            <User size={18} color="#fff" />
          </Avatar>
          <Box sx={{ textAlign: "left" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "secondary.main" }}>
              Profile
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Account and preferences
            </Typography>
          </Box>
        </Button>
      </Box>
    </Box>
  );
};

export default SidebarContent;
