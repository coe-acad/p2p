// Razorpay Checkout JS loader + thin promise wrapper around `razorpay.open()`.
//
// We load the script lazily on first use rather than eagerly in index.html so
// non-payment pages stay light. The wrapper resolves on the `handler` callback
// (payment captured) and rejects on `ondismiss` so callers can await it like a
// normal async operation instead of juggling two callbacks.

const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayCtor {
  new (options: unknown): { open: () => void };
}

declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface OpenRazorpayParams {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  prefill?: RazorpayPrefill;
  themeColor?: string;
}

export class RazorpayDismissed extends Error {
  constructor() {
    super("Payment dismissed by user");
    this.name = "RazorpayDismissed";
  }
}

export class RazorpayScriptLoadError extends Error {
  constructor() {
    super("Failed to load Razorpay checkout script");
    this.name = "RazorpayScriptLoadError";
  }
}

export const loadRazorpayScript = async (): Promise<void> => {
  if (typeof window === "undefined") {
    throw new RazorpayScriptLoadError();
  }
  if (window.Razorpay) return;

  const existing = document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new RazorpayScriptLoadError()), { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new RazorpayScriptLoadError());
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = async (
  params: OpenRazorpayParams,
): Promise<RazorpaySuccess> => {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new RazorpayScriptLoadError();

  return new Promise<RazorpaySuccess>((resolve, reject) => {
    // Razorpay fires `handler` on success and `modal.ondismiss` on cancel.
    // If `handler` fires we resolve and the dismiss callback that fires
    // afterwards is a no-op; if dismiss fires first, we reject.
    let settled = false;

    const options = {
      key: params.keyId,
      amount: params.amount,
      currency: params.currency,
      order_id: params.orderId,
      name: params.name ?? "Atria Energy Trading",
      description: params.description ?? "Energy purchase",
      prefill: params.prefill,
      theme: { color: params.themeColor ?? "#1FA855" },
      handler: (response: RazorpaySuccess) => {
        if (settled) return;
        settled = true;
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (settled) return;
          settled = true;
          reject(new RazorpayDismissed());
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      if (settled) return;
      settled = true;
      reject(error instanceof Error ? error : new Error("Failed to open Razorpay"));
    }
  });
};
