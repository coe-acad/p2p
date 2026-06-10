import { EnergyListing } from "@/hooks/useDiscoverListings";
import { Clock, Droplet, Hourglass, Layers, Leaf, Plug, Sun, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EnergyListingCardProps {
  listing: EnergyListing;
  onSelect?: (listing: EnergyListing) => void;
}

const sourceMeta = (source?: string): { icon: LucideIcon; label: string } => {
  switch ((source || "").toLowerCase()) {
    case "wind":    return { icon: Wind,    label: "Wind" };
    case "hydro":   return { icon: Droplet, label: "Hydro" };
    case "biomass": return { icon: Leaf,    label: "Biomass" };
    case "grid":    return { icon: Plug,    label: "Grid" };
    default:        return { icon: Sun,     label: source || "Solar" };
  }
};

const formatWhen = (iso?: string): string | null => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    const day = sameDay(d, today) ? "Today" : sameDay(d, tomorrow) ? "Tomorrow"
      : d.toLocaleDateString("en-IN", { month: "short", day: "2-digit" });
    const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day}, ${time}`;
  } catch { return null; }
};

const formatDelivery = (start?: string, end?: string): string => {
  if (!start && !end) return "Flexible";
  try {
    if (start && end) {
      const sd = new Date(start);
      const ed = new Date(end);
      if (sd.toDateString() === ed.toDateString()) {
        const day = formatWhen(start)?.split(",")[0] ?? "";
        const t1 = sd.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
        const t2 = ed.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
        return `${day}, ${t1} – ${t2}`;
      }
    }
  } catch { /* fall through */ }
  return formatWhen(start) || formatWhen(end) || "Flexible";
};

/** Value-first stat tile — value (top, prominent) + label (bottom, small caps). */
const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="truncate text-sm font-semibold text-foreground nums">{value}</p>
    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {label}
    </p>
  </div>
);

export const EnergyListingCard = ({ listing, onSelect }: EnergyListingCardProps) => {
  const offerCount = listing.offer_count ?? 1;
  const hasMultipleOffers = offerCount > 1;
  const heroPrice = hasMultipleOffers
    ? (listing.min_price_per_unit ?? listing.price_per_unit)
    : listing.price_per_unit;
  const { icon: Icon, label: sourceLabel } = sourceMeta(listing.source_type);
  const validUntil = formatWhen(listing.validity_end);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(listing)}
      className="group relative overflow-hidden flex w-full flex-col
                 rounded-2xl border border-primary/12 bg-card text-left
                 shadow-[0_6px_18px_-12px_rgba(36,40,128,0.18)]
                 transition-all duration-300 ease-out
                 hover:-translate-y-0.5 hover:border-primary/40
                 hover:shadow-[0_12px_28px_-18px_rgba(36,40,128,0.28)]
                 active:translate-y-0 active:transition-[transform] active:duration-100
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Top white space (like the gap above a credit card's magnetic stripe) */}
      <div className="h-3" />

      {/* Magnetic-stripe-style band — soft green wash containing the header content.
          Edge-to-edge with internal padding for the name + source/total + offer count. */}
      <div className="bg-accent/15 px-5 py-1.5 transition-colors duration-300 ease-out group-hover:bg-accent/20">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="relative inline-block max-w-full truncate text-base font-semibold leading-tight text-foreground sm:text-lg">
              {listing.seller_name || "Unknown seller"}
              <span
                aria-hidden
                className="shimmer-underline absolute -bottom-0.5 left-0 h-[2px] w-0 rounded-full
                           transition-[width] duration-300 ease-out group-hover:w-full"
              />
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs leading-tight text-muted-foreground">
              <span>{sourceLabel}</span>
              <span className="text-muted-foreground/40">·</span>
              <span>
                Total{" "}
                <span className="font-semibold text-foreground nums">
                  ₹{listing.total_price.toFixed(2)}
                </span>
              </span>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5
                           text-[10px] font-medium uppercase tracking-wider text-accent nums">
            <Layers className="h-2.5 w-2.5" />
            {offerCount} {offerCount === 1 ? "offer" : "offers"}
          </span>
        </div>
      </div>

      {/* Body — stats + time info */}
      <div className="px-5 pb-3 pt-3">
        {/* 2-stat row — Price (with green emphasis line) · Available */}
        <div className="grid grid-cols-2 gap-x-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-primary nums">
              ₹{heroPrice.toFixed(2)}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                /{listing.quantity_unit}
              </span>
            </p>
            <span aria-hidden className="mt-1 block h-[2px] w-6 rounded-full bg-primary" />
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Price
            </p>
          </div>
          <Stat
            label="Available"
            value={
              <>
                {listing.quantity_available.toFixed(2)}{" "}
                <span className="text-xs font-normal text-muted-foreground">{listing.quantity_unit}</span>
              </>
            }
          />
        </div>

        {/* Time info — each on its own full-width line so long timestamps have room.
            min-w-0 + truncate on the spans prevents long delivery ranges from
            expanding the grid track on narrow viewports. */}
        <div className="mt-3 space-y-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Delivery
            </p>
            <p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 shrink-0 text-accent" />
              <span className="truncate">{formatDelivery(listing.delivery_start, listing.delivery_end)}</span>
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Valid until
            </p>
            <p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
              <Hourglass className="h-4 w-4 shrink-0 text-accent" />
              <span className="truncate">{validUntil ?? "Open-ended"}</span>
            </p>
          </div>
        </div>
      </div>

    </button>
  );
};
