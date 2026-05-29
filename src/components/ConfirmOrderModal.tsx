import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, Typography, Stack, Alert, CircularProgress } from '@mui/material';
import { Loader2, AlertCircle } from 'lucide-react';
import { EnergyListing } from '@/hooks/useDiscoverListings';

interface ConfirmOrderModalProps {
  isOpen: boolean;
  listing: EnergyListing | null;
  offers: EnergyListing[];
  error: string | null;
  status: 'idle' | 'selecting' | 'selected' | 'quoting' | 'quoted' | 'confirming' | 'confirmed';
  onSelectOffer: (offer: EnergyListing) => Promise<void>;
  onCancel: () => void;
}

export const ConfirmOrderModal = ({
  isOpen,
  listing,
  offers,
  error,
  status,
  onSelectOffer,
  onCancel,
}: ConfirmOrderModalProps) => {
  const [selectingOfferId, setSelectingOfferId] = useState<string | null>(null);

  const handleSelectOffer = async (offer: EnergyListing) => {
    setSelectingOfferId(offer.id);
    try {
      await onSelectOffer(offer);
    } finally {
      setSelectingOfferId(null);
    }
  };

  if (!listing) return null;

  const showOfferList = offers.length > 0;

  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Choose Offer</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Select one offer from this catalog to get the quotation
        </Typography>

        {showOfferList && (
          <>
            <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: 1.5, p: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Seller</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.5 }}>{listing.seller_name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {offers.length} offers available in this catalog
              </Typography>
            </Box>

            <Stack sx={{ maxHeight: 420, overflowY: 'auto', gap: 1.5, pr: 1 }}>
              {offers.map((offer) => {
                const offerTotal = offer.price_per_unit * offer.quantity_available;
                const isSelectingThisOffer = selectingOfferId === offer.id;

                return (
                  <Box key={offer.id} sx={{ bgcolor: 'rgba(245, 158, 11, 0.02)', borderRadius: 1.5, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{offer.offer_name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.25, display: 'block' }}>
                        {offer.quantity_available} {offer.quantity_unit} at ₹{offer.price_per_unit.toFixed(2)}/{offer.quantity_unit}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {new Date(offer.delivery_start).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>→</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {new Date(offer.delivery_end).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>₹{offerTotal.toFixed(2)}</Typography>
                      <Button
                        onClick={() => handleSelectOffer(offer)}
                        disabled={status === 'selecting'}
                        variant="contained"
                        size="small"
                        startIcon={isSelectingThisOffer ? <Loader2 size={16} className="animate-spin" /> : undefined}
                      >
                        {isSelectingThisOffer ? 'Selecting...' : 'Select'}
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Stack>

            {error && (
              <Alert severity="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertCircle size={18} />
                <Typography variant="body2">{error}</Typography>
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={status === 'selecting'}
          variant="outlined"
          fullWidth
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
