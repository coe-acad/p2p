import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

const FORECAST_CACHE_KEY = "samai_forecast_cache";
const FORECAST_TTL_MS = 2 * 60 * 60 * 1000;

const readForecastCache = () => {
  try {
    const raw = localStorage.getItem(FORECAST_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > FORECAST_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeForecastCache = (data: unknown) => {
  try {
    localStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Ignore cache write failures.
  }
};

export const useForecast = () => {
  const userId = localStorage.getItem("samai_user_id");
  const cached = useMemo(() => readForecastCache(), []);

  const query = useQuery({
    queryKey: ["forecast", userId],
    enabled: Boolean(userId),
    staleTime: FORECAST_TTL_MS,
    gcTime: 6 * 60 * 60 * 1000,
    refetchInterval: FORECAST_TTL_MS,
    refetchIntervalInBackground: true,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.timestamp,
    queryFn: async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${baseUrl}/api/bpp/catalogue/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          parameters: {},
          timeRange: { hours: 24 },
        }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: (data) => writeForecastCache(data),
  });

  return {
    data: query.data,
    forecastWindows: query.data?.data?.forecast_windows || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
