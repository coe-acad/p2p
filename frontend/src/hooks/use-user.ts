import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const USER_CACHE_KEY = "samai_user_cache";
const USER_CACHE_TTL_MS = 30 * 60 * 1000;

const getSessionStatus = () => {
  const lastLoginRaw = localStorage.getItem("samai_last_login");
  if (!lastLoginRaw) return { valid: false };
  const lastLogin = Number(lastLoginRaw);
  if (!Number.isFinite(lastLogin)) return { valid: false };
  return { valid: Date.now() - lastLogin < SESSION_TTL_MS };
};

const readUserCache = () => {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > USER_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

const buildFallbackUserData = () => {
  const name = localStorage.getItem("samai_user_name") || "";
  const phone = localStorage.getItem("samai_user_phone") || "";
  const role = localStorage.getItem("samai_user_role") || "";
  if (!name && !phone && !role) return null;
  return {
    success: true,
    user: {
      id: localStorage.getItem("samai_user_id") || "",
      name,
      phone,
      role,
    },
    credentials: null,
    devices: [],
  };
};

const writeUserCache = (data: unknown) => {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Ignore cache write failures.
  }
};

export const saveUserCache = (data: unknown) => {
  writeUserCache(data);
};

export const useUser = () => {
  const userId = localStorage.getItem("samai_user_id");
  const session = useMemo(() => getSessionStatus(), []);
  const cached = useMemo(() => readUserCache(), []);
  const fallbackData = useMemo(() => buildFallbackUserData(), []);

  const query = useQuery({
    queryKey: ["user", userId],
    enabled: Boolean(userId) && session.valid,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData: cached?.data || fallbackData,
    initialDataUpdatedAt: cached?.timestamp,
    queryFn: async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${baseUrl}/api/bpp/onboarding/user/${userId}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: (data) => writeUserCache(data),
  });

  return {
    userId,
    sessionValid: session.valid,
    data: query.data,
    user: query.data?.user,
    devices: query.data?.devices || [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
