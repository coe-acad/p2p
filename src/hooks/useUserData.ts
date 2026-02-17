import { useState, useEffect } from "react";

export interface UserData {
  name: string;
  phone: string;
  address: string;
  city: string;
  discom: string;
  consumerId: string;
  automationLevel: "recommend" | "auto";
  // Vacation/holiday preferences for personalized nudges
  schoolHolidays?: string; // e.g., "March 15-30, 2026"
  summerVacationStart?: string; // e.g., "2026-05-01"
  summerVacationEnd?: string; // e.g., "2026-06-15"
  upcomingEvents?: string; // Free-form text for other events
  // Payment settings
  email?: string; // Required for billing
  upiId?: string; // e.g., "archana@upi"
  // Verification status
  isVCVerified?: boolean; // DISCOM VC verification status
  // User context from "Talk to Samai"
  userContext?: string; // Transcribed/typed context about usage patterns
  // Demo mode: returning user with 30 days of trading history
  isReturningUser?: boolean; // If true, shows full transaction history and earnings
}

const DEFAULT_ADDRESS =
  "488, Shyam Nagar Rd, Tarapuri, Meerut, Uttar Pradesh 250002";

const normalizeName = (name?: string) => {
  if (!name) return "Seema";
  const trimmed = name.trim();
  if (/^jyot(h)?irmayee$/i.test(trimmed)) return "Seema";
  return trimmed;
};

const normalizeAddress = () => DEFAULT_ADDRESS;

const DEFAULT_USER_DATA: UserData = {
  name: "Seema", // Default name
  phone: "",
  address: DEFAULT_ADDRESS,
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
  isVCVerified: false, // New users need to verify
  userContext: "",
  isReturningUser: false, // Default to new user
};

const STORAGE_KEY = "samai_user_data";

export const useUserData = () => {
  const [userData, setUserDataState] = useState<UserData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_USER_DATA,
          ...parsed,
          name: normalizeName(parsed?.name),
          address: normalizeAddress(),
        };
      } catch {
        return DEFAULT_USER_DATA;
      }
    }
    return DEFAULT_USER_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, [userData]);

  const setUserData = (updates: Partial<UserData>) => {
    setUserDataState(prev => ({
      ...prev,
      ...updates,
      name: updates.name ? normalizeName(updates.name) : prev.name,
      address: normalizeAddress(),
    }));
  };

  return { userData, setUserData };
};

// Helper to extract locality from full address
export const extractLocality = (fullAddress: string): string => {
  if (!fullAddress) return "";
  const parts = fullAddress.split(",").map(p => p.trim());
  // Return first 2-3 meaningful parts (skip house number if present)
  if (parts.length >= 2) {
    // If first part looks like a house number, skip it
    const startsWithNumber = /^\d/.test(parts[0]);
    if (startsWithNumber && parts.length >= 3) {
      return parts.slice(1, 3).join(", ");
    }
    return parts.slice(0, 2).join(", ");
  }
  return fullAddress;
};
