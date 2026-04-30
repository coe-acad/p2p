import { getAuthHeaders } from "@/services/authHeaders";
import { createApiClient, requestWithRetry, toApiError, type RequestOptions } from "@/services/apiClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3002";
const backendClient = createApiClient(BACKEND_URL);

export interface VCVerificationResult {
  verified: boolean;
  credential_type?: "GenerationProfileCredential" | "UtilityCustomerCredential";
  fields?: Record<string, any>;
  error?: string;
}

// Parse JSON file and verify with backend
export const verifyVC = async (
  jsonContent: string,
  options?: RequestOptions
): Promise<VCVerificationResult> => {
  try {
    const credential = JSON.parse(jsonContent);

    // Verify with backend
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<VCVerificationResult>(
      backendClient,
      { url: "/api/vc/verify", method: "POST", data: { credential }, headers },
      { ...options, retries: 1 }
    );

    return data;
  } catch (error: unknown) {
    const apiError = toApiError(error, "Failed to verify VC");
    return {
      verified: false,
      error: apiError.message,
    };
  }
};

// Read file as text
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Extract credential type from JSON
export const getCredentialType = (
  jsonContent: string
): "GenerationProfileCredential" | "UtilityCustomerCredential" | null => {
  try {
    const credential = JSON.parse(jsonContent);
    const types = credential.credential?.type || credential.type || [];

    if (types.includes("GenerationProfileCredential")) {
      return "GenerationProfileCredential";
    }
    if (types.includes("UtilityCustomerCredential")) {
      return "UtilityCustomerCredential";
    }
  } catch {
    return null;
  }
  return null;
};
