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
          address: normalizeAddress(parsed?.address),
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
    setUserDataState(prev => {
      const next: UserData = {
        ...prev,
        ...updates,
        name: updates.name ? normalizeName(updates.name) : prev.name,
        address: updates.address ? normalizeAddress(updates.address) : prev.address,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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