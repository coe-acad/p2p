import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { isNative } from "@/lib/platform";

const ROOT_ROUTES = new Set(["/", "/verify", "/home", "/buyer-home"]);

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNative()) return;

    let handle: { remove: () => Promise<void> } | undefined;

    CapApp.addListener("backButton", () => {
      if (ROOT_ROUTES.has(location.pathname)) {
        void CapApp.exitApp();
        return;
      }
      if (window.history.length > 1) {
        navigate(-1);
        return;
      }
      void CapApp.exitApp();
    }).then((h) => {
      handle = h;
    });

    return () => {
      void handle?.remove();
    };
  }, [navigate, location.pathname]);
};
