import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUser, loadUser } from "@/services/userService";

const isIntentValue = (value: unknown): value is "sell" | "buy" =>
  value === "sell" || value === "buy";

export interface UserData {
  name: string;
  phone: string;
  address: string;
  city: string;
  discom: string;
  consumerId: string;
  automationLevel: "recommend" | "auto";
  // Vacation/holiday preferences for personalized nudges
  schoolHolidays?: string;
  summerVacationStart?: string;
  summerVacationEnd?: string;
  upcomingEvents?: string;
  // Payment settings
  email?: string;
  upiId?: string;
  // Verification status
  isVCVerified?: boolean;
  aadhaarVerified?: boolean;
  vcVerifiedAt?: string;
  // Utility Customer VC fields
  utilityCustomer?: {
    fullName?: string;
    address?: string;
    consumerNumber?: string;
    meterNumber?: string;
    serviceConnectionDate?: string;
    issuerName?: string;
  };
  // Generation Profile VC fields
  generationProfile?: {
    generationType?: string;
    generationCapacity?: string;
    commissioningDate?: string;
    manufacturer?: string;
    modelNumber?: string;
  };
  // User context from "Talk to Samai"
  userContext?: string;
  // Demo mode: returning user with 30 days of trading history
  isReturningUser?: boolean;
  // User role: seller or buyer
  intent?: "sell" | "buy";
}

const normalizeName = (name?: string) => {
  if (!name) return "";
  return name.trim();
};

const normalizeAddress = (address?: string) => {
  if (!address) return "";
  return address.trim();
};

const DEFAULT_USER_DATA: UserData = {
  name: "",
  phone: "",
  address: "",
  city: "",
  discom: "",
  consumerId: "",
  automationLevel: "recommend",
  schoolHolidays: "",
  summerVacationStart: "",
  summerVacationEnd: "",
  upcomingEvents: "",
  email: "",
  upiId: "",
  isVCVerified: false,
  aadhaarVerified: false,
  vcVerifiedAt: undefined,
  utilityCustomer: undefined,
  generationProfile: undefined,
  userContext: "",
  isReturningUser: false,
};

const LEGACY_STORAGE_KEY = "samai_user_data";
const SESSION_STORAGE_KEY = "samai_user_data_session";
const PREFS_STORAGE_KEY = "samai_user_prefs";

/** Persisted to localStorage — intent is intentionally omitted (Firestore is the source of truth when signed in). */
type UserPrefs = Pick<UserData, "automationLevel" | "isReturningUser">;

const getUserPrefs = (data: UserData): UserPrefs => ({
  automationLevel: data.automationLevel,
  isReturningUser: data.isReturningUser,
});

export const useUserData = () => {
  /** False until Firebase auth has been resolved and Firestore user doc (if any) has been merged in. */
  const [profileHydrated, setProfileHydrated] = useState(false);
  const hadFirebaseUserRef = useRef(false);

  const [userData, setUserDataState] = useState<UserData>(() => {
    const sessionStored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
    const prefsStored = localStorage.getItem(PREFS_STORAGE_KEY);

    let parsedSession = {};
    let parsedLegacy = {};
    let parsedPrefs = {};

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

    try {
      parsedPrefs = prefsStored ? JSON.parse(prefsStored) : {};
    } catch {
      parsedPrefs = {};
    }

    const parsed = { ...parsedLegacy, ...parsedSession, ...parsedPrefs } as Record<string, unknown>;
    const { intent: _staleIntent, ...parsedWithoutIntent } = parsed;

    return {
      ...DEFAULT_USER_DATA,
      ...(parsedWithoutIntent as Partial<UserData>),
      name: normalizeName((parsedWithoutIntent as UserData)?.name),
      address: normalizeAddress((parsedWithoutIntent as UserData)?.address),
    };
  });

  // After login, intent and profile must come from Firestore when available (never infer "sell" by default).
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
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

      if (!firebaseUser.phoneNumber) {
        setProfileHydrated(true);
        return;
      }
      const phone = firebaseUser.phoneNumber;
      try {
        const remote = await loadUser(phone);
        if (remote && Object.keys(remote).length > 0) {
          const { intent: _remoteIntentField, ...remoteRest } = remote as Record<string, unknown>;
          setUserDataState((prev) => ({
            ...prev,
            ...(remoteRest as Partial<UserData>),
            intent: isIntentValue(remote.intent) ? remote.intent : undefined,
            name: normalizeName(remote.name ?? prev.name),
            address: normalizeAddress(remote.address ?? prev.address),
            phone: remote.phone || phone || prev.phone,
          }));
        }
      } catch (err) {
        console.error("Failed to hydrate user profile from Firestore:", err);
      } finally {
        setProfileHydrated(true);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const { intent: _omitIntent, ...persistWithoutIntent } = userData;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(persistWithoutIntent));
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(getUserPrefs(userData)));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [userData]);

  const setUserData = (updates: Partial<UserData>) => {
    setUserDataState(prev => {
      const next: UserData = {
        ...prev,
        ...updates,
        name: updates.name ? normalizeName(updates.name) : prev.name,
        address: updates.address ? normalizeAddress(updates.address) : prev.address,
      };
      saveUser(next).catch(err => console.error("Firestore sync failed:", err));
      return next;
    });
  };

  return { userData, setUserData, profileHydrated };
};

// Helper to extract locality from full address
export const extractLocality = (fullAddress: string): string => {
  if (!fullAddress) return "";
  const parts = fullAddress.split(",").map(p => p.trim());
  if (parts.length >= 2) {
    const startsWithNumber = /^\d/.test(parts[0]);
    if (startsWithNumber && parts.length >= 3) {
      return parts.slice(1, 3).join(", ");
    }
    return parts.slice(0, 2).join(", ");
  }
  return fullAddress;
};

// Re-export loadUser for components that need to fetch by phone (e.g. login flow)
export { loadUser as loadUserFromFirestore };