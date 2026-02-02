import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Always return true to force mobile view as the default across all pages
  return true;
}
