import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import IntentPage from "./pages/IntentPage";
import VerifyPage from "./pages/VerifyPage";
import SuccessPage from "./pages/SuccessPage";

import OnboardingIntroPage from "./pages/OnboardingIntroPage";
import OnboardingLocationPage from "./pages/OnboardingLocationPage";
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
import DiscomSettingsPage from "./pages/settings/DiscomSettingsPage";
import VCDocumentsPage from "./pages/settings/VCDocumentsPage";
import DevicesSettingsPage from "./pages/settings/DevicesSettingsPage";
import UserContextPage from "./pages/settings/UserContextPage";
import AutomationSettingsPage from "./pages/settings/AutomationSettingsPage";
import VacationsSettingsPage from "./pages/settings/VacationsSettingsPage";
import PaymentSettingsPage from "./pages/settings/PaymentSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Force mobile viewport wrapper */}
        <div className="max-w-md mx-auto min-h-screen relative">
          <Routes>
            {/* Initial Flow - Welcome is the common landing for all users */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/intent" element={<IntentPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/success" element={<SuccessPage />} />
            
            {/* Onboarding Steps (2 steps: Location+Devices combined, then Talk) */}
            <Route path="/onboarding" element={<OnboardingIntroPage />} />
            <Route path="/onboarding/location" element={<OnboardingLocationPage />} />
            <Route path="/onboarding/talk" element={<OnboardingTalkPage />} />
            
            {/* Post-Onboarding */}
            <Route path="/calculating" element={<CalculatingPage />} />
            <Route path="/earnings" element={<EarningsHookPage />} />
            <Route path="/prepared" element={<PreparedPage />} />
            <Route path="/published" element={<PublishedPage />} />
            
            {/* Main App */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/ask-samai" element={<AskSamaiPage />} />
            <Route path="/today-trades" element={<TodayTradesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            
            {/* Settings Pages */}
            <Route path="/settings/role" element={<RoleSettingsPage />} />
            <Route path="/settings/mobile" element={<MobileSettingsPage />} />
            <Route path="/settings/discom" element={<DiscomSettingsPage />} />
            <Route path="/settings/vc-documents" element={<VCDocumentsPage />} />
            <Route path="/settings/devices" element={<DevicesSettingsPage />} />
            <Route path="/settings/context" element={<UserContextPage />} />
            <Route path="/settings/automation" element={<AutomationSettingsPage />} />
            <Route path="/settings/vacations" element={<VacationsSettingsPage />} />
            <Route path="/settings/payment" element={<PaymentSettingsPage />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
