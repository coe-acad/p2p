import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import type { UserData } from "@/hooks/useUserData";
import { createApiClient, requestWithRetry, toApiError, type RequestOptions, BACKEND_URL } from "@/services/apiClient";
import { getAuthHeaders } from "@/services/authHeaders";
import { EnsureUserResponseSchema } from "@/services/apiSchemas";

const COLLECTION = "users";
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

export type EnsureUserPayload = {
  name?: string;
  meter_number?: string;
  discom?: string;
  consumerId?: string;
};
