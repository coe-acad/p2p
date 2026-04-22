import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/layout/ProtectedRoute";

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
import TodayTradesPage from "./pages/TodayTradesPage";
import PaymentsPage from "./pages/PaymentsPage";
import ProfilePage from "./pages/ProfilePage";
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
            <Route path="/verify" element={<PublicOnlyRoute><VerifyPage /></PublicOnlyRoute>} />

            {/* Protected routes - redirects to / if not logged in */}
            <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
            
            {/* Onboarding Steps (Talk to Samai after verification) */}
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingIntroPage /></ProtectedRoute>} />
            <Route path="/onboarding/talk" element={<ProtectedRoute><OnboardingTalkPage /></ProtectedRoute>} />

            {/* Post-Onboarding */}
            <Route path="/calculating" element={<ProtectedRoute><CalculatingPage /></ProtectedRoute>} />
            <Route path="/earnings" element={<ProtectedRoute><EarningsHookPage /></ProtectedRoute>} />
            <Route path="/prepared" element={<ProtectedRoute><PreparedPage /></ProtectedRoute>} />
            <Route path="/published" element={<ProtectedRoute><PublishedPage /></ProtectedRoute>} />

            {/* Main App */}
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/ask-samai" element={<ProtectedRoute><AskSamaiPage /></ProtectedRoute>} />
            <Route path="/today-trades" element={<ProtectedRoute><TodayTradesPage /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/order-history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />

            {/* Settings Pages */}
            <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/role" element={<ProtectedRoute><RoleSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/mobile" element={<ProtectedRoute><MobileSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/discom" element={<ProtectedRoute><DiscomSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/vc-documents" element={<ProtectedRoute><VCDocumentsPage /></ProtectedRoute>} />
            <Route path="/settings/devices" element={<ProtectedRoute><DevicesSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/context" element={<ProtectedRoute><UserContextPage /></ProtectedRoute>} />
            <Route path="/settings/automation" element={<ProtectedRoute><AutomationSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/vacations" element={<ProtectedRoute><VacationsSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/payment" element={<ProtectedRoute><PaymentSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/trade-history" element={<ProtectedRoute><TradeHistorySettingsPage /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
