/**
 * Shared helpers for the VC (Verifiable Credential) upload flow.
 * Used by both OnboardingVCPage and VCUploadModal so the two paths
 * stay in lockstep on validation, type detection, and required fields.
 */

export type VCType = "consumption" | "generation";

export const detectVCType = (credential: any): VCType | null => {
  const types = credential.type || [];
  const subjectType = credential.credentialSubject?.type;
  const credentialType = credential.credentialType || "";

  if (
    types.includes("ConsumptionProfileCredential") ||
    subjectType === "ConsumptionProfileCredential" ||
    credentialType.includes("Consumption")
  ) {
    return "consumption";
  }
  if (
    types.includes("GenerationProfileCredential") ||
    subjectType === "GenerationProfileCredential" ||
    credentialType.includes("Generation")
  ) {
    return "generation";
  }
  return null;
};

export const validateRequiredFields = (credential: any, type: VCType): string[] => {
  const errors: string[] = [];
  const subject = credential.credentialSubject || {};

  if (!subject.fullName) errors.push("Full name is missing");
  if (!subject.issuerName) errors.push("Issuer name is missing");

  if (type === "consumption") {
    if (!subject.meterNumber) errors.push("Meter number is missing");
    if (!subject.consumerNumber) errors.push("Consumer number is missing");
  } else if (type === "generation") {
    if (!subject.inverterNumber && !subject.systemId) {
      errors.push("System ID or inverter number is missing");
    }
  }

  return errors;
};

/** Some issuers wrap the credential one level deep: { credential: {...}, ... }. */
export const unwrapCredential = (parsed: any): any =>
  parsed?.credential && !parsed?.type ? parsed.credential : parsed;
