import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Check,
  CreditCard,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import MainAppShell from "@/components/layout/MainAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { resolveRequiredEnv } from "@/services/apiClient";

interface RazorpayOrderResponse {
  order_id: string;
  key_id: string;
  amount: number;
  currency: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";

const loadRazorpayScript = async () => {
  if (window.Razorpay) return true;
  const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise<boolean>((resolve) => {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
    });
  }
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<RazorpayOrderResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [paying, setPaying] = useState(false);

  const paymentUrl = resolveRequiredEnv(
    import.meta.env.VITE_PAYMENT_URL,
    "http://localhost:8003",
    "VITE_PAYMENT_URL",
  );

  useEffect(() => {
    const createOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${paymentUrl}/api/payment/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 100 }),
        });
        if (!response.ok) throw new Error("Failed to create order");
        const data: RazorpayOrderResponse = await response.json();
        setOrder(data);
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Failed to create order");
      } finally {
        setLoading(false);
      }
    };
    createOrder();
  }, [paymentUrl]);

  const handlePayNow = async () => {
    if (!order) return;
    setPaying(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setPaying(false);
      setStatus("error");
      setErrorMessage("Failed to load payment gateway. Please try again.");
      return;
    }

    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      description: "Energy Trading Payment",
      handler: () => {
        setPaying(false);
        setStatus("success");
      },
      modal: { ondismiss: () => setPaying(false) },
      prefill: { name: "Energy Trader", email: "trader@example.com", contact: "9000000000" },
      theme: { color: "#1FA855" }, // Atria green
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setPaying(false);
      setStatus("error");
      setErrorMessage("Failed to open payment gateway");
    }
  };

  const amountRupees = order ? (order.amount / 100).toFixed(2) : "1.00";

  // ── SUCCESS STATE ──────────────────────────────────────────
  if (status === "success") {
    return (
      <MainAppShell>
        <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
          <PageContainer gap={4}>
            <div className="mx-auto flex w-full max-w-sm flex-col items-center pt-8 text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <span aria-hidden className="absolute inset-0 rounded-full bg-accent/15 animate-ping" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_10px_24px_-10px_rgba(31,138,82,0.55)]">
                  <Check className="h-8 w-8" strokeWidth={3} />
                </span>
              </div>
              <p className="mt-5 text-base font-medium text-foreground">Payment successful</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-primary nums sm:text-5xl">
                ₹{amountRupees}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Receipt sent to your Razorpay account.</p>

              {order && (
                <div className="mt-6 w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="truncate font-medium text-foreground nums">{order.order_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Currency</span>
                    <span className="font-medium text-foreground">{order.currency}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => navigate(-1)}
                size="lg"
                className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Done
              </Button>
            </div>
          </PageContainer>
        </div>
      </MainAppShell>
    );
  }

  // ── ERROR STATE ────────────────────────────────────────────
  if (status === "error") {
    return (
      <MainAppShell>
        <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
          <PageContainer gap={4}>
            <div className="mx-auto flex w-full max-w-sm flex-col items-center pt-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-8 w-8" />
              </span>
              <p className="mt-5 text-base font-medium text-destructive">Payment failed</p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">{errorMessage}</p>

              <div className="mt-6 flex w-full gap-3">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => {
                    setStatus("idle");
                    setErrorMessage("");
                  }}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Try again
                </Button>
              </div>
            </div>
          </PageContainer>
        </div>
      </MainAppShell>
    );
  }

  // ── IDLE STATE ─────────────────────────────────────────────
  return (
    <MainAppShell>
      <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
        <PageContainer gap={4}>
          {/* Heading */}
          <div className="flex items-center gap-3 fade-in opacity-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Make a payment
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Test transaction via Razorpay.</p>
            </div>
          </div>

          {/* Amount card — hero number in blue, green button below */}
          <div className="rounded-2xl border border-primary/15 bg-card p-6 shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Amount to pay
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-primary nums sm:text-5xl">
              ₹{amountRupees}
            </p>
            <span aria-hidden className="mt-2 block h-[2px] w-8 rounded-full bg-primary" />
            <p className="mt-2 text-xs text-muted-foreground">Charged in {order?.currency ?? "INR"}.</p>

            {/* Order details — only render when order loaded */}
            {loading ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up your payment…
              </div>
            ) : order ? (
              <div className="mt-5 rounded-xl bg-secondary/50 px-4 py-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="truncate font-medium text-foreground nums">{order.order_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium text-foreground">{order.currency}</span>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">Unable to load payment details.</p>
            )}

            <Button
              onClick={handlePayNow}
              disabled={!order || paying || loading}
              size="lg"
              className="mt-6 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening Razorpay
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Pay now
                </>
              )}
            </Button>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/40 px-4 py-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
            <span>
              Secured by Razorpay. Test mode — use card{" "}
              <span className="font-medium text-foreground nums">4111 1111 1111 1111</span>{" "}
              with any future expiry.
            </span>
          </div>
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default PaymentPage;
