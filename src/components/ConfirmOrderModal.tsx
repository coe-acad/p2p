import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EnergyListing } from "@/hooks/useDiscoverListings";
import { AlertCircle, Clock, Loader2, MapPin, Zap } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ConfirmOrderModalProps {
  isOpen: boolean;
  listing: EnergyListing | null;
  offers: EnergyListing[];
  error: string | null;
  status:
    | "idle"
    | "selecting"
    | "selected"
    | "quoting"
    | "quoted"
    | "paying"
    | "verifying"
    | "finalising"
    | "confirmed";
  onSelectOffer: (offer: EnergyListing) => Promise<void>;
  onCancel: () => void;
}

const formatRange = (startIso?: string, endIso?: string): string => {
  if (!startIso && !endIso) return "Flexible";
  try {
    const fmt = (iso: string) =>
      new Date(iso).toLocaleString("en-IN", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
      });
    if (startIso && endIso) {
      const sd = new Date(startIso);
      const ed = new Date(endIso);
      if (sd.toDateString() === ed.toDateString()) {
        const day = sd.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        const t1 = sd.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
        const t2 = ed.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
        return `${day} · ${t1} – ${t2}`;
      }
      return `${fmt(startIso)} → ${fmt(endIso)}`;
    }
    return fmt(startIso || endIso!);
  } catch {
    return "Flexible";
  }
};

export const ConfirmOrderModal = ({
  isOpen, listing, offers, error, status, onSelectOffer, onCancel,
}: ConfirmOrderModalProps) => {
  const [selectingOfferId, setSelectingOfferId] = useState<string | null>(null);
  const [pendingOffer, setPendingOffer] = useState<EnergyListing | null>(null);

  const handleSelectOffer = async (offer: EnergyListing) => {
    setSelectingOfferId(offer.id);
    setPendingOffer(null);
    try {
      await onSelectOffer(offer);
    } finally {
      setSelectingOfferId(null);
    }
  };

  if (!listing) return null;
  const isAnySelecting = status === "selecting";

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="block w-[calc(100vw-2rem)] max-w-[520px] overflow-hidden p-0 sm:w-full">
        {/* Light green header strip — same magnetic-stripe motif as listing cards */}
        <div className="w-full bg-accent/15 px-5 py-4">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Choose an offer
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Pick one offer from this catalog to get a quote.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="w-full space-y-4 px-5 pb-5 pt-4">
          {/* Seller summary row */}
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            <span className="min-w-0 truncate font-medium text-foreground">{listing.seller_name || "Unknown seller"}</span>
            <span className="shrink-0 text-muted-foreground/40">·</span>
            <span className="shrink-0 text-muted-foreground nums">
              {offers.length} offer{offers.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Offer list — scrollbar-gutter reserves space for the vertical scrollbar
              even when not visible, so cards don't reflow / overflow horizontally
              when going from 1 to many offers. */}
          <div
            className="max-h-[420px] min-w-0 space-y-3 overflow-y-auto overflow-x-hidden"
            style={{ scrollbarGutter: "stable" }}
          >
            {offers.map((offer) => {
              const offerTotal = offer.price_per_unit * offer.quantity_available;
              const isThisLoading = selectingOfferId === offer.id;

              return (
                <div
                  key={offer.id}
                  className="group w-full min-w-0 rounded-xl border border-primary/12 bg-card p-4 transition-all duration-200 ease-out
                             hover:-translate-y-0.5 hover:border-primary/40
                             hover:shadow-[0_8px_22px_-14px_rgba(36,40,128,0.28)]"
                >
                  {/* Top row — price hero + qty */}
                  <div className="flex min-w-0 items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-2xl font-semibold tracking-tight text-primary nums">
                        ₹{offer.price_per_unit.toFixed(2)}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          /{offer.quantity_unit}
                        </span>
                      </p>
                      <span aria-hidden className="mt-1 block h-[2px] w-6 rounded-full bg-primary" />
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Available
                      </p>
                      <p className="mt-0.5 text-lg font-semibold text-foreground nums">
                        {offer.quantity_available.toFixed(2)}{" "}
                        <span className="inline-flex items-center gap-0.5 text-sm font-medium text-muted-foreground">
                          <Zap className="h-3 w-3 fill-accent text-accent" strokeWidth={0} />
                          {offer.quantity_unit}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Delivery line */}
                  <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span className="truncate">{formatRange(offer.delivery_start, offer.delivery_end)}</span>
                  </div>

                  {/* Footer — total + select. Tap opens confirm popup. */}
                  <div className="mt-4 flex min-w-0 items-center justify-between gap-3 border-t border-border/60 pt-3">
                    <div className="min-w-0 text-sm">
                      <span className="text-xs text-muted-foreground">Total </span>
                      <span className="font-semibold text-foreground nums">₹{offerTotal.toFixed(2)}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setPendingOffer(offer)}
                      disabled={isAnySelecting}
                      className="shrink-0"
                    >
                      {isThisLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Selecting
                        </>
                      ) : (
                        "Select"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}

            {offers.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
                No offers in this catalog.
              </div>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span className="text-foreground break-words">{error}</span>
            </div>
          )}

          {/* Close */}
          <Button variant="outline" onClick={onCancel} disabled={isAnySelecting} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={Boolean(pendingOffer)}
        onOpenChange={(open) => !isAnySelecting && !open && setPendingOffer(null)}
        title="Are you sure you want to select this offer?"
        description={
          pendingOffer ? (
            <>
              You'll request a quote for{" "}
              <span className="font-medium text-foreground nums">
                {pendingOffer.quantity_available.toFixed(2)} {pendingOffer.quantity_unit}
              </span>{" "}
              at{" "}
              <span className="font-medium text-foreground nums">
                ₹{(pendingOffer.price_per_unit * pendingOffer.quantity_available).toFixed(2)}
              </span>
              .
            </>
          ) : undefined
        }
        proceedLabel="Proceed"
        loading={isAnySelecting}
        onProceed={() => pendingOffer && void handleSelectOffer(pendingOffer)}
      />
    </Dialog>
  );
};
