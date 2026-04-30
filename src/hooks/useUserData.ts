import { useState, useEffect } from "react";
import { saveUser, loadUser } from "@/services/userService";

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
  intent: "sell",
};

const LEGACY_STORAGE_KEY = "samai_user_data";
const SESSION_STORAGE_KEY = "samai_user_data_session";
const PREFS_STORAGE_KEY = "samai_user_prefs";

type UserPrefs = Pick<UserData, "intent" | "automationLevel" | "isReturningUser">;

const getUserPrefs = (data: UserData): UserPrefs => ({
  intent: data.intent,
  automationLevel: data.automationLevel,
  isReturningUser: data.isReturningUser,
});

export const useUserData = () => {
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

    const parsed = { ...parsedLegacy, ...parsedSession, ...parsedPrefs };

    return {
      ...DEFAULT_USER_DATA,
      ...parsed,
      name: normalizeName((parsed as UserData)?.name),
      address: normalizeAddress((parsed as UserData)?.address),
    };
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(getUserPrefs(userData)));
    // Remove legacy long-lived storage of sensitive profile fields.
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

  return { userData, setUserData };
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