import { useState } from 'react';
import { SearchFilters } from '@/hooks/useDiscoverListings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, Filter } from 'lucide-react';

interface SearchListingsProps {
  onSearch: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const SearchListings = ({
  onSearch,
  onClearFilters,
  isLoading = false,
}: SearchListingsProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sellerName, setSellerName] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [sourceType, setSourceType] = useState('');

  const handleSearch = () => {
    const filters: SearchFilters = {};

    if (sellerName.trim()) filters.seller_name = sellerName.trim();
    if (minPrice) filters.min_price = parseFloat(minPrice);
    if (maxPrice) filters.max_price = parseFloat(maxPrice);
    if (minQuantity) filters.min_quantity = parseFloat(minQuantity);
    if (maxQuantity) filters.max_quantity = parseFloat(maxQuantity);
    if (sourceType) filters.source_type = sourceType;

    onSearch(filters);
  };

  const handleClear = () => {
    setSellerName('');
    setMinPrice('');
    setMaxPrice('');
    setMinQuantity('');
    setMaxQuantity('');
    setSourceType('');
    onClearFilters();
  };

  const hasActiveFilters =
    sellerName || minPrice || maxPrice || minQuantity || maxQuantity || sourceType;

  return (
    <div className="w-full space-y-3 bg-white p-4 rounded-lg border border-gray-200">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by seller name..."
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 h-10"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoading || !sellerName.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Search
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-blue-100 border-blue-300' : ''}
        >
          <Filter size={18} />
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Price Range */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Min Price (₹)
            </label>
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-8 text-sm"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Max Price (₹)
            </label>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-8 text-sm"
              disabled={isLoading}
            />
          </div>

          {/* Quantity Range */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Min Quantity (kWh)
            </label>
            <Input
              type="number"
              placeholder="Min"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              className="h-8 text-sm"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Max Quantity (kWh)
            </label>
            <Input
              type="number"
              placeholder="Max"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              className="h-8 text-sm"
              disabled={isLoading}
            />
          </div>

          {/* Source Type */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Energy Source
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full h-8 text-sm border border-gray-300 rounded px-2 py-1"
              disabled={isLoading}
            >
              <option value="">All Sources</option>
              <option value="Solar">Solar</option>
              <option value="Wind">Wind</option>
              <option value="Hydro">Hydro</option>
              <option value="Biomass">Biomass</option>
              <option value="Grid">Grid</option>
            </select>
          </div>

          {/* Filter Actions */}
          <div className="md:col-span-2 flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 text-sm"
            >
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="flex-1 h-8"
              >
                <X size={14} className="mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {sellerName && (
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {sellerName}
              <button
                onClick={() => setSellerName('')}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {(minPrice || maxPrice) && (
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              ₹{minPrice || '0'}-{maxPrice || '∞'}
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {(minQuantity || maxQuantity) && (
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {minQuantity || '0'}-{maxQuantity || '∞'} kWh
              <button
                onClick={() => {
                  setMinQuantity('');
                  setMaxQuantity('');
                }}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {sourceType && (
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {sourceType}
              <button
                onClick={() => setSourceType('')}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
