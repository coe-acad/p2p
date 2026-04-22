import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicOnlyRoute, RoleProtectedRoute } from "@/components/layout/ProtectedRoute";

import WelcomePage from "./pages/WelcomePage";
import IntentPage from "./pages/IntentPage";
import VerifyPage from "./pages/VerifyPage";
import SuccessPage from "./pages/SuccessPage";

import OnboardingIntroPage from "./pages/OnboardingIntroPage";
import OnboardingTalkPage from "./pages/OnboardingTalkPage";
import CalculatingPage from "./pages/CalculatingPage";
import EarningsHookPage from "./pages/EarningsHookPage";
import PreparedPage from "./pages/PreparedPage";
import PublishedPage from "./pages/PublishedPage";
import HomePage from "./pages/HomePage";
import BuyerHomePage from "./pages/BuyerHomePage";
import TodayTradesPage from "./pages/TodayTradesPage";
import PaymentsPage from "./pages/PaymentsPage";
import ProfilePage from "./pages/ProfilePage";
import BuyerProfilePage from "./pages/BuyerProfilePage";
import BuyerPaymentsPage from "./pages/BuyerPaymentsPage";
import BuyerAskSamaiPage from "./pages/BuyerAskSamaiPage";
import BuyerOrderHistoryPage from "./pages/BuyerOrderHistoryPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import AskSamaiPage from "./pages/AskSamaiPage";
import NotFound from "./pages/NotFound";

// Settings Pages
import RoleSettingsPage from "./pages/settings/RoleSettingsPage";
import MobileSettingsPage from "./pages/settings/MobileSettingsPage";
import ProfileSettingsPage from "./pages/settings/ProfileSettingsPage";
import DiscomSettingsPage from "./pages/settings/DiscomSettingsPage";
import VCDocumentsPage from "./pages/settings/VCDocumentsPage";
import DevicesSettingsPage from "./pages/settings/DevicesSettingsPage";
import UserContextPage from "./pages/settings/UserContextPage";
import AutomationSettingsPage from "./pages/settings/AutomationSettingsPage";
import VacationsSettingsPage from "./pages/settings/VacationsSettingsPage";
import PaymentSettingsPage from "./pages/settings/PaymentSettingsPage";
import TradeHistorySettingsPage from "./pages/settings/TradeHistorySettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes - redirects to /home if already logged in */}
            <Route path="/" element={<PublicOnlyRoute><WelcomePage /></PublicOnlyRoute>} />
            <Route path="/intent" element={<PublicOnlyRoute><IntentPage /></PublicOnlyRoute>} />
            {/* Verify route: no guard (allows unauthenticated AND authenticating users) */}
            <Route path="/verify" element={<VerifyPage />} />

            {/* Protected routes - redirects to / if not logged in */}
            <Route path="/success" element={<RoleProtectedRoute requiredIntent="sell"><SuccessPage /></RoleProtectedRoute>} />

            {/* Onboarding Steps (Talk to Samai after verification) - Seller only */}
            <Route path="/onboarding" element={<RoleProtectedRoute requiredIntent="sell"><OnboardingIntroPage /></RoleProtectedRoute>} />
            <Route path="/onboarding/talk" element={<RoleProtectedRoute requiredIntent="sell"><OnboardingTalkPage /></RoleProtectedRoute>} />

            {/* Post-Onboarding - Seller only */}
            <Route path="/calculating" element={<RoleProtectedRoute requiredIntent="sell"><CalculatingPage /></RoleProtectedRoute>} />
            <Route path="/earnings" element={<RoleProtectedRoute requiredIntent="sell"><EarningsHookPage /></RoleProtectedRoute>} />
            <Route path="/prepared" element={<RoleProtectedRoute requiredIntent="sell"><PreparedPage /></RoleProtectedRoute>} />
            <Route path="/published" element={<RoleProtectedRoute requiredIntent="sell"><PublishedPage /></RoleProtectedRoute>} />

            {/* Seller Main App */}
            <Route path="/home" element={<RoleProtectedRoute requiredIntent="sell"><HomePage /></RoleProtectedRoute>} />
            <Route path="/ask-samai" element={<RoleProtectedRoute requiredIntent="sell"><AskSamaiPage /></RoleProtectedRoute>} />
            <Route path="/today-trades" element={<RoleProtectedRoute requiredIntent="sell"><TodayTradesPage /></RoleProtectedRoute>} />
            <Route path="/payments" element={<RoleProtectedRoute requiredIntent="sell"><PaymentsPage /></RoleProtectedRoute>} />
            <Route path="/profile" element={<RoleProtectedRoute requiredIntent="sell"><ProfilePage /></RoleProtectedRoute>} />
            <Route path="/order-history" element={<RoleProtectedRoute requiredIntent="sell"><OrderHistoryPage /></RoleProtectedRoute>} />

            {/* Buyer Main App */}
            <Route path="/buyer-home" element={<RoleProtectedRoute requiredIntent="buy"><BuyerHomePage /></RoleProtectedRoute>} />
            <Route path="/buyer-profile" element={<RoleProtectedRoute requiredIntent="buy"><BuyerProfilePage /></RoleProtectedRoute>} />
            <Route path="/buyer-payments" element={<RoleProtectedRoute requiredIntent="buy"><BuyerPaymentsPage /></RoleProtectedRoute>} />
            <Route path="/buyer-ask-samai" element={<RoleProtectedRoute requiredIntent="buy"><BuyerAskSamaiPage /></RoleProtectedRoute>} />
            <Route path="/buyer-order-history" element={<RoleProtectedRoute requiredIntent="buy"><BuyerOrderHistoryPage /></RoleProtectedRoute>} />

            {/* Seller Settings Pages */}
            <Route path="/settings/profile" element={<RoleProtectedRoute requiredIntent="sell"><ProfileSettingsPage /></RoleProtectedRoute>} />
            <Route path="/settings/role" element={<RoleProtectedRoute requiredIntent="sell"><RoleSettingsPage /></RoleProtectedRoute>} />
            <Route path="/settings/mobile" element={<RoleProtectedRoute requiredIntent="sell"><MobileSettingsPage /></RoleProtectedRoute>} />
            <Route path="/settings/discom" element={<RoleProtectedRoute requiredIntent="sell"><DiscomSettingsPage /></RoleProtectedRoute>} />
            <Route path="/settings/vc-documents" element={<RoleProtectedRoute requiredIntent="sell"><VCDocumentsPage /></RoleProtectedRoute>} />
            <Route path="/settings/devices" element={<RoleProtectedRoute requiredIntent="sell"><DevicesSettingsPage /></RoleProtectedRoute>} />
            <Route path="/settings/context" element={<RoleProtectedRoute requiredIntent="sell"><UserContextPage /></RoleProtectedRoute>} />
            <Route path="/settings/automation" element={<RoleProtectedRoute requiredIntent="sell"><AutomationSettingsPage /></RoleProtectedRoute>} />
            <Route path="/settings/vacations" element={<RoleProtectedRoute requiredIntent="sell"><VacationsSettingsPage /></RoleProtectedRoute>} />
            <Route path="/settings/payment" element={<RoleProtectedRoute requiredIntent="sell"><PaymentSettingsPage /></RoleProtectedRoute>} />
            <Route path="/settings/trade-history" element={<RoleProtectedRoute requiredIntent="sell"><TradeHistorySettingsPage /></RoleProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
