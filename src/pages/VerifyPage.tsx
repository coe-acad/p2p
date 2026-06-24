import VerificationScreen from "@/components/screens/VerificationScreen";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { ensureUserOnServer, loadUser, saveUser } from "@/services/userService";

const isIntentValue = (value: unknown): value is "sell" | "buy" => value === "sell" || value === "buy";

const VerifyPage = () => {
  const navigate = useNavigate();
  const { setUserData } = useUserData();

  /**
   * After Firebase OTP verification, decide where the user goes.
   *
   * Returning users with intent set → straight to their home.
   * Everyone else (new users, or returning users mid-onboarding) → /intent.
   *
   * The existence check uses GET /api/user/exists. Note: this endpoint is
   * unauthenticated (phone enumeration risk) — flagged for a future hardening
   * pass; not in scope for this UI refresh.
   */
  const handleVerified = async (phone?: string) => {
    if (!phone) return;
    const phoneWithCountry = `+91${phone}`;

    // Drop any stale in-memory user data from a previous session.
    setUserData({});

    let isReturning = false;
    let existingUser: Awaited<ReturnType<typeof loadUser>> | null = null;

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3002";
      const response = await fetch(
        `${BACKEND_URL}/api/user/exists?phone_number=${encodeURIComponent(phoneWithCountry)}`,
      );
      if (response.ok) {
        const result = await response.json();
        isReturning = !!result.exists;
      }
    } catch (err) {
      console.error("Failed to check if user exists:", err);
      // Treat as new user on failure — safer than blocking.
    }

    if (isReturning) {
      try {
        existingUser = await loadUser(phoneWithCountry);
      } catch (err) {
        console.error("Failed to load returning user profile:", err);
      }

      if (existingUser) {
        // UserData type is partial — cast through any for fields the type
        // doesn't yet model (address, consumerId, automationLevel, etc.).
        const existing = existingUser as any;
        const resolvedIntent = isIntentValue(existing.intent) ? existing.intent : undefined;
        const { intent: _existingIntent, ...existingWithoutIntent } = existing;

        setUserData({
          ...existingWithoutIntent,
          phone: phoneWithCountry,
          ...(resolvedIntent ? { intent: resolvedIntent } : {}),
          onboardingComplete: true,
        } as any);

        // Persist intent + profile to Firestore before navigating so guards see fresh state.
        await saveUser({
          phone: phoneWithCountry,
          ...(resolvedIntent ? { intent: resolvedIntent } : {}),
          name: existing.name || "",
          address: existing.address || "",
          city: existing.city || "",
          discom: existing.discom || "",
          consumerId: existing.consumerId || "",
          automationLevel: existing.automationLevel || "recommend",
          onboardingComplete: true,
        } as any).catch((err) => console.error("Failed to save profile to Firestore:", err));

        ensureUserOnServer({
          name: existing.name || "",
          meter_number: existing.consumerId || "",
          discom: existing.discom || "",
          consumerId: existing.consumerId || "",
        }).catch((err) => console.error("Failed to ensure user on server:", err));

        // Mark legacy onboarding flags so older guards keep working.
        localStorage.setItem("samai_onboarding_complete", "true");
        localStorage.setItem("samai_onboarding_location_done", "true");
        localStorage.setItem("samai_onboarding_devices_done", "true");
        localStorage.setItem("samai_onboarding_talk_done", "true");

        const target = resolvedIntent === "buy" ? "/buyer-home" : resolvedIntent === "sell" ? "/home" : "/intent";
        navigate(target, { replace: true });
        return;
      }
      // Backend says "exists" but we couldn't load the profile — fall through
      // to new-user flow so the user isn't stranded.
    }

    // New user (or returning user with no recoverable profile): start fresh onboarding.
    const newUserData = {
      phone: phoneWithCountry,
      onboardingComplete: false,
    };
    setUserData(newUserData as any);

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

    await saveUser({ phone: newUserData.phone } as any).catch((err) =>
      console.error("Failed to save user phone to Firestore:", err),
    );

    navigate("/intent", { replace: true, state: { fromVerification: true } });
  };

  return <VerificationScreen onVerified={handleVerified} />;
};

export default VerifyPage;
