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
  upiId?: string; // e.g., "archana@upi"
  // Verification status
  isVCVerified?: boolean; // DISCOM VC verification status
}

const DEFAULT_USER_DATA: UserData = {
  name: "Archana M",
  phone: "+91 98765 43210",
  address: "42, 5th Cross, Hebbal",
  city: "Hebbal, Bangalore, Karnataka",
  discom: "BESCOM",
  consumerId: "BESCOM-XXXXXX",
  automationLevel: "recommend",
  schoolHolidays: "",
  summerVacationStart: "",
  summerVacationEnd: "",
  upcomingEvents: "",
  upiId: "",
  isVCVerified: true, // Default to true for demo
};

const STORAGE_KEY = "samai_user_data";

export const useUserData = () => {
  const [userData, setUserDataState] = useState<UserData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_USER_DATA, ...JSON.parse(stored) };
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
    setUserDataState(prev => ({ ...prev, ...updates }));
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
