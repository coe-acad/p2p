import VerificationScreen from "@/components/screens/VerificationScreen";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { saveUser } from "@/services/userService";
import { auth } from "@/lib/firebase";
import { resolveRequiredEnv } from "@/services/apiClient";

const VerifyPage = () => {
  const navigate = useNavigate();
  const { setUserData } = useUserData();

  /**
   * After Firebase OTP verification, decide where the user goes — using the
   * backend as the source of truth instead of reading Firestore directly.
   *
   * GET /api/user/me (token-authed) returns the user's full profile from
   * Firestore — name, intent, vc_data, is_vc_verified, etc. — or {} for a
   * brand-new user. Routing reads `intent`:
   *   "buy"   → /buyer-home
   *   "sell"  → /home
   *   missing → /intent (new user or mid-onboarding)
   */
  const handleVerified = async (phone?: string) => {
    if (!phone) return;
    const phoneWithCountry = `+91${phone}`;

    // Drop any stale in-memory user data from a previous session.
    setUserData({});

    const BACKEND_URL = resolveRequiredEnv(
      import.meta.env.VITE_BACKEND_URL,
      "http://localhost:3002",
      "VITE_BACKEND_URL",
    );

    let profile: Record<string, unknown> | null = null;

    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const response = await fetch(`${BACKEND_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          profile = await response.json();
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      // Treat as new user on failure — safer than blocking on a flaky backend.
    }

    const intent = profile?.intent === "buy" || profile?.intent === "sell"
      ? (profile.intent as "buy" | "sell")
      : undefined;

    if (intent && profile) {
      // Returning user — seed userData with everything the backend returned so
      // the home page paints with name/VC details on first render, and so
      // useUserData's hydrateFromBackend doesn't kick off a duplicate fetch.
      setUserData({
        ...(profile as any),
        phone: phoneWithCountry,
        intent,
        onboardingComplete: true,
      } as any);

      // Legacy onboarding flags so older route guards keep working.
      localStorage.setItem("samai_onboarding_complete", "true");
      localStorage.setItem("samai_onboarding_location_done", "true");
      localStorage.setItem("samai_onboarding_devices_done", "true");
      localStorage.setItem("samai_onboarding_talk_done", "true");

      navigate(intent === "buy" ? "/buyer-home" : "/home", { replace: true });
      return;
    }

    // No VC uploaded yet → new user or returning user mid-onboarding.
    setUserData({
      phone: phoneWithCountry,
      onboardingComplete: false,
    } as any);

    // Wipe any stale local flags so guards don't think this user is mid-flow.
    [
      "samai_selected_intent",
      "samai_onboarding_complete",
      "samai_onboarding_location_done",
      "samai_onboarding_devices_done",
      "samai_onboarding_talk_done",
      "samai_aadhaar_verified",
      "samai_published_trades",
      "samai_hide_setup_banner",
      "samai_user_data",
      "samai_onboarding_vc_done",
    ].forEach((k) => localStorage.removeItem(k));

    await saveUser({ phone: phoneWithCountry } as any).catch((err) =>
      console.error("Failed to save user phone to Firestore:", err),
    );

    navigate("/intent", { replace: true, state: { fromVerification: true } });
  };

  return <VerificationScreen onVerified={handleVerified} />;
};

export default VerifyPage;
