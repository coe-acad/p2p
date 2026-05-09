import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { useDiscoverListings, EnergyListing } from "@/hooks/useDiscoverListings";
import { EnergyListingCard } from "@/components/EnergyListingCard";
import { SearchListings } from "@/components/SearchListings";
import { Pagination } from "@/components/Pagination";
import { ConfirmOrderModal } from "@/components/ConfirmOrderModal";
import { QuoteOrderModal } from "@/components/QuoteOrderModal";
import { orderService } from "@/services/orderService";
import { ShoppingCart, Zap, User, RefreshCw } from "lucide-react";

const CATALOGS_PER_PAGE = 10;

const groupListingsByCatalog = (listings: EnergyListing[]): EnergyListing[] => {
  const grouped = new Map<string, EnergyListing>();

  for (const listing of listings) {
    if (!listing.catalog_id || !listing.offer_id) {
      continue;
    }

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
  const { userData } = useUserData();
  const {
    listings,
    loading,
    error,
    currentPage,
    fetchListings,
    clearFilters,
    goToPage,
  } = useDiscoverListings();
  const [selectedListing, setSelectedListing] = useState<EnergyListing | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<EnergyListing | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'selecting' | 'selected' | 'quoting' | 'quoted' | 'confirming' | 'confirmed'>('idle');
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('');
  const [currentOrderData, setCurrentOrderData] = useState<any>(null);
  const groupedListings = groupListingsByCatalog(listings);
  const totalPages = Math.ceil(groupedListings.length / CATALOGS_PER_PAGE);
  const paginatedGroupedListings = groupedListings.slice(
    currentPage * CATALOGS_PER_PAGE,
    (currentPage + 1) * CATALOGS_PER_PAGE
  );

  useEffect(() => {
    fetchListings();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchListings();
    setIsRefreshing(false);
  };

  const handleSelectListing = async (listing: EnergyListing) => {
    setSelectedListing(listing);
    setSelectedOffer(null);
    setShowOfferModal(true);
    setShowQuoteModal(false);
    setOrderStatus('idle');
    setOrderError(null);
    setCurrentTransactionId('');
    setCurrentOrderData(null);
  };

  const handleSelectOffer = async (listing: EnergyListing) => {
    setSelectedOffer(listing);
    setOrderStatus('selecting');
    setOrderError(null);

    try {
      const selectResult = await orderService.select({
        offer_id: listing.offer_id,
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
      setShowQuoteModal(true);
      setOrderStatus('selected');
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Failed to select offer');
      setSelectedOffer(null);
      setOrderStatus('idle');
    }
  };

  const handleGetQuotation = async () => {
    if (!selectedOffer || !currentTransactionId) return;

    setOrderStatus('quoting');
    setOrderError(null);

    try {
      await orderService.init(currentTransactionId, {
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
      }, currentOrderData);

      const orderState = await orderService.waitForQuotation(currentTransactionId);
      setCurrentOrderData(orderState.order);
      setOrderStatus('quoted');
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Failed to get quotation');
      setOrderStatus('selected');
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedOffer || !currentTransactionId) return;

    setOrderStatus('confirming');
    setOrderError(null);

    try {
      await orderService.confirm(
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
        currentOrderData
      );

      await orderService.waitForConfirmation(currentTransactionId);
      setOrderStatus('confirmed');

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowQuoteModal(false);
        setSelectedListing(null);
        setSelectedOffer(null);
        setOrderStatus('idle');
      }, 2000);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Failed to confirm order');
      setOrderStatus('quoted');
    }
  };

  const handleCloseOfferModal = () => {
    setShowOfferModal(false);
    setSelectedListing(null);
    setSelectedOffer(null);
    setOrderStatus('idle');
    setOrderError(null);
    setCurrentTransactionId('');
    setCurrentOrderData(null);
  };

  const handleBackToOfferModal = () => {
    setShowQuoteModal(false);
    setShowOfferModal(true);
    setOrderError(null);
    setOrderStatus(selectedOffer ? 'selected' : 'idle');
  };

  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
    setSelectedListing(null);
    setSelectedOffer(null);
    setOrderStatus('idle');
    setOrderError(null);
    setCurrentTransactionId('');
    setCurrentOrderData(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <MainAppShell>
      <div className="screen-container !justify-start !pt-4 !pb-6">
        <PageContainer gap={4}>
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in">
            <h1 className="text-lg font-bold text-foreground">
              {getGreeting()} {userData.name || "Buyer"}!
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors disabled:opacity-50"
                aria-label="Refresh listings"
                title="Sync latest listings from CDS"
              >
                <RefreshCw size={16} className={`text-blue-600 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => navigate("/buyer-profile")}
                className="lg:hidden w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                aria-label="Go to profile"
              >
                <User size={16} className="text-primary" />
              </button>
            </div>
          </div>

          {/* Buyer Welcome Card */}
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-6 shadow-card animate-slide-up border border-teal-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                <ShoppingCart size={24} className="text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Welcome to Samai Buyer</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse clean energy from local solar producers and make your first purchase.
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <SearchListings
              onSearch={(filters) => fetchListings(0, filters)}
              onClearFilters={clearFilters}
              isLoading={loading}
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              Failed to load listings: {error}
            </div>
          )}

          {/* Loading State */}
          {loading && !selectedListing && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin">
                <Zap size={32} className="text-blue-600" />
              </div>
            </div>
          )}

          {/* Listings Grid */}
          {!loading && groupedListings.length > 0 && !selectedListing && (
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Available Listings ({groupedListings.length})
                </p>
              </div>
              <div className="grid gap-4">
                {paginatedGroupedListings.map((listing) => (
                  <EnergyListingCard
                    key={listing.id}
                    listing={listing}
                    onSelect={handleSelectListing}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  isLoading={loading}
                />
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && groupedListings.length === 0 && !selectedListing && (
            <div className="text-center py-12">
              <Zap size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground mb-2">No listings available</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search filters
              </p>
            </div>
          )}

        </PageContainer>

        {/* Order Confirmation Modal */}
        <ConfirmOrderModal
          isOpen={showOfferModal}
          listing={selectedListing}
          offers={selectedListing?.offers ?? []}
          error={orderError}
          status={orderStatus}
          onSelectOffer={handleSelectOffer}
          onCancel={handleCloseOfferModal}
        />
        <QuoteOrderModal
          isOpen={showQuoteModal}
          listing={selectedOffer}
          quote={currentOrderData}
          error={orderError}
          status={orderStatus}
          onGetQuote={handleGetQuotation}
          onConfirm={handleConfirmOrder}
          onBack={orderStatus === 'confirmed' ? handleCloseQuoteModal : handleBackToOfferModal}
        />
      </div>
    </MainAppShell>
  );
};

export default BuyerHomePage;
