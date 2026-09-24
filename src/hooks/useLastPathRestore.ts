import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const LAST_PATH_KEY = "charzpe:last-path";

// Routes we deliberately do NOT save as the restore target — these are auth
// entry / transient screens, and restoring to them on a cold start would be
// worse than just sending the user to their home.
const IGNORED_PATHS = new Set(["/", "/verify"]);

const safe = <T,>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null;
  }
};

/**
 * Records the current pathname (+ search) into localStorage on every route
 * change so we can restore it after a cold boot (Android process death from
 * recent-tasks reopen, tab reload, etc.). Skips auth-entry routes.
 */
export const useLastPathRestore = () => {
  const location = useLocation();

  useEffect(() => {
    if (IGNORED_PATHS.has(location.pathname)) return;
    safe(() =>
      localStorage.setItem(LAST_PATH_KEY, location.pathname + location.search),
    );
  }, [location.pathname, location.search]);
};

/**
 * Returns the last saved path, or null if none/if it's an ignored route.
 * Route guards read this instead of falling straight through to the persona
 * home when they detect a signed-in user coming in on the app's entry route.
 */
export const getSavedRestorePath = (): string | null => {
  const raw = safe(() => localStorage.getItem(LAST_PATH_KEY));
  if (!raw) return null;
  const pathOnly = raw.split("?")[0] || "";
  if (IGNORED_PATHS.has(pathOnly)) return null;
  return raw;
};

/**
 * Clears the saved path. Called on logout so the next user's session starts
 * at their intent-appropriate home rather than the previous user's last
 * screen.
 */
export const clearSavedRestorePath = () => {
  safe(() => localStorage.removeItem(LAST_PATH_KEY));
};
