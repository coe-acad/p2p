import { ReactNode, useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Alert,
  AlertTitle,
  Paper,
} from "@mui/material";
import { Menu as MenuIcon, AlertTriangle } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import SidebarContent from "./SidebarContent";
import MobileBottomNav from "./MobileBottomNav";

interface MainAppShellProps {
  children: ReactNode;
  contentClassName?: string;
  pageTitle?: string;
}

const MainAppShell = ({ children, contentClassName = "", pageTitle = "" }: MainAppShellProps) => {
  const { isOnline } = useNetworkStatus();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const drawerWidth = 288;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        bgcolor: "background.default",
      }}
    >
      {/* Offline Alert */}
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 0, borderRadius: 0 }}>
          <AlertTriangle size={16} style={{ marginRight: 8 }} />
          <AlertTitle>Offline</AlertTitle>
          Trades will sync when connection returns
        </Alert>
      )}

      {/* Main Content Layout */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Desktop Drawer - Permanent */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", lg: "block" },
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderRightColor: "divider",
            },
          }}
        >
          <SidebarContent />
        </Drawer>

        {/* Mobile Drawer - Temporary */}
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "background.paper",
            },
          }}
        >
          <SidebarContent />
        </Drawer>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Mobile AppBar */}
          <AppBar
            position="sticky"
            sx={{
              display: { xs: "flex", lg: "none" },
              bgcolor: "background.paper",
              color: "text.primary",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, transition: "all 0.2s ease" }}
              >
                <MenuIcon size={24} />
              </IconButton>
              {pageTitle && (
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
                  {pageTitle}
                </Typography>
              )}
            </Toolbar>
          </AppBar>

          {/* Page Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: { xs: 2, sm: 3, lg: 4 },
              maxWidth: "100%",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      <Paper
        sx={{
          display: { xs: "flex", lg: "none" },
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderTopColor: "divider",
        }}
        elevation={0}
      >
        <MobileBottomNav />
      </Paper>
    </Box>
  );
};

export default MainAppShell;
