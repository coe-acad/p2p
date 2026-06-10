import { doc, setDoc, getDoc, serverTimestamp, onSnapshot, Unsubscribe } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import type { UserData } from "@/hooks/useUserData";
import { createApiClient, requestWithRetry, resolveRequiredEnv, toApiError, type RequestOptions } from "@/services/apiClient";
import { getAuthHeaders } from "@/services/authHeaders";
import { EnsureUserResponseSchema } from "@/services/apiSchemas";

const COLLECTION = "users";
const BACKEND_URL = resolveRequiredEnv(import.meta.env.VITE_BACKEND_URL, "http://localhost:3002", "VITE_BACKEND_URL");
const backendClient = createApiClient(BACKEND_URL);

// Save (merge) user data to Firestore, keyed by phone number
export const saveUser = async (data: UserData): Promise<void> => {
  if (!data.phone) return;
  const userRef = doc(db, COLLECTION, data.phone);

  // Whitelist: Only these fields can be saved to Firestore
  const FIELDS_TO_SAVE = new Set([
    "name",
    "phone",
    "phone_number",
    "discom",
    "intent",
    "vc_data",
    "is_vc_verified",
    "aadhaarVerified",
    "vcVerifiedAt",
    "email",
    "isReturningUser",
    "uid",
    "created_at",
    "updated_at",
  ]);

  // Only save whitelisted fields that have values
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(
      ([key, value]) => value !== undefined && FIELDS_TO_SAVE.has(key)
    )
  );

  await setDoc(
    userRef,
    { ...cleanData, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

// Load user data from Firestore by phone number (one-time read)
export const loadUser = async (phone: string): Promise<Partial<UserData> | null> => {
  const userRef = doc(db, COLLECTION, phone);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as Partial<UserData>;
  }
  return null;
};

// Subscribe to real-time user data changes from Firestore
export const subscribeToUser = (
  phone: string,
  onUpdate: (data: Partial<UserData> | null) => void
): Unsubscribe => {
  const userRef = doc(db, COLLECTION, phone);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as Partial<UserData>);
      } else {
        // User document was deleted
        onUpdate(null);
      }
    },
    (error) => {
      console.error("Error subscribing to user data:", error);
    }
  );
};

export type EnsureUserPayload = {
  name?: string;
  meter_number?: string;
  discom?: string;
  consumerId?: string;
};

/** Syncs profile fields to the BPP Firestore-backed user doc (used at publish time). */
export const ensureUserOnServer = async (
  payload?: EnsureUserPayload,
  options?: RequestOptions
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  const body: Record<string, string> = {};
  if (payload?.name) body.name = payload.name;
  if (payload?.meter_number) body.meter_number = payload.meter_number;
  if (payload?.discom) body.discom = payload.discom;
  if (payload?.consumerId) body.consumerId = payload.consumerId;

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
