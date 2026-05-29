import { useState } from 'react';
import { Card, CardContent, CardHeader, Button, Chip, Typography, Box, IconButton } from '@mui/material';
import { Heart } from 'lucide-react';
import { EnergyListing } from '@/hooks/useDiscoverListings';

interface EnergyListingCardProps {
  listing: EnergyListing;
  onSelect?: (listing: EnergyListing) => void;
}

export const EnergyListingCard = ({ listing, onSelect }: EnergyListingCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const offerCount = listing.offer_count ?? 1;
  const hasMultipleOffers = offerCount > 1;
  const minPrice = listing.min_price_per_unit ?? listing.price_per_unit;
  const maxPrice = listing.max_price_per_unit ?? listing.price_per_unit;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        month: 'short',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  return (
    <Card sx={{ width: '100%', transition: 'all 0.2s ease', '&:hover': { boxShadow: 4 } }}>
      <CardHeader sx={{ pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{listing.seller_name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.25, display: 'block' }}>
              {listing.offer_name}
            </Typography>
            {hasMultipleOffers && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', mt: 0.25 }}>
                {offerCount} offers grouped
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={() => setIsFavorite(!isFavorite)}
            size="small"
            sx={{ p: 0.5, minWidth: 'auto', color: isFavorite ? 'primary.main' : 'action.disabled' }}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </IconButton>
        </Box>
      </CardHeader>

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Price Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.4px', display: 'block' }}>Price</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25, fontSize: '0.95rem' }}>
              {hasMultipleOffers
                ? `₹${minPrice.toFixed(2)}-${maxPrice.toFixed(2)}/${listing.quantity_unit}`
                : `₹${listing.price_per_unit.toFixed(2)}/${listing.quantity_unit}`}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.4px', display: 'block' }}>Available</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25, fontSize: '0.95rem' }}>
              {listing.quantity_available.toFixed(2)} {listing.quantity_unit}
            </Typography>
          </Box>
        </Box>

        {/* Total Price */}
        <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: 1.5, p: '8px 12px', boxShadow: '0 1px 3px rgba(245, 158, 11, 0.08)' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Total Available Value</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.25, fontSize: '1.1rem' }}>
            ₹{listing.total_price.toFixed(2)}
          </Typography>
        </Box>

        {/* Details Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', mb: 0.25 }}>Source Type</Typography>
            <Chip label={listing.source_type} size="small" variant="outlined" color="primary" sx={{ height: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', mb: 0.25 }}>Pricing Model</Typography>
            <Chip label={listing.pricing_model} size="small" variant="outlined" sx={{ height: 20 }} />
          </Box>
        </Box>

        {/* Delivery Window */}
        {(listing.delivery_start || listing.delivery_end) && (
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.4px', display: 'block', mb: 0.5 }}>Delivery</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {listing.delivery_start
                  ? `${formatDate(listing.delivery_start)} ${formatTime(listing.delivery_start)}`
                  : 'Flexible'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>→</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {listing.delivery_end
                  ? `${formatDate(listing.delivery_end)} ${formatTime(listing.delivery_end)}`
                  : 'Flexible'}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Validity Window */}
        {(listing.validity_start || listing.validity_end) && (
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.4px', display: 'block', mb: 0.5 }}>Valid Until</Typography>
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {listing.validity_end
                ? formatDate(listing.validity_end)
                : 'Open-ended'}
            </Typography>
          </Box>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onSelect?.(listing)}
          variant="contained"
          fullWidth
          size="small"
          sx={{ mt: 0.5, py: 0.75 }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
