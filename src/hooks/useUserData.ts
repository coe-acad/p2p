import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { loadUser } from "@/services/userService";

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

const applyRemoteUserData = (
  phone: string,
  uid: string | undefined,
  remote: Partial<UserData> | null,
) => {
  if (!remote || Object.keys(remote).length === 0) {
    mergeUserData({ phone, phone_number: phone, uid });
    return;
  }

  const { intent: remoteIntent, name: remoteName, ...remoteRest } = remote as Record<string, unknown>;
  mergeUserData({
    ...(remoteRest as Partial<UserData>),
    uid,
    intent: isIntentValue(remoteIntent) ? remoteIntent : currentUserData.intent,
    name: typeof remoteName === "string" ? remoteName : currentUserData.name,
    phone: (remote.phone as string) || (remote.phone_number as string) || phone,
    phone_number: (remote.phone_number as string) || phone,
  });
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
      const remote = await loadUser(phone);
      applyRemoteUserData(phone, firebaseUser.uid, remote);
    } catch (err) {
      console.error("Failed to hydrate user profile from Firestore:", err);
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

// Re-export loadUser for components that need to fetch by phone during login.
export { loadUser as loadUserFromFirestore };
