import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import { muiTheme } from "./theme/muiTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  PublicOnlyRoute,
  RoleProtectedRoute,
  IntentAccessRoute,
} from "@/components/layout/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";

import IntentPage from "./pages/IntentPage";
import VerifyPage from "./pages/VerifyPage";
import VCPage from "./pages/VCPage";
import OnboardingVCPage from "./pages/OnboardingVCPage";
import HomePage from "./pages/HomePage";
import BuyerHomePage from "./pages/BuyerHomePage";
import TodayTradesPage from "./pages/TodayTradesPage";
import TomorrowTradesPage from "./pages/TomorrowTradesPage";
import PaymentsPage from "./pages/PaymentsPage";
import BuyerPaymentsPage from "./pages/BuyerPaymentsPage";
import BuyerOrderHistoryPage from "./pages/BuyerOrderHistoryPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const AppRoutes = () => {
  useAndroidBackButton();
  return (
    <Routes>
      {/* Single auth entry: phone+OTP. Returning users with intent set are
          redirected to their home by PublicOnlyRoute. */}
      <Route path="/" element={<PublicOnlyRoute><VerifyPage /></PublicOnlyRoute>} />
      <Route path="/verify" element={<PublicOnlyRoute><VerifyPage /></PublicOnlyRoute>} />
      <Route path="/intent" element={<IntentAccessRoute><IntentPage /></IntentAccessRoute>} />

      {/* Legal Pages */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />

      {/* Onboarding Steps - Both buyers and sellers */}
      <Route path="/onboarding/vc" element={<OnboardingVCPage />} />

      {/* VC details (post-upload management) - both intents */}
      <Route path="/vc" element={<VCPage />} />

      {/* Seller Main App */}
      <Route path="/home" element={<RoleProtectedRoute requiredIntent="sell"><HomePage /></RoleProtectedRoute>} />
      <Route path="/today-trades" element={<RoleProtectedRoute requiredIntent="sell"><TodayTradesPage /></RoleProtectedRoute>} />
      <Route path="/tomorrow-trades" element={<RoleProtectedRoute requiredIntent="sell"><TomorrowTradesPage /></RoleProtectedRoute>} />
      <Route path="/payments" element={<RoleProtectedRoute requiredIntent="sell"><PaymentsPage /></RoleProtectedRoute>} />
      <Route path="/order-history" element={<RoleProtectedRoute requiredIntent="sell"><OrderHistoryPage /></RoleProtectedRoute>} />

      {/* Buyer Main App */}
      <Route path="/buyer-home" element={<RoleProtectedRoute requiredIntent="buy"><BuyerHomePage /></RoleProtectedRoute>} />
      <Route path="/buyer-payments" element={<RoleProtectedRoute requiredIntent="buy"><BuyerPaymentsPage /></RoleProtectedRoute>} />
      <Route path="/buyer-order-history" element={<RoleProtectedRoute requiredIntent="buy"><BuyerOrderHistoryPage /></RoleProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    <ThemeProvider theme={muiTheme}>
      <SnackbarProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app-viewport-min bg-background">
            <AppRoutes />
            <Toaster />
        </div>
      </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
    </NextThemesProvider>
  </QueryClientProvider>
);

export default App;
