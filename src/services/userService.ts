import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserData } from "@/hooks/useUserData";

const COLLECTION = "users";

// Save (merge) user data to Firestore, keyed by phone number
export const saveUser = async (data: UserData): Promise<void> => {
  if (!data.phone) return;
  const userRef = doc(db, COLLECTION, data.phone);
  await setDoc(
    userRef,
    { ...data, updatedAt: serverTimestamp() },
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