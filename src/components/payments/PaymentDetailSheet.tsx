import { Drawer, Box, Typography, Divider, Stack } from "@mui/material";
import { CheckCircle2, Clock, AlertCircle, Zap, TrendingUp, TrendingDown, Sparkles, Building2, Calendar, Timer } from "lucide-react";

type PaymentStatus = "received" | "confirmed" | "pending";

interface PaymentTransaction {
  id: string;
  date: string;
  time: string;
  timeSlot: string;
  units: number;
  pricePerUnit: number;
  buyer: string;
  paymentStatus: PaymentStatus;
}

interface PaymentDetailSheetProps {
  transaction: PaymentTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentDetailSheet = ({ transaction, open, onOpenChange }: PaymentDetailSheetProps) => {
  if (!transaction) return null;

  const amount = transaction.units * transaction.pricePerUnit;

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "received":
        return {
          icon: CheckCircle2,
          label: "Payment Received",
          color: "secondary.main",
          bg: "rgba(26, 158, 122, 0.1)",
          description: "Funds credited to your UPI account"
        };
      case "confirmed":
        return {
          icon: Clock,
          label: "Trade Confirmed",
          color: "primary.main",
          bg: "rgba(245, 158, 11, 0.1)",
          description: "Settlement pending at month end"
        };
      case "pending":
        return {
          icon: AlertCircle,
          label: "Pending Confirmation",
          color: "primary.main",
          bg: "rgba(245, 158, 11, 0.1)",
          description: "Awaiting buyer confirmation"
        };
    }
  };

  const config = getStatusConfig(transaction.paymentStatus);
  const StatusIcon = config.icon;

  const avgMarketRate = 6.35;
  const rateVsMarket = ((transaction.pricePerUnit - avgMarketRate) / avgMarketRate) * 100;
  const isAboveAvg = rateVsMarket > 0;

  const insights = [
    {
      icon: isAboveAvg ? TrendingUp : TrendingDown,
      title: isAboveAvg ? "Above Market Rate" : "Market Rate",
      description: isAboveAvg
        ? `You sold ${Math.abs(rateVsMarket).toFixed(1)}% above the average market rate of ₹${avgMarketRate}/kWh`
        : `Sold at market rate. Peak hours (7-10 AM) often fetch ₹7+/kWh`,
      positive: isAboveAvg
    },
    {
      icon: CheckCircle2,
      title: "Completed Sale",
      description: "Full quantity sold without partial fill or cancellation",
      positive: true
    },
    {
      icon: Zap,
      title: transaction.timeSlot.includes("6:00") || transaction.timeSlot.includes("7:00") ? "Morning Peak" : "Standard Hours",
      description: transaction.timeSlot.includes("6:00") || transaction.timeSlot.includes("7:00")
        ? "Morning slots typically have higher demand from commercial buyers"
        : "Consider targeting 6-9 AM slots for potentially higher rates",
      positive: transaction.timeSlot.includes("6:00") || transaction.timeSlot.includes("7:00")
    }
  ];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={() => onOpenChange(false)}
      PaperProps={{
        sx: {
          height: "85vh",
          borderRadius: "16px 16px 0 0",
          bgcolor: "background.paper",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Order Details</Typography>
        </Box>

        <Box sx={{ overflowY: "auto", flex: 1, p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Amount Header */}
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>+₹{Math.round(amount)}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {Math.round(transaction.units)} kWh @ ₹{transaction.pricePerUnit}/kWh
            </Typography>
          </Box>

          {/* Status Badge */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, bgcolor: config.bg as string, borderRadius: 1.5 }}>
            <StatusIcon size={20} style={{ color: config.color as string }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: config.color }}>{config.label}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{config.description}</Typography>
            </Box>
          </Box>

          {/* Order Details */}
          <Box sx={{ bgcolor: "rgba(245, 158, 11, 0.04)", borderRadius: 1.5, p: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>Trade Information</Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Calendar size={14} />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Date</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{transaction.date}, 2026</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Timer size={14} />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Time Window</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{transaction.timeSlot}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Building2 size={14} />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Buyer</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{transaction.buyer}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Zap size={14} />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Energy Sold</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{transaction.units} kWh</Typography>
              </Box>
            </Stack>
          </Box>

          {/* Samai Insights */}
          <Box sx={{ bgcolor: "rgba(245, 158, 11, 0.05)", borderRadius: 1.5, p: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Sparkles size={16} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Samai Insights</Typography>
            </Box>

            <Stack spacing={1.5}>
              {insights.map((insight, idx) => {
                const InsightIcon = insight.icon;
                return (
                  <Box key={idx} sx={{ display: "flex", gap: 1.5 }}>
                    <Box sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: insight.positive ? "rgba(245, 158, 11, 0.15)" : "rgba(0, 0, 0, 0.05)"
                    }}>
                      <InsightIcon size={12} style={{ color: insight.positive ? "#f59e0b" : "rgba(0, 0, 0, 0.5)" }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>{insight.title}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>{insight.description}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Payment Details */}
          <Box sx={{ bgcolor: "rgba(245, 158, 11, 0.04)", borderRadius: 1.5, p: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>Payment Breakdown</Typography>

            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>Energy Value</Typography>
                <Typography variant="body2">₹{(transaction.units * transaction.pricePerUnit).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>Platform Fee</Typography>
                <Typography variant="body2">₹0.00</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Net Earnings</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>₹{Math.round(amount)}</Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default PaymentDetailSheet;
