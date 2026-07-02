import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { resolveRequiredEnv } from "@/services/apiClient";

const isIntentValue = (value: unknown): value is "sell" | "buy" =>
  value === "sell" || value === "buy";

export interface UserData {
  name: string;
  phone: string;
  phone_number?: string;
  uid?: string;
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
  onboardingComplete?: boolean;
}

const normalizeName = (name?: string) => {
  if (!name) return "";
  return name.trim();
};

const getDisplayName = (userData: UserData): string => {
  if (userData.vc_data?.generation?.fullName) {
    return userData.vc_data.generation.fullName;
  }
  if (userData.vc_data?.consumption?.fullName) {
    return userData.vc_data.consumption.fullName;
  }
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
const APP_STATE_STORAGE_KEY = "samai_app_state";

type UserDataListener = () => void;

const safeParseObject = (value: string | null): Record<string, unknown> => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const safeGet = (storage: Storage, key: string) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage can fail in private mode or quota pressure; in-memory state still works.
  }
};

const safeRemove = (storage: Storage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures.
  }
};

const readStoredUserData = (): UserData => {
  const legacyStored = safeParseObject(safeGet(localStorage, LEGACY_STORAGE_KEY));
  const appStored = safeParseObject(safeGet(localStorage, APP_STATE_STORAGE_KEY));
  const sessionStored = safeParseObject(safeGet(sessionStorage, SESSION_STORAGE_KEY));
  const parsed = { ...legacyStored, ...appStored, ...sessionStored } as Record<string, unknown>;

  return {
    ...DEFAULT_USER_DATA,
    ...(parsed as Partial<UserData>),
    name: normalizeName((parsed as Partial<UserData>).name),
    intent: isIntentValue(parsed.intent) ? parsed.intent : undefined,
    is_vc_verified:
      typeof parsed.is_vc_verified === "boolean"
        ? parsed.is_vc_verified
        : DEFAULT_USER_DATA.is_vc_verified,
  };
};

let currentUserData: UserData = readStoredUserData();
let currentProfileHydrated = false;
let authBootstrapStarted = false;
const listeners = new Set<UserDataListener>();

const persistUserData = (data: UserData) => {
  const serialized = JSON.stringify(data);
  safeSet(sessionStorage, SESSION_STORAGE_KEY, serialized);
  safeSet(localStorage, APP_STATE_STORAGE_KEY, serialized);
  safeRemove(localStorage, LEGACY_STORAGE_KEY);
};

const clearPersistedUserData = () => {
  safeRemove(sessionStorage, SESSION_STORAGE_KEY);
  safeRemove(localStorage, APP_STATE_STORAGE_KEY);
  safeRemove(localStorage, LEGACY_STORAGE_KEY);
  safeRemove(localStorage, "samai_user_prefs");
  safeRemove(localStorage, "samai_selected_intent");
};

const notifyUserDataListeners = () => {
  listeners.forEach((listener) => listener());
};

const replaceUserData = (next: UserData, persist = true) => {
  currentUserData = next;
  if (persist) {
    persistUserData(currentUserData);
  }
  notifyUserDataListeners();
};

const setProfileHydrated = (hydrated: boolean) => {
  currentProfileHydrated = hydrated;
  notifyUserDataListeners();
};

const mergeUserData = (updates: Partial<UserData>) => {
  replaceUserData({
    ...currentUserData,
    ...updates,
    name: updates.name ? normalizeName(updates.name) : currentUserData.name,
    intent:
      updates.intent === undefined
        ? currentUserData.intent
        : isIntentValue(updates.intent)
          ? updates.intent
          : undefined,
  });
};

const shouldHydrateFromRemote = (phone: string) => {
  const storedPhone = currentUserData.phone || currentUserData.phone_number;
  return (
    storedPhone !== phone ||
    !isIntentValue(currentUserData.intent) ||
    typeof currentUserData.is_vc_verified !== "boolean"
  );
};

// Backend-driven hydration: fetch the user's full profile from the BPP
// (GET /api/user/me, token-authed). This replaces the previous Firestore
// direct read so the frontend never talks to Firestore for profile data.
// The endpoint returns the underlying users/{phone} doc verbatim — name,
// intent, vc_data fields, etc. — or {} when no profile exists yet.
const hydrateFromBackend = async (phone: string, uid: string | undefined) => {
  const BACKEND_URL = resolveRequiredEnv(
    import.meta.env.VITE_BACKEND_URL,
    "http://localhost:3002",
    "VITE_BACKEND_URL",
  );

  let token: string | undefined;
  try {
    token = await auth.currentUser?.getIdToken();
  } catch {
    token = undefined;
  }
  if (!token) {
    mergeUserData({ phone, phone_number: phone, uid });
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      mergeUserData({ phone, phone_number: phone, uid });
      return;
    }
    const remote = (await response.json()) as Record<string, unknown>;
    const remoteIntent = remote.intent;
    const remoteName = remote.name;

    mergeUserData({
      ...(remote as Partial<UserData>),
      uid,
      intent: isIntentValue(remoteIntent) ? remoteIntent : currentUserData.intent,
      name: typeof remoteName === "string" ? remoteName : currentUserData.name,
      phone: (remote.phone as string) || (remote.phone_number as string) || phone,
      phone_number: (remote.phone_number as string) || phone,
    });
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
    mergeUserData({ phone, phone_number: phone, uid });
  }
};

const startAuthProfileBootstrap = () => {
  if (authBootstrapStarted) return;
  authBootstrapStarted = true;

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      replaceUserData({ ...DEFAULT_USER_DATA }, false);
      clearPersistedUserData();
      setProfileHydrated(true);
      return;
    }

    // Reset hydrated=false the moment a real user shows up, before touching
    // anything else. Firebase's onAuthStateChanged fires with null first
    // during boot and sets hydrated=true; if we don't reset here, the very
    // next fire (real user) leaves guards seeing user+hydrated+intent=undefined
    // for the couple hundred ms it takes /api/user/me to resolve → they briefly
    // Navigate the user to /intent before we correct course. Holding
    // LoadingSpinner during hydration keeps the route stable.
    setProfileHydrated(false);

    if (!firebaseUser.phoneNumber) {
      mergeUserData({ uid: firebaseUser.uid });
      setProfileHydrated(true);
      return;
    }

    const phone = firebaseUser.phoneNumber;
    const needsRemoteHydration = shouldHydrateFromRemote(phone);
    mergeUserData({ uid: firebaseUser.uid, phone, phone_number: phone });

    if (!needsRemoteHydration) {
      setProfileHydrated(true);
      return;
    }

    try {
      await hydrateFromBackend(phone, firebaseUser.uid);
    } catch (err) {
      console.error("Failed to hydrate user profile from backend:", err);
    } finally {
      setProfileHydrated(true);
    }
  });
};

export const useUserData = () => {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const listener = () => setVersion((version) => version + 1);
    listeners.add(listener);
    startAuthProfileBootstrap();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    userData: currentUserData,
    setUserData: mergeUserData,
    profileHydrated: currentProfileHydrated,
    displayName: getDisplayName(currentUserData),
  };
};

