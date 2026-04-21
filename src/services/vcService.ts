import axios from "axios";
import { auth } from "@/lib/firebase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3002";

export interface VCVerificationResult {
  verified: boolean;
  credential_type?: "GenerationProfileCredential" | "UtilityCustomerCredential";
  fields?: Record<string, any>;
  error?: string;
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

// Parse JSON file and verify with backend
export const verifyVC = async (
  jsonContent: string
): Promise<VCVerificationResult> => {
  try {
    const credential = JSON.parse(jsonContent);

    // Verify with backend
    const headers = await getAuthHeaders();
    const { data } = await axios.post(
      `${BACKEND_URL}/api/vc/verify`,
      { credential },
      { headers }
    );

    return data;
  } catch (err: any) {
    if (err.response?.data?.error) {
      return { verified: false, error: err.response.data.error };
    }
    return {
      verified: false,
      error: err.message || "Failed to verify VC",
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
