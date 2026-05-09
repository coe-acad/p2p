import { useState, useEffect, useRef } from "react";
import { createApiClient, requestWithRetry, resolveRequiredEnv, toApiError } from "@/services/apiClient";

export interface EnergyListing {
  id: string;
  offer_id: string;
  catalog_id: string;
  bpp_id?: string;
  bpp_uri?: string;
  offer_item_ids?: string[];
  seller_id: string;
  seller_name: string;
  offer_name: string;
  offer_provider?: string;
  offer_descriptor?: Record<string, unknown>;
  offer_price?: Record<string, unknown>;
  offer_attributes?: Record<string, unknown>;
  offers?: EnergyListing[];
  offer_count?: number;
  min_price_per_unit?: number;
  max_price_per_unit?: number;
  price_per_unit: number;
  currency: string;
  quantity_available: number;
  quantity_unit: string;
  total_price: number;
  source_type: string;
  pricing_model: string;
  delivery_start: string;
  delivery_end: string;
  validity_start: string;
  validity_end: string;
  discovered_at: string;
}

export interface SearchFilters {
  seller_name?: string;
  min_price?: number;
  max_price?: number;
  min_quantity?: number;
  max_quantity?: number;
  source_type?: string;
}

export interface ListingsResponse {
  total: number;
  limit: number;
  offset: number;
  count: number;
  listings: EnergyListing[];
  last_updated: string | null;
}

const sanitizeListings = (listings: EnergyListing[]): EnergyListing[] => {
  const seen = new Set<string>();

  return listings.filter((listing) => {
    if (!listing.catalog_id || !listing.offer_id) {
      return false;
    }

    const key = `${listing.catalog_id}:${listing.offer_id}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const useDiscoverListings = () => {
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({});

  const BAP_URL = resolveRequiredEnv(import.meta.env.VITE_BAP_URL, "http://localhost:8001", "VITE_BAP_URL");
  const NETWORK_ID =
    import.meta.env.VITE_NETWORK_ID || "p2p-interdiscom-trading-test-network";
  const PAGE_SIZE = 10;
  const RAW_FETCH_LIMIT = 500;
  const discoverClientRef = useRef(createApiClient(BAP_URL));
  const activeRequestRef = useRef<AbortController | null>(null);

  const fetchListings = async (pageNumber: number = 0, searchFilters: SearchFilters = {}) => {
    try {
      activeRequestRef.current?.abort();
      const controller = new AbortController();
      activeRequestRef.current = controller;

      setLoading(true);
      setError(null);

      // Refresh from CDS via BAP adapter when loading the first page (new session, filters, or pull-to-refresh pattern).
      if (pageNumber === 0) {
        const discoverPayload = {
          message: {
            filters: {
              type: "jsonpath",
              expression:
                "$.catalogs[*] ? " +
                `(@.beckn:items[*].beckn:networkId[*] == '${NETWORK_ID}' && @.beckn:offers[*].beckn:isActive == true)`,
            },
          },
        };
        await requestWithRetry<unknown>(
          discoverClientRef.current,
          {
            url: "/discover",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data: discoverPayload,
          },
          {
            signal: controller.signal,
            timeoutMs: 120000,
            retries: 1,
            retryDelayMs: 2000,
          }
        );
      }

      const params = new URLSearchParams();

      // Fetch a broad raw offer set, then paginate grouped catalogs in the UI.
      params.append("limit", RAW_FETCH_LIMIT.toString());
      params.append("offset", "0");

      // Add filters
      if (searchFilters.seller_name) {
        params.append("seller_name", searchFilters.seller_name);
      }
      if (searchFilters.min_price !== undefined) {
        params.append("min_price", searchFilters.min_price.toString());
      }
      if (searchFilters.max_price !== undefined) {
        params.append("max_price", searchFilters.max_price.toString());
      }
      if (searchFilters.min_quantity !== undefined) {
        params.append("min_quantity", searchFilters.min_quantity.toString());
      }
      if (searchFilters.max_quantity !== undefined) {
        params.append("max_quantity", searchFilters.max_quantity.toString());
      }
      if (searchFilters.source_type) {
        params.append("source_type", searchFilters.source_type);
      }

      const data = await requestWithRetry<ListingsResponse>(
        discoverClientRef.current,
        {
          url: `/discover?${params.toString()}`,
          method: "GET",
        },
        {
          signal: controller.signal,
          timeoutMs: 10000,
          retries: 2,
        }
      );

      const sanitizedListings = sanitizeListings(data.listings);

      setListings(sanitizedListings);
      setTotal(sanitizedListings.length);
      setCurrentPage(pageNumber);
      setFilters(searchFilters);
    } catch (err) {
      const apiError = toApiError(err, "Failed to fetch listings");
      if (apiError.code === "ERR_CANCELED") {
        return;
      }
      const message = apiError.message;
      setError(message);
      console.error("Error fetching listings:", apiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  const searchBySellerName = (sellerName: string) => {
    fetchListings(0, { ...filters, seller_name: sellerName });
  };

  const filterByPrice = (min?: number, max?: number) => {
    fetchListings(0, { ...filters, min_price: min, max_price: max });
  };

  const filterByQuantity = (min?: number, max?: number) => {
    fetchListings(0, { ...filters, min_quantity: min, max_quantity: max });
  };

  const filterBySourceType = (sourceType: string) => {
    fetchListings(0, { ...filters, source_type: sourceType });
  };

  const goToPage = (pageNumber: number) => {
    fetchListings(pageNumber, filters);
  };

  const clearFilters = () => {
    fetchListings(0, {});
  };

  const getTotalPages = () => Math.ceil(total / PAGE_SIZE);

  return {
    listings,
    total,
    loading,
    error,
    currentPage,
    totalPages: getTotalPages(),
    filters,
    fetchListings,
    searchBySellerName,
    filterByPrice,
    filterByQuantity,
    filterBySourceType,
    goToPage,
    clearFilters,
  };
};
