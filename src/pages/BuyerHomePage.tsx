import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { useDiscoverListings } from "@/hooks/useDiscoverListings";
import { EnergyListingCard } from "@/components/EnergyListingCard";
import { SearchListings } from "@/components/SearchListings";
import { Pagination } from "@/components/Pagination";
import { ShoppingCart, Zap, User, RefreshCw } from "lucide-react";

const BuyerHomePage = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  const {
    listings,
    loading,
    error,
    currentPage,
    totalPages,
    fetchListings,
    clearFilters,
    goToPage,
  } = useDiscoverListings();
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchListings();
    setIsRefreshing(false);
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
          {!loading && listings.length > 0 && !selectedListing && (
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Available Listings ({listings.length})
                </p>
              </div>
              <div className="grid gap-4">
                {listings.map((listing) => (
                  <EnergyListingCard
                    key={listing.id}
                    listing={listing}
                    onSelect={setSelectedListing}
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
          {!loading && listings.length === 0 && !selectedListing && (
            <div className="text-center py-12">
              <Zap size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground mb-2">No listings available</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search filters
              </p>
            </div>
          )}

        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default BuyerHomePage;
