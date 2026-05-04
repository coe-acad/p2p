import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { recordLogin } from "@/services/loginHistoryService";

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
    let timeoutId: NodeJS.Timeout;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (mounted) {
        setUser(firebaseUser);
        setIsLoading(false);
        clearTimeout(timeoutId);

        if (firebaseUser) {
          recordLogin().catch(error => {
            console.error("Failed to record login:", error);
          });
        }
      }
    });

    timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn("Auth initialization timed out, proceeding without user");
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
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