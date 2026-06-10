import { Droplet, Leaf, Plug, Sparkles, Sun, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickFiltersProps {
  selected: string | null;
  onSelect: (source: string | null) => void;
  disabled?: boolean;
}

const FILTERS: Array<{ id: string | null; label: string; icon?: LucideIcon }> = [
  { id: null, label: "All", icon: Sparkles },
  { id: "Solar", label: "Solar", icon: Sun },
  { id: "Wind", label: "Wind", icon: Wind },
  { id: "Hydro", label: "Hydro", icon: Droplet },
  { id: "Biomass", label: "Biomass", icon: Leaf },
  { id: "Grid", label: "Grid", icon: Plug },
];

/**
 * Quick-tap chip row for source-type filtering. Lives above the search bar
 * for one-tap filtering; advanced multi-filter still happens in SearchListings.
 * Horizontal-scroll on mobile, wraps on desktop.
 */
export const QuickFilters = ({ selected, onSelect, disabled }: QuickFiltersProps) => {
  return (
    <div
      role="tablist"
      aria-label="Energy source filters"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-x-visible
                 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {FILTERS.map(({ id, label, icon: Icon }) => {
        const isActive = selected === id;
        return (
          <button
            key={String(id)}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onSelect(id)}
            className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5
                        text-sm font-medium transition-all duration-200 ease-out
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                        disabled:cursor-not-allowed disabled:opacity-60
                        ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_12px_-6px_rgba(36,40,128,0.45)]"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:-translate-y-0.5"
                        }`}
          >
            {Icon && <Icon className={`h-3.5 w-3.5 transition-colors ${isActive ? "" : "group-hover:text-primary"}`} />}
            {label}
          </button>
        );
      })}
    </div>
  );
};
