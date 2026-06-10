import { useState } from "react";
import Lottie from "lottie-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnergyListing } from "@/hooks/useDiscoverListings";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Clock,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import successCheckAnimation from "@/assets/lottie/success-check.json";

interface QuoteOrderModalProps {
  isOpen: boolean;
  listing: EnergyListing | null;
  quote: any;
  error: string | null;
  status: "idle" | "selecting" | "selected" | "quoting" | "quoted" | "confirming" | "confirmed";
  onGetQuote: () => Promise<void>;
  onConfirm: () => Promise<void>;
  onBack: () => void;
}

const sellerInitial = (name?: string) =>
  (name || "S").trim().split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();

const formatDeliveryWindow = (start?: string, end?: string): string => {
  if (!start && !end) return "Flexible";
  try {
    if (start && end) {
      const sd = new Date(start);
      const ed = new Date(end);
      const day = sd.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const t1 = sd.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
      const t2 = ed.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
      if (sd.toDateString() === ed.toDateString()) return `${day} · ${t1} – ${t2}`;
      const day2 = ed.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      return `${day} ${t1} → ${day2} ${t2}`;
    }
  } catch { /* fall through */ }
  return "Flexible";
};

export const QuoteOrderModal = ({
  isOpen, listing, quote, error, status, onGetQuote, onConfirm, onBack,
}: QuoteOrderModalProps) => {
  // All hooks must run unconditionally — keep them above any early returns.
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isConfirmed = status === "confirmed";
  const isConfirming = status === "confirming";
  const isQuoting = status === "quoting";
  const isBusy = isConfirming || isQuoting;

  if (!listing) return null;

  const quoteItem = quote?.["beckn:orderItems"]?.[0] ?? null;
  const quoteOffer = quoteItem?.["beckn:acceptedOffer"] ?? null;
  const quoteQuantity = Number(
    quoteItem?.["beckn:quantity"]?.unitQuantity ?? listing.quantity_available ?? 0,
  );
  const quoteOrderValue = quote?.orderValue ?? null;
  const quotedUnitPrice = Number(
    quoteOffer?.["beckn:price"]?.["schema:price"] ??
      quoteOffer?.["beckn:price"]?.price ??
      listing.price_per_unit,
  );
  const quotedAmount = Number(
    quoteOrderValue?.total ??
      quoteOffer?.["beckn:price"]?.value ??
      quotedUnitPrice * quoteQuantity,
  );

  const subtotal = quotedUnitPrice * quoteQuantity;
  const networkAdjustment = quotedAmount - subtotal;
  const hasAdjustment = Math.abs(networkAdjustment) > 0.01;
  const hasQuote = Boolean(quote);

  // ─────────────────────────────────────────────────────────
  // CONFIRMED STATE — Lottie-powered success takeover
  // ─────────────────────────────────────────────────────────
  if (isConfirmed) {
    return (
      <Dialog open={isOpen} onOpenChange={onBack}>
        <DialogContent
          className="block w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden p-0 sm:w-full"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Order confirmed</DialogTitle>

          <div className="flex flex-col items-center px-6 pt-8 pb-7">
            {/* Lottie success — premium animated checkmark */}
            <div className="flex h-28 w-28 items-center justify-center">
              <Lottie
                animationData={successCheckAnimation}
                loop={false}
                autoplay
                style={{ width: 140, height: 140 }}
              />
            </div>

            <p className="-mt-1 text-center text-sm font-medium text-foreground/80 fade-in opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
              Payment successful
            </p>

            <p
              className="mt-3 text-4xl font-semibold tracking-tight text-foreground nums sm:text-5xl fade-in opacity-0"
              style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}
            >
              ₹{quotedAmount.toFixed(2)}
            </p>

            <p
              className="mt-1 text-xs text-muted-foreground fade-in opacity-0"
              style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
            >
              Paid to{" "}
              <span className="font-medium text-foreground">
                {listing.seller_name || "Unknown seller"}
              </span>
            </p>

            <div
              className="mt-6 w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-xs space-y-1.5 fade-in opacity-0"
              style={{ animationDelay: "0.75s", animationFillMode: "forwards" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Energy</span>
                <span className="font-medium text-foreground nums">
                  {quoteQuantity.toFixed(2)} {listing.quantity_unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="truncate font-medium text-foreground">
                  {formatDeliveryWindow(listing.delivery_start, listing.delivery_end)}
                </span>
              </div>
            </div>

            <Button
              onClick={onBack}
              size="lg"
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90 fade-in opacity-0"
              style={{ animationDelay: "0.85s", animationFillMode: "forwards" }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─────────────────────────────────────────────────────────
  // PRE-QUOTE STATE — waiting for the user to request a quote
  // (kept for the rare case where quote isn't ready yet)
  // ─────────────────────────────────────────────────────────
  if (!hasQuote) {
    return (
      <Dialog open={isOpen} onOpenChange={isBusy ? () => {} : onBack}>
        <DialogContent
          className="block w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden p-0 sm:w-full"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Request quote</DialogTitle>
          <div className="flex flex-col items-center px-6 py-10">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="h-6 w-6 animate-spin" />
            </span>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Requesting a binding quote from {listing.seller_name || "the seller"}…
            </p>
            <Button variant="ghost" onClick={onBack} className="mt-4 text-xs">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─────────────────────────────────────────────────────────
  // QUOTED STATE — receipt-style breakdown, distinct from /select
  // ─────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={isBusy ? () => {} : onBack}>
      <DialogContent
        className="block w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden p-0 sm:w-full"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Review quote</DialogTitle>

        {/* Header band — distinct from /select's centered avatar pill */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                Quote received
              </p>
              <p className="text-xs text-muted-foreground">
                Binding price from {listing.seller_name || "seller"}
              </p>
            </div>
          </div>
        </div>

        {/* Final price hero */}
        <div className="px-6 pt-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Final price
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground nums sm:text-5xl">
            ₹{quotedAmount.toFixed(2)}
          </p>
          <span aria-hidden className="mt-2 block h-[2px] w-8 rounded-full bg-accent" />
        </div>

        {/* Receipt-style itemised breakdown */}
        <div className="mx-6 mt-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <Zap className="h-3.5 w-3.5 fill-accent text-accent shrink-0" strokeWidth={0} />
              <span className="text-foreground">Energy</span>
              <span className="text-xs text-muted-foreground nums">
                {quoteQuantity.toFixed(2)} {listing.quantity_unit} × ₹{quotedUnitPrice.toFixed(2)}
              </span>
            </div>
            <span className="shrink-0 font-medium text-foreground nums">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          {hasAdjustment && (
            <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-2.5 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {networkAdjustment >= 0 ? "Network fee" : "Discount"}
                </span>
              </div>
              <span className="shrink-0 font-medium text-foreground nums">
                {networkAdjustment >= 0 ? "+" : "−"}₹{Math.abs(networkAdjustment).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-sm">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-base font-semibold text-foreground nums">
              ₹{quotedAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery row — outside the receipt so price stays the focus */}
        <div className="mx-6 mt-3 flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-accent" />
            Delivery
          </div>
          <span className="truncate text-sm font-medium text-foreground">
            {formatDeliveryWindow(listing.delivery_start, listing.delivery_end)}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <span className="text-foreground break-words">{error}</span>
          </div>
        )}

        {/* CTAs — commitment-language pay button */}
        <div className="mt-5 flex items-center gap-3 px-6 pb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isBusy}
            className="text-muted-foreground hover:bg-accent/10 hover:text-foreground"
          >
            Back
          </Button>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={isBusy}
            size="lg"
            className="flex-1 gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming
              </>
            ) : (
              <>
                Pay <span className="nums">₹{quotedAmount.toFixed(2)}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => !isBusy && setConfirmOpen(open)}
        title="Are you sure you want to confirm and pay?"
        description={
          <>
            You'll be charged{" "}
            <span className="font-medium text-foreground nums">₹{quotedAmount.toFixed(2)}</span>{" "}
            and the order will be finalised.
          </>
        }
        proceedLabel="Pay now"
        loading={isBusy}
        onProceed={() => {
          setConfirmOpen(false);
          void onConfirm();
        }}
      />
    </Dialog>
  );
};
