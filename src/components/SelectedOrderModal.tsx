import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnergyListing } from "@/hooks/useDiscoverListings";
import { AlertCircle, ArrowRight, Clock, Loader2, Zap } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface SelectedOrderModalProps {
  isOpen: boolean;
  listing: EnergyListing | null;
  error: string | null;
  status: "idle" | "selecting" | "selected" | "quoting" | "quoted" | "confirming" | "confirmed";
  onRequestInit: () => Promise<void>;
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

export const SelectedOrderModal = ({
  isOpen, listing, error, status, onRequestInit, onBack,
}: SelectedOrderModalProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!listing) return null;

  const totalAmount = listing.price_per_unit * listing.quantity_available;
  const isLoading = status === "quoting";

  const handleProceed = () => {
    setConfirmOpen(false);
    void onRequestInit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onBack}>
      <DialogContent
        className="block w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden p-0 sm:w-full"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Selected offer</DialogTitle>

        {/* GPay-style: recipient pill at top */}
        <div className="flex flex-col items-center gap-3 px-6 pt-7">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-base font-semibold text-accent">
            {sellerInitial(listing.seller_name)}
          </span>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Paying</p>
            <p className="mt-0.5 truncate text-base font-semibold text-foreground">
              {listing.seller_name || "Unknown seller"}
            </p>
          </div>
        </div>

        {/* Big amount — the hero */}
        <div className="mt-4 flex flex-col items-center px-6">
          <p className="text-5xl font-semibold tracking-tight text-foreground nums sm:text-6xl">
            ₹{totalAmount.toFixed(2)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground nums">
            <span>{listing.quantity_available.toFixed(2)}</span>
            <Zap className="h-3 w-3 fill-accent text-accent" strokeWidth={0} />
            <span>{listing.quantity_unit}</span>
            <span>·</span>
            <span>₹{listing.price_per_unit.toFixed(2)}/{listing.quantity_unit}</span>
          </p>
        </div>

        {/* Delivery card */}
        <div className="mx-6 mt-5 rounded-xl border border-border bg-secondary/50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-accent" />
              Delivery
            </div>
            <span className="truncate text-sm font-medium text-foreground">
              {formatDeliveryWindow(listing.delivery_start, listing.delivery_end)}
            </span>
          </div>
        </div>

        {/* Error inline */}
        {error && (
          <div className="mx-6 mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <span className="text-foreground break-words">{error}</span>
          </div>
        )}

        {/* CTAs — tap to open confirm popup */}
        <div className="mt-5 flex items-center gap-3 px-6 pb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isLoading}
            className="text-muted-foreground hover:bg-accent/10 hover:text-foreground"
          >
            Back
          </Button>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={isLoading}
            size="lg"
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Getting quote
              </>
            ) : (
              <>
                Get quote
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => !isLoading && setConfirmOpen(open)}
        title="Are you sure you want to request a quote?"
        description={
          <>
            We'll lock this offer at{" "}
            <span className="font-medium text-foreground nums">₹{totalAmount.toFixed(2)}</span>{" "}
            while you review the seller's terms.
          </>
        }
        proceedLabel="Proceed"
        loading={isLoading}
        onProceed={handleProceed}
      />
    </Dialog>
  );
};
