import type { VCExtractedData } from "@/utils/vcPdfParser";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";
const VC_UPLOAD_URL = `${API_BASE_URL}/api/vc/upload`;

export interface VcUploadDocument {
  id: number;
  filename: string;
  vc_type: string;
  status: string;
  extracted: VCExtractedData;
}

export interface VcUploadResponse {
  user_id: string;
  documents: VcUploadDocument[];
  merged: VCExtractedData;
}

export const uploadVcDocuments = async (
  files: File[],
  mobileNumber?: string,
): Promise<VcUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (mobileNumber) {
    formData.append("mobile_number", mobileNumber);
  }

  const response = await fetch(VC_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to upload VC documents";
    let details: any = null;
    try {
      details = await response.json();
      message = details?.detail?.message || details?.detail || message;
    } catch {
      try {
        message = await response.text();
      } catch {
        // ignore
      }
    }
    const error: any = new Error(message || "Failed to upload VC documents");
    error.details = details?.detail || details;
    throw error;
  }

  return response.json();
};
