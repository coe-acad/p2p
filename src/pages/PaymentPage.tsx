import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";
import MainAppShell from "@/components/layout/MainAppShell";

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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<RazorpayOrderResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const paymentUrl = import.meta.env.VITE_PAYMENT_URL || "http://localhost:8003";

  useEffect(() => {
    const createOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${paymentUrl}/api/payment/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: 100 }),
        });

        if (!response.ok) {
          throw new Error("Failed to create order");
        }

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
    if (!order) {
      setStatus("error");
      setErrorMessage("Payment system not ready");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
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
        setStatus("success");
      },
      prefill: {
        name: "Energy Trader",
        email: "trader@example.com",
        contact: "9000000000",
      },
      theme: {
        color: "#4F69C6",
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to open payment modal");
    }
  };

  return (
    <MainAppShell>
      <div className="screen-container !justify-start !pt-4">
        <div className="w-full max-w-xl flex flex-col h-full px-4 lg:max-w-4xl lg:px-0">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 -ml-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft size={18} className="text-foreground" />
              </button>
              <div>
                <h1 className="text-base font-bold text-foreground">Payment</h1>
                <p className="text-2xs text-muted-foreground">Complete your payment</p>
              </div>
            </div>
            <SamaiLogo size="sm" showText={false} />
          </div>

          {/* Payment Card */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {status === "idle" && (
              <div className="w-full max-w-sm">
                <div className="bg-card rounded-xl p-6 shadow-card mb-4">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
                    <p className="text-4xl font-bold text-foreground">₹1.00</p>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 size={20} className="text-primary animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading payment...</span>
                    </div>
                  ) : order ? (
                    <>
                      <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Order ID</span>
                          <span className="font-medium text-foreground text-xs truncate">{order.order_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Currency</span>
                          <span className="font-medium text-foreground">{order.currency}</span>
                        </div>
                      </div>

                      <button
                        onClick={handlePayNow}
                        className="w-full btn-solar !py-3 text-base font-semibold"
                      >
                        Pay Now
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Unable to load payment details</p>
                    </div>
                  )}
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">
                    This is a test payment. Use Razorpay test credentials to complete the transaction.
                  </p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="w-full max-w-sm text-center">
                <div className="bg-card rounded-xl p-8 shadow-card">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                      <CheckCircle2 size={32} className="text-accent" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Payment Successful!</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your payment of ₹1.00 has been processed successfully.
                  </p>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full btn-solar !py-2.5"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="w-full max-w-sm text-center">
                <div className="bg-card rounded-xl p-8 shadow-card">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                      <AlertCircle size={32} className="text-red-600" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Payment Failed</h2>
                  <p className="text-sm text-muted-foreground mb-2">{errorMessage}</p>
                  <p className="text-xs text-muted-foreground mb-6">
                    Please try again or contact support if the problem persists.
                  </p>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full btn-solar !py-2.5"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainAppShell>
  );
};

export default PaymentPage;
