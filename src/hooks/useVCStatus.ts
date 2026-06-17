import { useUserData } from "@/hooks/useUserData";

export interface VCStatus {
  consumption: boolean;
  generation: boolean;
  is_vc_verified: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const VC_STATUS_QUERY_KEY = ["vcStatus"] as const;

export const useVCStatus = (): VCStatus => {
  const { userData, profileHydrated } = useUserData();
  const vcData = userData.vc_data || {};

  return {
    consumption: Boolean(vcData.consumption),
    generation: Boolean(vcData.generation),
    is_vc_verified: Boolean(userData.is_vc_verified),
    loading: !profileHydrated,
    error: null,
    refetch: () => {},
  };
};
