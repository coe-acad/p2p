import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { useVCStatus } from "@/hooks/useVCStatus";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { useDiscoverListings, EnergyListing } from "@/hooks/useDiscoverListings";
import { EnergyListingCard } from "@/components/EnergyListingCard";
import { ListingSkeletonList } from "@/components/ListingSkeleton";
import { SearchListings } from "@/components/SearchListings";
import { Pagination } from "@/components/Pagination";
import { ConfirmOrderModal } from "@/components/ConfirmOrderModal";
import { SelectedOrderModal } from "@/components/SelectedOrderModal";
import { QuoteOrderModal } from "@/components/QuoteOrderModal";
import { orderService } from "@/services/orderService";
import VCUploadModal from "@/components/modals/VCUploadModal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ShieldAlert, Zap } from "lucide-react";

const CATALOGS_PER_PAGE = 10;

const groupListingsByCatalog = (listings: EnergyListing[]): EnergyListing[] => {
  const grouped = new Map<string, EnergyListing>();

  for (const listing of listings) {
    if (!listing.catalog_id || !listing.offer_id) continue;

    const existing = grouped.get(listing.catalog_id);
    if (!existing) {
      grouped.set(listing.catalog_id, {
        ...listing,
        offers: [listing],
        offer_count: 1,
        min_price_per_unit: listing.price_per_unit,
        max_price_per_unit: listing.price_per_unit,
      });
      continue;
    }

    const offerCount = (existing.offer_count ?? 1) + 1;
    const minPrice = Math.min(existing.min_price_per_unit ?? existing.price_per_unit, listing.price_per_unit);
    const maxPrice = Math.max(existing.max_price_per_unit ?? existing.price_per_unit, listing.price_per_unit);

    grouped.set(listing.catalog_id, {
      ...existing,
      offers: [...(existing.offers ?? []), listing],
      offer_count: offerCount,
      offer_name: `${offerCount} offers in this catalog`,
      min_price_per_unit: minPrice,
      max_price_per_unit: maxPrice,
      quantity_available: existing.quantity_available + listing.quantity_available,
      total_price: existing.total_price + listing.total_price,
      delivery_start:
        !existing.delivery_start || (listing.delivery_start && listing.delivery_start < existing.delivery_start)
          ? listing.delivery_start
          : existing.delivery_start,
      delivery_end:
        !existing.delivery_end || (listing.delivery_end && listing.delivery_end > existing.delivery_end)
          ? listing.delivery_end
          : existing.delivery_end,
      validity_start:
        !existing.validity_start || (listing.validity_start && listing.validity_start < existing.validity_start)
          ? listing.validity_start
          : existing.validity_start,
      validity_end:
        !existing.validity_end || (listing.validity_end && listing.validity_end > existing.validity_end)
          ? listing.validity_end
          : existing.validity_end,
    });
  }

  return Array.from(grouped.values());
};

const BuyerHomePage = () => {
  const navigate = useNavigate();
  const { userData, displayName } = useUserData();
  const { loading: vcLoading, refetch: refetchVCStatus } = useVCStatus();
  // Source of truth for the VC gate: userData.is_vc_verified. If true → user
  // can discover/buy. If anything else → red banner + block discover.
  const isVCVerified = Boolean((userData as any)?.is_vc_verified);
  const { listings, loading, error, currentPage, fetchListings, clearFilters, goToPage } = useDiscoverListings();

  const [selectedListing, setSelectedListing] = useState<EnergyListing | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<EnergyListing | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<
    "idle" | "selecting" | "selected" | "quoting" | "quoted" | "confirming" | "confirmed"
  >("idle");
  const [currentTransactionId, setCurrentTransactionId] = useState<string>("");
  const [currentOrderData, setCurrentOrderData] = useState<any>(null);
  const [showVCUploadModal, setShowVCUploadModal] = useState(false);

  // Optimistic local filter: tracks offer_ids the user just bought so they
  // disappear from the grid immediately. BPP catalogs aren't always updated
  // server-side the moment a confirm lands, so without this the same offer
  // would keep showing on refresh until the backend syncs.
  const [purchasedOfferIds, setPurchasedOfferIds] = useState<Set<string>>(new Set());

  const visibleListings = listings.filter((l) => !purchasedOfferIds.has(l.offer_id));
  const groupedListings = groupListingsByCatalog(visibleListings);
  const totalPages = Math.ceil(groupedListings.length / CATALOGS_PER_PAGE);
  const paginatedGroupedListings = groupedListings.slice(
    currentPage * CATALOGS_PER_PAGE,
    (currentPage + 1) * CATALOGS_PER_PAGE,
  );

  useEffect(() => {
    // Only fetch listings if the user is VC-verified. Otherwise discover is
    // blocked and we shouldn't be making the request at all.
    if (isVCVerified) fetchListings();
  }, [isVCVerified]);

  // Auto-refresh listings every 30 seconds so the buyer always sees a fresh
  // catalog without manually pulling. Silent mode keeps the existing
  // catalogs on screen while the new fetch is in flight — no skeleton, no
  // page-blink. Suspended while a buy flow is in progress or any modal is
  // open — don't rip data out from under the user mid-transaction.
  useEffect(() => {
    if (!isVCVerified) return;
    const interval = setInterval(() => {
      const buyFlowActive =
        showOfferModal ||
        showSelectedModal ||
        showQuoteModal ||
        showVCUploadModal ||
        orderStatus !== "idle";
      if (buyFlowActive) return;
      void fetchListings(0, {}, { silent: true });
    }, 30_000);
    return () => clearInterval(interval);
  }, [isVCVerified, showOfferModal, showSelectedModal, showQuoteModal, showVCUploadModal, orderStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Silent so the catalog list doesn't get replaced by skeletons — the
    // spinning icon on the refresh button is feedback enough.
    await fetchListings(0, {}, { silent: true, refreshFromNetwork: true });
    setIsRefreshing(false);
  };

  const handleSelectListing = async (listing: EnergyListing) => {
    setSelectedListing(listing);
    setSelectedOffer(null);
    setShowOfferModal(true);
    setShowQuoteModal(false);
    setOrderStatus("idle");
    setOrderError(null);
    setCurrentTransactionId("");
    setCurrentOrderData(null);
  };

  const handleSelectOffer = async (listing: EnergyListing) => {
    // Action-level VC gate: shouldn't be reachable when isVCVerified is false
    // (the listings grid is hidden), but kept as a safety net.
    if (!isVCVerified) {
      setShowVCUploadModal(true);
      return;
    }

    setSelectedOffer(listing);
    setOrderStatus("selecting");
    setOrderError(null);

    try {
      const selectResult = await orderService.select({
        offer_id: listing.offer_id,
        seller_id: listing.seller_id,
        bpp_id: listing.bpp_id,
        bpp_uri: listing.bpp_uri,
        offer_item_ids: listing.offer_item_ids,
        offer_provider: listing.offer_provider,
        offer_descriptor: listing.offer_descriptor,
        offer_price: listing.offer_price,
        offer_attributes: listing.offer_attributes,
        quantity: listing.quantity_available,
        price_per_unit: listing.price_per_unit,
        seller_name: listing.seller_name,
        delivery_start: listing.delivery_start,
        delivery_end: listing.delivery_end,
      });

      setCurrentTransactionId(selectResult.transactionId);
      const selectedOrderState = await orderService.waitForSelectedOrder(selectResult.transactionId);
      setCurrentOrderData(selectedOrderState.order);

      setShowOfferModal(false);
      setShowSelectedModal(true);
      setOrderStatus("selected");
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : "Failed to select offer");
      setSelectedOffer(null);
      setOrderStatus("idle");
    }
  };

  const handleInitOrder = async () => {
    if (!selectedOffer || !currentTransactionId) return;
    setOrderStatus("quoting");
    setOrderError(null);

    try {
      await orderService.init(
        currentTransactionId,
        {
          offer_id: selectedOffer.offer_id,
          bpp_id: selectedOffer.bpp_id,
          bpp_uri: selectedOffer.bpp_uri,
          offer_item_ids: selectedOffer.offer_item_ids,
          offer_provider: selectedOffer.offer_provider,
          offer_descriptor: selectedOffer.offer_descriptor,
          offer_price: selectedOffer.offer_price,
          offer_attributes: selectedOffer.offer_attributes,
          quantity: selectedOffer.quantity_available,
          price_per_unit: selectedOffer.price_per_unit,
          seller_name: selectedOffer.seller_name,
          delivery_start: selectedOffer.delivery_start,
          delivery_end: selectedOffer.delivery_end,
        },
        currentOrderData,
      );

      const initiatedOrderState = await orderService.waitForInitialization(currentTransactionId);
      setCurrentOrderData(initiatedOrderState.order);

      setShowSelectedModal(false);
      setShowQuoteModal(true);
      setOrderStatus("quoted");
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : "Failed to initialize order");
      setOrderStatus("selected");
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedOffer || !currentTransactionId) return;
    setOrderStatus("confirming");
    setOrderError(null);

    try {
      await orderService.confirm(
        currentTransactionId,
        {
          offer_id: selectedOffer.offer_id,
          seller_id: selectedOffer.seller_id,
          bpp_id: selectedOffer.bpp_id,
          bpp_uri: selectedOffer.bpp_uri,
          offer_item_ids: selectedOffer.offer_item_ids,
          offer_provider: selectedOffer.offer_provider,
          offer_descriptor: selectedOffer.offer_descriptor,
          offer_price: selectedOffer.offer_price,
          offer_attributes: selectedOffer.offer_attributes,
          quantity: selectedOffer.quantity_available,
          price_per_unit: selectedOffer.price_per_unit,
          seller_name: selectedOffer.seller_name,
          delivery_start: selectedOffer.delivery_start,
          delivery_end: selectedOffer.delivery_end,
        },
        currentOrderData,
      );

      await orderService.waitForConfirmation(currentTransactionId);
      setOrderStatus("confirmed");
      // Hide the bought offer locally before the refetch — guarantees it
      // disappears even if the BPP catalog hasn't synced yet.
      if (selectedOffer?.offer_id) {
        setPurchasedOfferIds((prev) => {
          const next = new Set(prev);
          next.add(selectedOffer.offer_id);
          return next;
        });
      }
      await fetchListings(0, {}, { refreshFromNetwork: true });

      setTimeout(() => {
        setShowQuoteModal(false);
        setSelectedListing(null);
        setSelectedOffer(null);
        setOrderStatus("idle");
      }, 2000);
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : "Failed to confirm order");
      setOrderStatus("quoted");
    }
  };

  const handleCloseOfferModal = () => {
    setShowOfferModal(false);
    setSelectedListing(null);
    setSelectedOffer(null);
    setOrderStatus("idle");
    setOrderError(null);
    setCurrentTransactionId("");
    setCurrentOrderData(null);
  };

  const handleBackToOfferModal = () => {
    setShowSelectedModal(false);
    setShowOfferModal(true);
    setOrderError(null);
    setOrderStatus("idle");
  };

  const handleCloseSelectedModal = () => {
    setShowSelectedModal(false);
    setSelectedListing(null);
    setSelectedOffer(null);
    setOrderStatus("idle");
    setOrderError(null);
    setCurrentTransactionId("");
    setCurrentOrderData(null);
  };

  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
    setSelectedListing(null);
    setSelectedOffer(null);
    setOrderStatus("idle");
    setOrderError(null);
    setCurrentTransactionId("");
    setCurrentOrderData(null);
    // Re-hydrate every API-driven piece of state on the home page after a
    // confirmed transaction — listings (the offer might be sold out / updated)
    // and VC status — without a physical page reload.
    void fetchListings(0, {}, { refreshFromNetwork: true });
    void refetchVCStatus();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const showListings = !loading && groupedListings.length > 0;
  const showEmpty = !loading && groupedListings.length === 0;

  return (
    <MainAppShell>
      <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
        <PageContainer gap={5}>
          {/* Greeting — profile now lives in the shell's top header. Only the
              refresh action stays on the page since it's contextual to listings. */}
          <div className="flex items-center justify-between fade-in opacity-0">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {getGreeting()}, {displayName || "Buyer"}
            </h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              aria-label="Refresh listings"
              title="Sync latest listings"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/[0.04] text-accent transition-all duration-200
                         hover:border-accent/50 hover:bg-accent/10
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* VC required banner — RED box, only when is_vc_verified !== true.
              When this is showing, discover is completely blocked (no search,
              no listings). Backend also enforces at /select. */}
          {!vcLoading && !isVCVerified && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/[0.06] p-4 slide-up">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-destructive">Verification required</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your Consumption Profile credential to discover and purchase energy.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowVCUploadModal(true)}
                className="shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Verify now
              </Button>
            </div>
          )}

          {/* Search, error, listings — ALL gated by VC verification. */}
          {isVCVerified && (
            <>
              <SearchListings
                onSearch={(filters) => fetchListings(0, filters)}
                onClearFilters={clearFilters}
                isLoading={loading}
              />

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Couldn't load listings</p>
                    <p className="mt-1 text-sm text-muted-foreground break-words">{error}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="shrink-0">
                    Retry
                  </Button>
                </div>
              )}

              {loading && !showListings && <ListingSkeletonList count={4} />}

              {showListings && (
                <div className="-mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="nums font-semibold text-primary">{groupedListings.length}</span>{" "}
                    listing{groupedListings.length === 1 ? "" : "s"} available
                  </p>
                  <div className="grid gap-4 max-h-[calc(100dvh-15rem)] overflow-y-auto pr-1 pb-2 [scrollbar-width:thin]">
                    {paginatedGroupedListings.map((listing, idx) => (
                      <div
                        key={listing.id}
                        style={{ animationDelay: `${Math.min(idx * 60, 360)}ms` }}
                        className="slide-up min-w-0 opacity-0"
                      >
                        <EnergyListingCard listing={listing} onSelect={handleSelectListing} />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} isLoading={loading} />
                  )}
                </div>
              )}

              {showEmpty && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Zap className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">No listings right now</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try clearing your filters or refresh in a moment.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>
              )}
            </>
          )}
        </PageContainer>

        {/* Buy-flow modals — untouched (separate roadmap task) */}
        <ConfirmOrderModal
          isOpen={showOfferModal}
          listing={selectedListing}
          offers={selectedListing?.offers ?? []}
          error={orderError}
          status={orderStatus}
          onSelectOffer={handleSelectOffer}
          onCancel={handleCloseOfferModal}
        />
        <SelectedOrderModal
          isOpen={showSelectedModal}
          listing={selectedOffer}
          error={orderError}
          status={orderStatus}
          onRequestInit={handleInitOrder}
          onBack={handleCloseSelectedModal}
        />
        <QuoteOrderModal
          isOpen={showQuoteModal}
          listing={selectedOffer}
          quote={currentOrderData}
          error={orderError}
          status={orderStatus}
          onGetQuote={handleInitOrder}
          onConfirm={handleConfirmOrder}
          onBack={orderStatus === "confirmed" ? handleCloseQuoteModal : handleBackToOfferModal}
        />

        <VCUploadModal
          isOpen={showVCUploadModal}
          onClose={() => setShowVCUploadModal(false)}
          onSuccess={() => {
            setShowVCUploadModal(false);
            fetchListings(0, {}, { refreshFromNetwork: true });
          }}
        />
      </div>
    </MainAppShell>
  );
};

export default BuyerHomePage;
