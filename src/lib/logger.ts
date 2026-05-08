const isDev = import.meta.env.DEV;

const safeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

/**
 * Dev-only and production-safe logging. In production, avoid tokens, raw API bodies, and PII.
 */
export const logger = {
  devLog: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },

  devDebug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },

  devWarn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },

  devError: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },

  /**
   * Production: logs message + short error text only (no arbitrary objects / response dumps).
   */
  error: (message: string, error?: unknown) => {
    if (isDev) {
      console.error(message, error);
      return;
    }
    console.error(message, error !== undefined ? safeErrorMessage(error) : "");
  },
};
