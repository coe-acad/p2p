import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { isNative } from "@/lib/platform";
import { useToast } from "@/hooks/use-toast";

// Routes where hardware back should NOT go through the browser history —
// it should show "press back again to exit" and (on the second press) close
// the app. Everything else falls through to navigate(-1).
const ROOT_ROUTES = new Set(["/", "/verify", "/home", "/buyer-home"]);

const DOUBLE_TAP_WINDOW_MS = 2000;

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Refs shadow the current values so the CapApp listener (registered once)
  // always reads the latest without needing to unregister/reregister on every
  // route change. The re-register path had a race — the listener handle came
  // back from a `.then()`, so if the effect cleaned up before the promise
  // settled, the listener stayed live forever and multiple back presses
  // eventually fired.
  const locationRef = useRef(location);
  const navigateRef = useRef(navigate);
  const toastRef = useRef(toast);
  const doubleTapRef = useRef(false);

  locationRef.current = location;
  navigateRef.current = navigate;
  toastRef.current = toast;

  useEffect(() => {
    if (!isNative()) return;

    let handle: { remove: () => Promise<void> } | undefined;
    let cancelled = false;

    const handleBack = () => {
      // 1. Modal / dialog open → close it. Radix UI listens for Escape on
      //    document; synthesizing that keystroke closes the topmost open
      //    dialog (and dropdown/popover), which matches every other Android
      //    app's back-closes-sheet behavior.
      const openDialog = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (openDialog) {
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }),
        );
        return;
      }

      // 2. Root route → double-tap-to-exit pattern. Show a toast on the
      //    first press; if a second press arrives inside the window,
      //    actually exit.
      const path = locationRef.current.pathname;
      if (ROOT_ROUTES.has(path)) {
        if (doubleTapRef.current) {
          void CapApp.exitApp();
          return;
        }
        doubleTapRef.current = true;
        toastRef.current({
          title: "Press back again to exit",
          duration: DOUBLE_TAP_WINDOW_MS,
        });
        setTimeout(() => {
          doubleTapRef.current = false;
        }, DOUBLE_TAP_WINDOW_MS);
        return;
      }

      // 3. Otherwise, go one step back in history.
      navigateRef.current(-1);
    };

    CapApp.addListener("backButton", handleBack).then((h) => {
      if (cancelled) {
        // Effect got cleaned up before addListener resolved — remove
        // immediately so we don't leak a listener.
        void h.remove();
      } else {
        handle = h;
      }
    });

    return () => {
      cancelled = true;
      void handle?.remove();
    };
  }, []);
};
