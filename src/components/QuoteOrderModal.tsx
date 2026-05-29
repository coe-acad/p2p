import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, Typography, Stack, Alert, Grid } from '@mui/material';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { EnergyListing } from '@/hooks/useDiscoverListings';

interface QuoteOrderModalProps {
  isOpen: boolean;
  listing: EnergyListing | null;
  quote: any;
  error: string | null;
  status: 'idle' | 'selecting' | 'selected' | 'quoting' | 'quoted' | 'confirming' | 'confirmed';
  onGetQuote: () => Promise<void>;
  onConfirm: () => Promise<void>;
  onBack: () => void;
}

export const QuoteOrderModal = ({
  isOpen,
  listing,
  quote,
  error,
  status,
  onGetQuote,
  onConfirm,
  onBack,
}: QuoteOrderModalProps) => {
  if (!listing) return null;

  const quoteItem = quote?.['beckn:orderItems']?.[0] ?? null;
  const quoteOffer = quoteItem?.['beckn:acceptedOffer'] ?? null;
  const quoteQuantity = Number(
    quoteItem?.['beckn:quantity']?.unitQuantity ?? listing.quantity_available ?? 0
  );
  const quoteOrderValue = quote?.orderValue ?? null;
  const quotedAmount = Number(
    quoteOrderValue?.total ??
      quoteOffer?.['beckn:price']?.value ??
      ((quoteOffer?.['beckn:price']?.['schema:price'] ?? quoteOffer?.['beckn:price']?.price ?? listing.price_per_unit) *
        quoteQuantity) ??
      listing.price_per_unit * listing.quantity_available
  );
  const quotePaymentStatus = quote?.['beckn:payment']?.['beckn:paymentStatus'] ?? 'Pending';
  const quoteOrderStatus = quote?.['beckn:orderStatus'] ?? 'Pending';
  const hasQuote = Boolean(quote);
  const primaryActionLabel =
    status === 'quoting'
      ? 'Getting Quote...'
      : status === 'confirming'
        ? 'Confirming...'
        : status === 'confirmed'
          ? 'Confirmed'
          : hasQuote
            ? 'Confirm Order'
            : 'Get Quotation';

  return (
    <Dialog open={isOpen} onClose={onBack} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Quotation</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Review the on_init quotation before confirming the order
        </Typography>

        <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: 1.5, p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Seller</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{listing.seller_name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{listing.offer_name}</Typography>
        </Box>

        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: 1.5, p: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Quoted Quantity</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {quoteQuantity} {listing.quantity_unit}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: 1.5, p: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Payment Status</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{quotePaymentStatus}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: 1.5, p: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Listed Price</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{listing.price_per_unit.toFixed(2)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: 1.5, p: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Order Status</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{quoteOrderStatus}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: 1.5, p: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Delivery Window</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {new Date(listing.delivery_start).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>→</Typography>
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {new Date(listing.delivery_end).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)', borderRadius: 1.5, p: 1.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Quotation Amount</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>₹{quotedAmount.toFixed(2)}</Typography>
        </Box>

        {status === 'selected' && !hasQuote && !error && (
          <Alert severity="info" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle size={18} />
            <Typography variant="body2">Offer selected. Request the quotation to continue.</Typography>
          </Alert>
        )}

        {status === 'quoted' && !error && (
          <Alert severity="success" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle size={18} />
            <Typography variant="body2">Quotation received successfully. Confirm to place the order.</Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AlertCircle size={18} />
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {status === 'confirmed' && !error && (
          <Alert severity="success" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle size={18} />
            <Typography variant="body2">Order confirmed successfully.</Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onBack}
          disabled={status === 'confirming'}
          variant="outlined"
          fullWidth
        >
          Back
        </Button>
        <Button
          onClick={hasQuote ? onConfirm : onGetQuote}
          disabled={status === 'confirmed' || status === 'selecting' || status === 'quoting' || status === 'confirming'}
          variant="contained"
          fullWidth
          startIcon={status === 'quoting' || status === 'confirming' ? <Loader2 size={16} className="animate-spin" /> : status === 'confirmed' ? <CheckCircle size={16} /> : undefined}
        >
          {primaryActionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
