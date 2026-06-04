import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUser, loadUser, subscribeToUser } from "@/services/userService";

const isIntentValue = (value: unknown): value is "sell" | "buy" =>
  value === "sell" || value === "buy";

export interface UserData {
  name: string;
  phone: string;
  discom: string;
  email?: string;
  // Verification status
  aadhaarVerified?: boolean;
  vcVerifiedAt?: string;
  // VC data from Firestore
  is_vc_verified?: boolean;
  vc_data?: {
    consumption?: { fullName?: string };
    generation?: { fullName?: string };
  };
  // Demo mode: returning user with 30 days of trading history
  isReturningUser?: boolean;
  // User role: seller or buyer
  intent?: "sell" | "buy";
}

const normalizeName = (name?: string) => {
  if (!name) return "";
  return name.trim();
};

const getDisplayName = (userData: UserData): string => {
  // Use fullName from VC if available (seller's generation or buyer's consumption)
  if (userData.vc_data?.generation?.fullName) {
    return userData.vc_data.generation.fullName;
  }
  if (userData.vc_data?.consumption?.fullName) {
    return userData.vc_data.consumption.fullName;
  }
  // Fallback to name field
  return userData.name || "";
};

const DEFAULT_USER_DATA: UserData = {
  name: "",
  phone: "",
  discom: "",
  email: "",
  aadhaarVerified: false,
  vcVerifiedAt: undefined,
  is_vc_verified: false,
  isReturningUser: false,
  intent: undefined,
};

const LEGACY_STORAGE_KEY = "samai_user_data";
const SESSION_STORAGE_KEY = "samai_user_data_session";

/** Persisted to localStorage — intent is intentionally omitted (Firestore is the source of truth when signed in). */
type UserPrefs = Pick<UserData, "isReturningUser">;

const getUserPrefs = (data: UserData): UserPrefs => ({
  isReturningUser: data.isReturningUser,
});

export const useUserData = () => {
  /** False until Firebase auth has been resolved and Firestore user doc (if any) has been merged in. */
  const [profileHydrated, setProfileHydrated] = useState(false);
  const hadFirebaseUserRef = useRef(false);

  const [userData, setUserDataState] = useState<UserData>(() => {
    const sessionStored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);

    let parsedSession = {};
    let parsedLegacy = {};

    try {
      parsedSession = sessionStored ? JSON.parse(sessionStored) : {};
    } catch {
      parsedSession = {};
    }

    try {
      parsedLegacy = legacyStored ? JSON.parse(legacyStored) : {};
    } catch {
      parsedLegacy = {};
    }

    const parsed = { ...parsedLegacy, ...parsedSession } as Record<string, unknown>;
    const { intent: _staleIntent, name: _oldName, ...parsedWithoutIntent } = parsed;

    return {
      ...DEFAULT_USER_DATA,
      ...(parsedWithoutIntent as Partial<UserData>),
      name: "", // Name comes from vc_data, not from old name field
    };
  });

  // After login, intent and profile must come from Firestore when available (never infer "sell" by default).
  // Set up real-time listener to catch any changes to user data
  useEffect(() => {
    let unsubUser: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous user listener
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }

      if (!firebaseUser) {
        if (hadFirebaseUserRef.current) {
          setUserDataState({ ...DEFAULT_USER_DATA });
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          localStorage.removeItem(PREFS_STORAGE_KEY);
          localStorage.removeItem("samai_selected_intent");
        }
        hadFirebaseUserRef.current = false;
        setProfileHydrated(true);
        return;
      }

      hadFirebaseUserRef.current = true;

      // Only load from Firestore if user is fully authenticated (has UID and phone)
      if (!firebaseUser.uid || !firebaseUser.phoneNumber) {
        setProfileHydrated(true);
        return;
      }

      const phone = firebaseUser.phoneNumber;

      // Set up REAL-TIME listener for user data changes
      unsubUser = subscribeToUser(phone, (remote) => {
        if (remote === null) {
          // User document was deleted from Firestore
          console.warn("User document deleted from Firestore");
          setUserDataState({ ...DEFAULT_USER_DATA });
        } else if (Object.keys(remote).length > 0) {
          const { intent: _remoteIntentField, name: _oldName, ...remoteRest } = remote as Record<string, unknown>;
          setUserDataState((prev) => ({
            ...prev,
            ...(remoteRest as Partial<UserData>),
            intent: isIntentValue(remote.intent) ? remote.intent : undefined,
            // Don't use the old "name" field - it will come from vc_data
            name: "",
            phone: remote.phone || phone || prev.phone,
          }));
        }
        setProfileHydrated(true);
      });
    });

    return () => {
      unsubAuth();
      if (unsubUser) {
        unsubUser();
      }
    };
  }, []);

  useEffect(() => {
    const { intent: _omitIntent, ...persistWithoutIntent } = userData;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(persistWithoutIntent));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [userData]);

  // All fields are locked after onboarding - profile is immutable
  // User data is fully controlled by Firestore and read-only after initial setup
  const LOCKED_FIELDS = [
    "name", "phone", "discom", "email", "aadhaarVerified",
    "vcVerifiedAt", "is_vc_verified", "intent", "isReturningUser"
  ] as const;

  const setUserData = (updates: Partial<UserData>) => {
    setUserDataState(prev => {
      const next: UserData = {
        ...prev,
        ...updates,
        name: updates.name ? normalizeName(updates.name) : prev.name,
      };
      saveUser(next).catch(err => console.error("Firestore sync failed:", err));
      return next;
    });
  };

  return {
    userData,
    setUserData,
    profileHydrated,
    displayName: getDisplayName(userData),
  };
};

// Re-export loadUser for components that need to fetch by phone (e.g. login flow)
export { loadUser as loadUserFromFirestore };