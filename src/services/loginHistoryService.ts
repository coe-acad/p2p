import { getAuthHeaders } from "@/services/authHeaders";
import { createApiClient, requestWithRetry, toApiError, type RequestOptions } from "@/services/apiClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3002";
const backendClient = createApiClient(BACKEND_URL);

export interface LoginRecord {
  login_id: string;
  phone_number: string;
  login_time: string;
  device_info: string;
  ip_address: string;
}

export const recordLogin = async (options?: RequestOptions): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    await requestWithRetry(
      backendClient,
      { url: "/api/login", method: "POST", data: {}, headers },
      { timeoutMs: 3000, retries: 0, ...options }
    );
  } catch (error) {
    const apiError = toApiError(error, "Failed to record login");
    if (apiError.isTimeout) {
      console.debug("Login recording timed out, this is non-critical");
    } else {
      console.debug("Failed to record login (non-critical):", apiError.message);
    }
  }
};

export const getLoginHistory = async (options?: RequestOptions): Promise<LoginRecord[]> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<{ logins?: LoginRecord[] }>(
      backendClient,
      { url: "/api/login-history", method: "GET", headers },
      options
    );
    return data.logins || [];
  } catch (error) {
    throw toApiError(error, "Failed to fetch login history");
  }
};
