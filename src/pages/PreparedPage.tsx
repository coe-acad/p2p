import { useNavigate, useLocation } from "react-router-dom";
import { Box, Alert, Button, CircularProgress } from "@mui/material";
import PreparedTomorrowScreen from "@/components/screens/PreparedTomorrowScreen";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";
import { useVCStatus } from "@/hooks/useVCStatus";

const PreparedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tradesData } = usePublishedTrades();
  const { generation: hasGenerationVC, loading: vcLoading } = useVCStatus();
  const isVCVerified = location.state?.isVCVerified ?? false;

  // Only show confirmed trades if explicitly flagged via showConfirmed state OR tradesData flag
  const showConfirmedFromState = location.state?.showConfirmed ?? false;
  const hasConfirmedTrades = showConfirmedFromState && tradesData.showConfirmedTrades && tradesData.confirmedTrades.length > 0;

  // VC Guard: Sellers must have generation profile to publish
  if (!vcLoading && !hasGenerationVC) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3, maxWidth: 600, mx: "auto" }}>
        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>Generation Profile VC Required</strong>
          <Box sx={{ mt: 1, fontSize: "0.95rem" }}>
            To publish your energy catalog, you need to upload your Generation Profile VC first. This verifies your solar generation capacity and allows you to sell energy.
          </Box>
        </Alert>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/settings/vc-documents")}
          sx={{ alignSelf: "flex-start", mt: 2 }}
        >
          Upload Generation Profile VC
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate("/home")}
          sx={{ alignSelf: "flex-start" }}
        >
          Go Back Home
        </Button>
      </Box>
    );
  }

  if (vcLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PreparedTomorrowScreen
      hasConfirmedTrades={hasConfirmedTrades}
      onLooksGood={() => navigate("/published", { state: { isVCVerified } })}
      onViewAdjust={() => navigate("/home")}
      onTalkToSamai={() => navigate("/onboarding/talk", { state: { isVCVerified } })}
      onBack={() => navigate("/home")}
    />
  );
};

export default PreparedPage;
