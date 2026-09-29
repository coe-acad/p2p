const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Some issuers wrap the credential one level deep: { credential: {...}, ... }. */
export const unwrapCredential = (parsed: unknown): unknown =>
  isObject(parsed) && parsed.credential && !parsed.type ? parsed.credential : parsed;

/** credentialSubject.fullName, when the uploaded credential carries one. */
export const credentialFullName = (credential: unknown): string | null => {
  const subject = isObject(credential) ? credential.credentialSubject : undefined;
  const name = isObject(subject) ? subject.fullName : undefined;
  return typeof name === "string" && name ? name : null;
};
