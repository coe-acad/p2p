import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import WelcomePage from "./pages/WelcomePage";
import IntentPage from "./pages/IntentPage";
import VerifyPage from "./pages/VerifyPage";
import SuccessPage from "./pages/SuccessPage";
import ReturningUserPage from "./pages/ReturningUserPage";
import OnboardingIntroPage from "./pages/OnboardingIntroPage";
import OnboardingLocationPage from "./pages/OnboardingLocationPage";
import OnboardingDevicesPage from "./pages/OnboardingDevicesPage";
import OnboardingTalkPage from "./pages/OnboardingTalkPage";
import CalculatingPage from "./pages/CalculatingPage";
import PreparedPage from "./pages/PreparedPage";
import PublishedPage from "./pages/PublishedPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import ActionLogsPage from "./pages/ActionLogsPage";

// Settings Pages
import RoleSettingsPage from "./pages/settings/RoleSettingsPage";
import MobileSettingsPage from "./pages/settings/MobileSettingsPage";
import DiscomSettingsPage from "./pages/settings/DiscomSettingsPage";
import VCDocumentsPage from "./pages/settings/VCDocumentsPage";
import DevicesSettingsPage from "./pages/settings/DevicesSettingsPage";
import UserContextPage from "./pages/settings/UserContextPage";
import AutomationSettingsPage from "./pages/settings/AutomationSettingsPage";

const queryClient = new QueryClient();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const CALLBACK_ENDPOINTS: Record<string, string> = {
  on_select: `${API_BASE_URL}/api/bap-webhook/on_select`,
  on_init: `${API_BASE_URL}/api/bap-webhook/on_init`,
  on_confirm: `${API_BASE_URL}/api/bap-webhook/on_confirm`,
};

const KNOWN_ACTIONS = new Set(Object.keys(CALLBACK_ENDPOINTS));

const App = () => {
  const processedMessageIds = useRef(new Map<string, number>());

  useEffect(() => {
    const normalizedBase = API_BASE_URL.replace(/\/$/, "");
    const wsBase = normalizedBase.replace(/^http/i, "ws");
    const socket = new WebSocket(`${wsBase}/ws/redis`);

    const cleanupCache = () => {
      const now = Date.now();
      for (const [messageId, ts] of processedMessageIds.current.entries()) {
        if (now - ts > 60000) {
          processedMessageIds.current.delete(messageId);
        }
      }
    };

    socket.onmessage = async (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const payload = parsed.payload ?? parsed;
        const action = (payload?.context?.action || parsed.action || "").toLowerCase();

        if (!KNOWN_ACTIONS.has(action)) {
          return;
        }

        const messageId = payload?.context?.message_id;
        if (!messageId) {
          return;
        }

        cleanupCache();
        if (processedMessageIds.current.has(messageId)) {
          return;
        }
        processedMessageIds.current.set(messageId, Date.now());

        const endpoint = CALLBACK_ENDPOINTS[action];
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("[Redis Stream] Failed to process message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("[Redis Stream] WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Initial Flow */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/intent" element={<IntentPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/returning" element={<ReturningUserPage />} />
            
            {/* Onboarding Steps */}
            <Route path="/onboarding" element={<OnboardingIntroPage />} />
            <Route path="/onboarding/location" element={<OnboardingLocationPage />} />
            <Route path="/onboarding/devices" element={<OnboardingDevicesPage />} />
            <Route path="/onboarding/talk" element={<OnboardingTalkPage />} />
            
            {/* Post-Onboarding */}
            <Route path="/calculating" element={<CalculatingPage />} />
            <Route path="/prepared" element={<PreparedPage />} />
            <Route path="/published" element={<PublishedPage />} />
            
          {/* Main App */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/action-logs" element={<ActionLogsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
            
            {/* Settings Pages */}
            <Route path="/settings/role" element={<RoleSettingsPage />} />
            <Route path="/settings/mobile" element={<MobileSettingsPage />} />
            <Route path="/settings/discom" element={<DiscomSettingsPage />} />
            <Route path="/settings/vc-documents" element={<VCDocumentsPage />} />
            <Route path="/settings/devices" element={<DevicesSettingsPage />} />
            <Route path="/settings/context" element={<UserContextPage />} />
            <Route path="/settings/automation" element={<AutomationSettingsPage />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
