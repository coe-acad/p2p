import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let softTimeoutId: NodeJS.Timeout;
    let hardTimeoutId: NodeJS.Timeout;
    let sessionTimeoutId: NodeJS.Timeout;

    // If we already have app-side session hints, give Firebase auth restore
    // longer to recover before treating the user as logged out.
    const hasCachedSessionHint =
      Boolean(sessionStorage.getItem("samai_user_data_session")) ||
      Boolean(localStorage.getItem("samai_user_prefs")) ||
      Boolean(localStorage.getItem("samai_onboarding_complete")) ||
      Boolean(localStorage.getItem("samai_selected_intent"));

    const softTimeoutMs = 5000;
    const hardTimeoutMs = hasCachedSessionHint ? 20000 : 10000;
    const SESSION_TIMEOUT_MS = 5 * 60 * 60 * 1000; // 5 hours

    const setupSessionTimeout = () => {
      clearTimeout(sessionTimeoutId);
      sessionTimeoutId = setTimeout(() => {
        if (mounted) {
          console.warn("Session expired after 5 hours, auto-logging out");
          signOut(auth).catch(err => console.error("Auto-logout failed:", err));
        }
      }, SESSION_TIMEOUT_MS);
      localStorage.setItem("samai_session_start", Date.now().toString());
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (mounted) {
        setUser(firebaseUser);
        setIsLoading(false);
        clearTimeout(softTimeoutId);
        clearTimeout(hardTimeoutId);

        if (firebaseUser) {
          setupSessionTimeout();
          recordLogin().catch(error => {
            console.error("Failed to record login:", error);
          });
        } else {
          clearTimeout(sessionTimeoutId);
          localStorage.removeItem("samai_session_start");
        }
      }
    });

    softTimeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn("Auth initialization is slow, still waiting for Firebase session restore");
      }
    }, softTimeoutMs);

    hardTimeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn("Auth initialization timed out, proceeding without user");
        setIsLoading(false);
      }
    }, hardTimeoutMs);

    return () => {
      mounted = false;
      clearTimeout(softTimeoutId);
      clearTimeout(hardTimeoutId);
      clearTimeout(sessionTimeoutId);
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear localStorage on logout
      localStorage.removeItem("samai_user_data");
      localStorage.removeItem("samai_user_prefs");
      localStorage.removeItem("samai_selected_intent");
      sessionStorage.removeItem("samai_user_data_session");
      localStorage.removeItem("samai_onboarding_complete");
      localStorage.removeItem("samai_aadhaar_verified");
      localStorage.removeItem("samai_onboarding_location_done");
      localStorage.removeItem("samai_onboarding_devices_done");
      localStorage.removeItem("samai_onboarding_talk_done");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    logout,
  };
};
