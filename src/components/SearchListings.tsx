import { useState } from "react";
import { SearchFilters } from "@/hooks/useDiscoverListings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, X } from "lucide-react";

interface SearchListingsProps {
  onSearch: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

/**
 * Calm marketplace filter bar. Submit on Enter from the search input —
 * no separate "Search" button needed for the common case.
 */
export const SearchListings = ({ onSearch, onClearFilters, isLoading = false }: SearchListingsProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  const buildFilters = (): SearchFilters => {
    const filters: SearchFilters = {};
    if (sellerName.trim()) filters.seller_name = sellerName.trim();
    if (minPrice) filters.min_price = parseFloat(minPrice);
    if (maxPrice) filters.max_price = parseFloat(maxPrice);
    if (minQuantity) filters.min_quantity = parseFloat(minQuantity);
    if (maxQuantity) filters.max_quantity = parseFloat(maxQuantity);
    return filters;
  };

  const handleSearch = () => onSearch(buildFilters());

  const handleClear = () => {
    setSellerName("");
    setMinPrice("");
    setMaxPrice("");
    setMinQuantity("");
    setMaxQuantity("");
    onClearFilters();
  };

  const activeFilterCount =
    (sellerName ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (minQuantity || maxQuantity ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="w-full space-y-3">
      {/* Main search bar — submit-on-Enter, no separate button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by seller name"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="h-10 pl-9"
            disabled={isLoading}
            enterKeyHint="search"
          />
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={() => setShowFilters((v) => !v)}
          className={`h-10 gap-1.5 transition-colors duration-200
                      hover:bg-primary/[0.06] hover:border-primary/40 hover:text-primary
                      ${showFilters ? "border-primary/40 bg-primary/[0.04] text-primary" : ""}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground nums">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {sellerName && (
            <FilterChip label={sellerName} onRemove={() => { setSellerName(""); onSearch({ ...buildFilters(), seller_name: undefined }); }} />
          )}
          {(minPrice || maxPrice) && (
            <FilterChip
              label={`₹${minPrice || "0"} – ${maxPrice || "∞"}`}
              onRemove={() => { setMinPrice(""); setMaxPrice(""); onSearch({ ...buildFilters(), min_price: undefined, max_price: undefined }); }}
            />
          )}
          {(minQuantity || maxQuantity) && (
            <FilterChip
              label={`${minQuantity || "0"} – ${maxQuantity || "∞"} kWh`}
              onRemove={() => { setMinQuantity(""); setMaxQuantity(""); onSearch({ ...buildFilters(), min_quantity: undefined, max_quantity: undefined }); }}
            />
          )}
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Advanced filter panel */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-card p-4 slide-up">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <FilterField label="Min price (₹)">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                disabled={isLoading}
                className="h-9"
              />
            </FilterField>
            <FilterField label="Max price (₹)">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="∞"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                disabled={isLoading}
                className="h-9"
              />
            </FilterField>
            <FilterField label="Min qty (kWh)">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                disabled={isLoading}
                className="h-9"
              />
            </FilterField>
            <FilterField label="Max qty (kWh)">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="∞"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
                disabled={isLoading}
                className="h-9"
              />
            </FilterField>
            <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
              <Button onClick={handleSearch} disabled={isLoading} className="h-9 flex-1">
                Apply
              </Button>
              {hasActiveFilters && (
                <Button onClick={handleClear} variant="outline" disabled={isLoading} className="h-9">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary nums">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter ${label}`}
      className="text-primary/60 hover:text-primary"
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);
