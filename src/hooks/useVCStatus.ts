import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "@/services/authHeaders";

export interface VCStatus {
  consumption: boolean;
  generation: boolean;
  is_vc_verified: boolean;
  loading: boolean;
  error: string | null;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const useVCStatus = () => {
  const [vcStatus, setVcStatus] = useState<VCStatus>({
    consumption: false,
    generation: false,
    is_vc_verified: false,
    loading: true,
    error: null,
  });

  const fetchVCStatus = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${BACKEND_URL}/api/vc/status`, {
        headers,
      });

      setVcStatus({
        consumption: response.data.consumption || false,
        generation: response.data.generation || false,
        is_vc_verified: response.data.is_vc_verified || false,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Failed to fetch VC status:", err);
      setVcStatus((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load VC status",
      }));
    }
  }, []);

  useEffect(() => {
    fetchVCStatus();
  }, [fetchVCStatus]);

  return { ...vcStatus, refetch: fetchVCStatus };
};
