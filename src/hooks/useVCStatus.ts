import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getAuthHeaders } from "@/services/authHeaders";
import { useAuth } from "@/hooks/useAuth";

export interface VCStatus {
  consumption: boolean;
  generation: boolean;
  is_vc_verified: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface VCStatusResponse {
  consumption?: boolean;
  generation?: boolean;
  is_vc_verified?: boolean;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const VC_STATUS_QUERY_KEY = ["vcStatus"] as const;

export const useVCStatus = (): VCStatus => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: VC_STATUS_QUERY_KEY,
    enabled: !!user,
    queryFn: async (): Promise<VCStatusResponse> => {
      const headers = await getAuthHeaders();
      const response = await axios.get<VCStatusResponse>(
        `${BACKEND_URL}/api/vc/status`,
        { headers },
      );
      return response.data;
    },
  });

  return {
    consumption: query.data?.consumption ?? false,
    generation: query.data?.generation ?? false,
    is_vc_verified: query.data?.is_vc_verified ?? false,
    loading: query.isLoading || (query.isFetching && !query.data),
    error: query.error ? (query.error as Error).message : null,
    refetch: () => {
      void query.refetch();
    },
  };
};
