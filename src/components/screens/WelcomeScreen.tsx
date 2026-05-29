import { Sun, Sparkles } from "lucide-react";
import { Box, Button, Typography, Stack } from "@mui/material";
import SamaiLogo from "../SamaiLogo";

interface WelcomeScreenProps {
  onNewUser: () => void;
  onReturningUser: () => void;
}

const WelcomeScreen = ({ onNewUser, onReturningUser }: WelcomeScreenProps) => {
  return (
    <Box sx={{ position: "relative", overflow: "hidden", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", bgcolor: "#fef9f5" }}>
      {/* Background gradient effects - Warm & Vibrant */}
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Box sx={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", height: { xs: "280px", sm: "400px" }, width: { xs: "420px", sm: "600px" }, borderRadius: "50%", background: "radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, rgba(217, 119, 6, 0.2) 40%, transparent 100%)", filter: "blur(96px)" }} />

        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)", animation: "shimmer 4s ease-in-out infinite" }} />

        <Box sx={{ position: "absolute", top: "18%", left: { xs: "-96px", sm: "-80px" }, height: { xs: "220px", sm: "300px" }, width: { xs: "220px", sm: "300px" }, borderRadius: "50%", background: "radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)", filter: "blur(96px)", animation: "pulse 4s ease-in-out infinite" }} />

        <Box sx={{ position: "absolute", top: "28%", right: { xs: "-80px", sm: "-80px" }, height: { xs: "180px", sm: "250px" }, width: { xs: "180px", sm: "250px" }, borderRadius: "50%", background: "radial-gradient(circle, rgba(26, 158, 122, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)", filter: "blur(96px)", animation: "pulse 5s ease-in-out 1s infinite" }} />

        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "200px", background: "linear-gradient(to top, rgba(249, 115, 22, 0.3), transparent)" }} />

        <Box sx={{ position: "absolute", top: "25%", left: "25%", width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)", animation: "pulse 3s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", top: "33%", right: "25%", width: "8px", height: "8px", borderRadius: "50%", background: "#1a9e7a", boxShadow: "0 0 16px rgba(26, 158, 122, 0.3)", animation: "pulse 4s ease-in-out 1s infinite" }} />
        <Box sx={{ position: "absolute", top: "66%", left: "33%", width: "6px", height: "6px", borderRadius: "50%", background: "#fbbf24", boxShadow: "0 0 12px rgba(251, 191, 36, 0.3)", animation: "pulse 5s ease-in-out 0.5s infinite" }} />
        <Box sx={{ position: "absolute", bottom: "25%", right: "33%", width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 16px rgba(245, 158, 11, 0.3)", animation: "pulse 4s ease-in-out 2s infinite" }} />

        <Box sx={{ position: "absolute", right: "24px", top: "64px", display: { xs: "none", sm: "block" }, color: "rgba(249, 115, 22, 0.2)", animation: "pulse 6s ease-in-out infinite" }}>
          <Sun size={40} />
        </Box>
        <Box sx={{ position: "absolute", bottom: "112px", left: "24px", display: { xs: "none", sm: "block" }, color: "rgba(251, 191, 36, 0.15)", animation: "pulse 5s ease-in-out 2s infinite" }}>
          <Sparkles size={32} />
        </Box>
      </Box>

      <Stack sx={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "448px", flex: 1, flexDirection: "column", justifyContent: { xs: "space-between", sm: "center" }, gap: { xs: 5, sm: 6 }, px: 0.5, py: { xs: 2, sm: 4 } }}>
        <Stack sx={{ flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <Box sx={{ animation: "fadeIn 0.8s ease-in" }}>
            <SamaiLogo size="lg" animated />
          </Box>

          <Box sx={{ mt: { xs: 3, sm: 4 }, maxWidth: { xs: "288px", sm: "448px" }, animation: "slideUp 0.8s ease-out 0.2s both" }}>
            <Typography variant="caption" sx={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(249, 115, 22, 0.8)" }}>
              Peer-to-peer solar trading
            </Typography>
            <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 700, lineHeight: 1.2, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              Start trading energy in a flow designed for mobile.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, background: "linear-gradient(to right, #b45309, #d97706, #f59e0b)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 600 }}>
              Your solar. Your choice.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ animation: "slideUp 0.8s ease-out 0.4s both" }}>
          <Box sx={{ borderRadius: "28px", border: "1px solid rgba(255, 255, 255, 0.6)", bgcolor: "rgba(255, 255, 255, 0.7)", p: { xs: 2, sm: 2.5 }, boxShadow: "0 24px 60px -30px rgba(249, 115, 22, 0.45)", backdropFilter: "blur(12px)" }}>
            <Stack sx={{ gap: 1.5 }}>
              <Button onClick={onNewUser} variant="contained" fullWidth sx={{ py: 2, position: "relative", overflow: "hidden", textTransform: "none", fontWeight: 600, fontSize: "0.875rem" }}>
                <Sparkles size={16} style={{ marginRight: 8 }} />
                I am new to Samai
              </Button>
              <Button onClick={onReturningUser} variant="outlined" fullWidth sx={{ py: 2, textTransform: "none", fontWeight: 600, fontSize: "0.875rem" }}>
                <Sun size={16} style={{ marginRight: 8, color: "#f59e0b" }} />
                I am a returning user
              </Button>
            </Stack>

            <Stack sx={{ mt: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 1, animation: "fadeIn 0.8s ease-in 0.6s both" }}>
              <Box sx={{ height: "2px", width: "32px", background: "linear-gradient(to right, transparent, rgba(249, 115, 22, 0.5), transparent)" }} />
              <Box sx={{ height: "8px", width: "8px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)" }} />
              <Box sx={{ height: "2px", width: "32px", background: "linear-gradient(to right, transparent, rgba(249, 115, 22, 0.5), transparent)" }} />
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default WelcomeScreen;
