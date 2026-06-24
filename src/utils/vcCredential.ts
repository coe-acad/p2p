/** Some issuers wrap the credential one level deep: { credential: {...}, ... }. */
export const unwrapCredential = (parsed: any): any =>
  parsed?.credential && !parsed?.type ? parsed.credential : parsed;
