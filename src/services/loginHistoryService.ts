import axios from "axios";
import { auth } from "@/lib/firebase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3002";

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

export interface LoginRecord {
  login_id: string;
  phone_number: string;
  login_time: string;
  device_info: string;
  ip_address: string;
}

export const recordLogin = async (): Promise<void> => {
  const headers = await getAuthHeaders();
  try {
    await axios.post(
      `${BACKEND_URL}/api/login`,
      {},
      { headers }
    );
  } catch (error) {
    console.error("Failed to record login:", error);
  }
};

export const getLoginHistory = async (): Promise<LoginRecord[]> => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(
    `${BACKEND_URL}/api/login-history`,
    { headers }
  );
  return data.logins || [];
};
