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
  try {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      await axios.post(
        `${BACKEND_URL}/api/login`,
        {},
        { headers, signal: controller.signal }
      );
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.debug("Login recording timed out, this is non-critical");
    } else {
      console.debug("Failed to record login (non-critical):", error instanceof Error ? error.message : error);
    }
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
