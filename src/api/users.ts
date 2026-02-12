const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";

export interface RegisterUserRequest {
  mobile_number: string;
  role: "PROSUMER" | "CONSUMER";
}

export const registerUser = async (payload: RegisterUserRequest) => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to register user");
  }

  return response.json();
};

export const updateUserRole = async (payload: RegisterUserRequest) => {
  const response = await fetch(`${API_BASE_URL}/api/users/role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to update user role");
  }

  return response.json();
};

export const loginUser = async (mobile_number: string) => {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mobile_number }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to login");
  }

  return response.json();
};

export interface UserProfileResponse {
  user: {
    id: string;
    mobile_number: string;
    name: string;
    email: string;
    role: "PROSUMER" | "CONSUMER";
    user_status: string;
    kyc_verification_status: string;
    created_at: string;
  };
  is_vc_verified: boolean;
  vc_types: string[];
  merged: Record<string, string>;
  documents: Array<{
    vc_type: string;
    status: string;
    extracted: Record<string, string>;
  }>;
}

export const getUserProfile = async (mobile_number: string): Promise<UserProfileResponse> => {
  const params = new URLSearchParams({ mobile_number });
  const response = await fetch(`${API_BASE_URL}/api/users/profile?${params.toString()}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch user profile");
  }

  return response.json();
};
