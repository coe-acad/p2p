import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import type { UserData } from "@/hooks/useUserData";
import { createApiClient, requestWithRetry, toApiError, type RequestOptions } from "@/services/apiClient";
import { getAuthHeaders } from "@/services/authHeaders";
import { EnsureUserResponseSchema } from "@/services/apiSchemas";

const COLLECTION = "users";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3002";
const backendClient = createApiClient(BACKEND_URL);

// Save (merge) user data to Firestore, keyed by phone number
export const saveUser = async (data: UserData): Promise<void> => {
  if (!data.phone) return;
  const userRef = doc(db, COLLECTION, data.phone);
  // Filter out undefined values - Firestore doesn't allow them
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
  await setDoc(
    userRef,
    { ...cleanData, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

// Load user data from Firestore by phone number
export const loadUser = async (phone: string): Promise<Partial<UserData> | null> => {
  const userRef = doc(db, COLLECTION, phone);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as Partial<UserData>;
  }
  return null;
};

export const ensureUserOnServer = async (
  name?: string,
  meter_number?: string,
  options?: RequestOptions
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  const body: Record<string, string> = {};
  if (name) body.name = name;
  if (meter_number) body.meter_number = meter_number;

  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry(
      backendClient,
      { url: "/api/user/ensure", method: "POST", data: body, headers },
      { ...options, retries: 1 }
    );
    EnsureUserResponseSchema.parse(data);
  } catch (error) {
    throw toApiError(error, "Failed to ensure user on server");
  }
};
