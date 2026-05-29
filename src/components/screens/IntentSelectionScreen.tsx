import { useState } from "react";
import { ArrowLeft, Zap, Leaf, Check, Sun, Sparkles } from "lucide-react";
import { Box, Button, Typography, Stack, IconButton } from "@mui/material";
import SamaiLogo from "../SamaiLogo";

interface IntentSelectionScreenProps {
  onSelect: (intents: ("sell" | "buy")[]) => void;
  onBack: () => void;
}

const IntentSelectionScreen = ({ onSelect, onBack }: IntentSelectionScreenProps) => {
  const [selectedIntent, setSelectedIntent] = useState<"sell" | "buy" | null>(null);

  const handleContinue = () => {
    if (selectedIntent) {
      onSelect([selectedIntent]);
    }
  };

  return (
    <Box sx={{ position: "relative", overflow: "hidden", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "#fef9f5", py: { xs: 2, sm: 4 } }}>
      {/* Background effects */}
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Box sx={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", height: { xs: "240px", sm: "300px" }, width: { xs: "400px", sm: "500px" }, borderRadius: "50%", background: "radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(217, 119, 6, 0.15) 50%, transparent 100%)", filter: "blur(96px)" }} />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)", animation: "shimmer 4s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", top: "28%", left: { xs: "-96px", sm: "-80px" }, height: { xs: "220px", sm: "250px" }, width: { xs: "220px", sm: "250px" }, borderRadius: "50%", background: "radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)", filter: "blur(96px)", animation: "pulse 4s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", top: "46%", right: { xs: "-80px", sm: "-80px" }, height: { xs: "170px", sm: "200px" }, width: { xs: "170px", sm: "200px" }, borderRadius: "50%", background: "radial-gradient(circle, rgba(26, 158, 122, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)", filter: "blur(96px)", animation: "pulse 5s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "150px", background: "linear-gradient(to top, rgba(249, 115, 22, 0.2), transparent)" }} />
        <Box sx={{ position: "absolute", right: "24px", top: "56px", display: { xs: "none", sm: "block" }, color: "rgba(249, 115, 22, 0.2)", animation: "pulse 6s ease-in-out infinite" }}>
          <Sun size={36} />
        </Box>
      </Box>

      <Stack sx={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "448px", flex: 1, flexDirection: "column", px: 0.5 }}>
        {/* Header */}
        <Stack sx={{ mb: { xs: 3, sm: 4 }, flexDirection: "row", alignItems: "center", justifyContent: "space-between", animation: "fadeIn 0.8s ease-in" }}>
          <Button onClick={onBack} sx={{ borderRadius: "999px", border: "1px solid rgba(255, 255, 255, 0.6)", bgcolor: "rgba(255, 255, 255, 0.65)", px: 1.5, py: 1, textTransform: "none", color: "#8b7d70", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)", backdropFilter: "blur(8px)", "&:hover": { color: "#2d2520" } }}>
            <ArrowLeft size={18} style={{ marginRight: 8 }} />
            <span style={{ fontSize: "0.875rem" }}>Back</span>
          </Button>
          <Box sx={{ borderRadius: "999px", border: "1px solid rgba(255, 255, 255, 0.6)", bgcolor: "rgba(255, 255, 255, 0.65)", p: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)", backdropFilter: "blur(8px)" }}>
            <SamaiLogo size="sm" showText={false} />
          </Box>
        </Stack>

        <Stack sx={{ flex: 1, flexDirection: "column", justifyContent: "space-between", gap: { xs: 3, sm: 4 } }}>
          {/* Title */}
          <Box sx={{ textAlign: "center", animation: "slideUp 0.8s ease-out" }}>
            <Box sx={{ mx: "auto", mb: { xs: 1.5, sm: 2 }, width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(249, 115, 22, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ color: "#f59e0b" }} size={22} />
            </Box>
            <Typography variant="caption" sx={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(249, 115, 22, 0.8)" }}>
              Set up your trade intent
            </Typography>
            <Typography variant="h5" sx={{ mx: "auto", mt: 1.5, maxWidth: { xs: "240px", sm: "448px" }, fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              What would you like Samai to help you do?
            </Typography>
            <Typography variant="body2" sx={{ mx: "auto", mt: 1.5, maxWidth: "448px", color: "#8b7d70" }}>
              Start with the action you want right now. You can adjust your role later from profile settings.
            </Typography>
          </Box>

          {/* Intent Cards */}
          <Stack sx={{ gap: 1.5, animation: "slideUp 0.8s ease-out 0.1s both" }}>
            {/* Sell Card */}
            <Button
              onClick={() => setSelectedIntent("sell")}
              sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                textAlign: "left",
                textTransform: "none",
                color: "#2d2520",
                border: selectedIntent === "sell" ? "2px solid #f59e0b" : "2px solid #f5ddc8",
                bgcolor: selectedIntent === "sell" ? "rgba(249, 115, 22, 0.04)" : "rgba(255, 255, 255, 0.7)",
                boxShadow: selectedIntent === "sell" ? "0 8px 16px rgba(245, 158, 11, 0.12)" : "0 2px 8px rgba(245, 158, 11, 0.06)",
                backdropFilter: selectedIntent === "sell" ? "none" : "blur(8px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.1)",
                  borderColor: selectedIntent === "sell" ? "#f59e0b" : "rgba(245, 158, 11, 0.3)",
                },
              }}
            >
              <Box sx={{
                mt: 0.25,
                width: 48,
                height: 48,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                bgcolor: selectedIntent === "sell" ? "#f59e0b" : "rgba(249, 115, 22, 0.1)",
                color: selectedIntent === "sell" ? "white" : "#f59e0b",
                transition: "all 0.3s ease",
                boxShadow: selectedIntent === "sell" ? "0 6px 16px rgba(245, 158, 11, 0.2)" : "none",
              }}>
                <Zap size={22} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Sell excess solar energy</Typography>
                    <Typography variant="caption" sx={{ color: "#8b7d70", mt: 0.5, display: "block" }}>
                      Share surplus generation when your home is producing more than it needs.
                    </Typography>
                  </Box>
                  {selectedIntent === "sell" && (
                    <Box sx={{ mt: 0.25, width: 24, height: 24, borderRadius: "50%", bgcolor: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 8px rgba(245, 158, 11, 0.2)" }}>
                      <Check size={14} color="white" strokeWidth={3} />
                    </Box>
                  )}
                </Box>
              </Box>
            </Button>

            {/* Buy Card */}
            <Button
              onClick={() => setSelectedIntent("buy")}
              sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                textAlign: "left",
                textTransform: "none",
                color: "#2d2520",
                border: selectedIntent === "buy" ? "2px solid #1a9e7a" : "2px solid #f5ddc8",
                bgcolor: selectedIntent === "buy" ? "rgba(26, 158, 122, 0.04)" : "rgba(255, 255, 255, 0.7)",
                boxShadow: selectedIntent === "buy" ? "0 8px 16px rgba(26, 158, 122, 0.12)" : "0 2px 8px rgba(245, 158, 11, 0.06)",
                backdropFilter: selectedIntent === "buy" ? "none" : "blur(8px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(26, 158, 122, 0.1)",
                  borderColor: selectedIntent === "buy" ? "#1a9e7a" : "rgba(26, 158, 122, 0.3)",
                },
              }}
            >
              <Box sx={{
                mt: 0.25,
                width: 48,
                height: 48,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                bgcolor: selectedIntent === "buy" ? "#1a9e7a" : "rgba(26, 158, 122, 0.1)",
                color: selectedIntent === "buy" ? "white" : "#1a9e7a",
                transition: "all 0.3s ease",
                boxShadow: selectedIntent === "buy" ? "0 6px 16px rgba(26, 158, 122, 0.2)" : "none",
              }}>
                <Leaf size={22} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Buy clean energy</Typography>
                    <Typography variant="caption" sx={{ color: "#8b7d70", mt: 0.5, display: "block" }}>
                      Source clean energy from local solar producers in your community.
                    </Typography>
                  </Box>
                  {selectedIntent === "buy" && (
                    <Box sx={{ mt: 0.25, width: 24, height: 24, borderRadius: "50%", bgcolor: "#1a9e7a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 8px rgba(26, 158, 122, 0.2)" }}>
                      <Check size={14} color="white" strokeWidth={3} />
                    </Box>
                  )}
                </Box>
              </Box>
            </Button>
          </Stack>

          {/* Continue Button */}
          <Stack sx={{ gap: 1.5, pt: 1 }}>
            <Button onClick={handleContinue} disabled={!selectedIntent} variant="contained" fullWidth sx={{ py: 2, textTransform: "none", fontWeight: 600 }}>
              Continue
            </Button>
            <Typography variant="caption" sx={{ textAlign: "center", animation: "fadeIn 0.8s ease-in 0.2s both" }}>
              You can change this anytime later.
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default IntentSelectionScreen;
