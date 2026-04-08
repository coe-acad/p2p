import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  // VC document extracted fields
  vcFullName?: string;
  vcAddress?: string;
  vcConsumerNumber?: string;
  vcMeterNumber?: string;
  vcServiceConnectionDate?: string;
  vcIssuerName?: string;
  vcPremisesType?: string;
  vcConnectionType?: string;
  vcSanctionedLoad?: string;
  vcTariffCategory?: string;
  vcGenerationType?: string;
  vcGenerationCapacity?: string;
  vcCommissioningDate?: string;
  vcManufacturer?: string;
  vcModelNumber?: string;
  // User context from "Talk to Samai"
  userContext?: string;
  // Demo mode: returning user with 30 days of trading history
  isReturningUser?: boolean;
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
  name: "Seema",
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
  isVCVerified: false,
  aadhaarVerified: false,
  userContext: "",
  isReturningUser: false,
};

const STORAGE_KEY = "samai_user_data";

// Sync user data to Firestore, keyed by phone number
const syncToFirestore = async (data: UserData) => {
  if (!data.phone) return;
  try {
    const userRef = doc(db, "users", data.phone);
    await setDoc(
      userRef,
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.error("Firestore sync failed:", err);
  }
};

// Load user data from Firestore by phone number
export const loadUserFromFirestore = async (phone: string): Promise<Partial<UserData> | null> => {
  try {
    const userRef = doc(db, "users", phone);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<UserData>;
    }
    return null;
  } catch (err) {
    console.error("Firestore load failed:", err);
    return null;
  }
};

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
    setUserDataState(prev => {
      const next: UserData = {
        ...prev,
        ...updates,
        name: updates.name ? normalizeName(updates.name) : prev.name,
        address: normalizeAddress(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      syncToFirestore(next);
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