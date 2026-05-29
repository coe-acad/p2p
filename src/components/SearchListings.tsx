import { useState } from 'react';
import { Box, Button, TextField, IconButton, Chip, FormControl, FormLabel, Select, MenuItem } from '@mui/material';
import { Search as SearchIcon, X as XIcon, Filter as FilterIcon } from 'lucide-react';
import { SearchFilters } from '@/hooks/useDiscoverListings';

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
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3, bgcolor: 'background.paper', p: 2, borderRadius: 1.5, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
      {/* Main Search Bar */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by seller name..."
          value={sellerName}
          onChange={(e) => setSellerName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={isLoading}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: <SearchIcon size={18} style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.3)' }} />,
            },
          }}
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading || !sellerName.trim()}
          variant="contained"
        >
          Search
        </Button>
        <IconButton
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            bgcolor: showFilters ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
          }}
        >
          <FilterIcon size={18} />
        </IconButton>
      </Box>

      {/* Advanced Filters */}
      {showFilters && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, p: 2, bgcolor: 'rgba(245, 158, 11, 0.02)', borderRadius: 1.5 }}>
          {/* Price Range */}
          <TextField
            label="Min Price (₹)"
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            disabled={isLoading}
            size="small"
            fullWidth
          />
          <TextField
            label="Max Price (₹)"
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            disabled={isLoading}
            size="small"
            fullWidth
          />

          {/* Quantity Range */}
          <TextField
            label="Min Quantity (kWh)"
            type="number"
            placeholder="Min"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            disabled={isLoading}
            size="small"
            fullWidth
          />
          <TextField
            label="Max Quantity (kWh)"
            type="number"
            placeholder="Max"
            value={maxQuantity}
            onChange={(e) => setMaxQuantity(e.target.value)}
            disabled={isLoading}
            size="small"
            fullWidth
          />

          {/* Source Type */}
          <FormControl fullWidth sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}>
            <FormLabel>Energy Source</FormLabel>
            <Select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              disabled={isLoading}
              size="small"
            >
              <MenuItem value="">All Sources</MenuItem>
              <MenuItem value="Solar">Solar</MenuItem>
              <MenuItem value="Wind">Wind</MenuItem>
              <MenuItem value="Hydro">Hydro</MenuItem>
              <MenuItem value="Biomass">Biomass</MenuItem>
              <MenuItem value="Grid">Grid</MenuItem>
            </Select>
          </FormControl>

          {/* Filter Actions */}
          <Box sx={{ display: 'flex', gap: 2, gridColumn: { xs: '1 / -1', md: '1 / -1' } }}>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              variant="contained"
              fullWidth
            >
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={handleClear}
                variant="outlined"
                fullWidth
                startIcon={<XIcon size={14} />}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {sellerName && (
            <Chip
              label={sellerName}
              onDelete={() => setSellerName('')}
              color="primary"
              variant="outlined"
            />
          )}
          {(minPrice || maxPrice) && (
            <Chip
              label={`₹${minPrice || '0'}-${maxPrice || '∞'}`}
              onDelete={() => {
                setMinPrice('');
                setMaxPrice('');
              }}
              color="primary"
              variant="outlined"
            />
          )}
          {(minQuantity || maxQuantity) && (
            <Chip
              label={`${minQuantity || '0'}-${maxQuantity || '∞'} kWh`}
              onDelete={() => {
                setMinQuantity('');
                setMaxQuantity('');
              }}
              color="primary"
              variant="outlined"
            />
          )}
          {sourceType && (
            <Chip
              label={sourceType}
              onDelete={() => setSourceType('')}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Box>
  );
};
