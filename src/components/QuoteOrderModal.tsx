import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EnergyListing } from '@/hooks/useDiscoverListings';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface QuoteOrderModalProps {
  isOpen: boolean;
  listing: EnergyListing | null;
  quote: any;
  error: string | null;
  status: 'idle' | 'selecting' | 'quoted' | 'confirming' | 'confirmed';
  onConfirm: () => Promise<void>;
  onBack: () => void;
}

export const QuoteOrderModal = ({
  isOpen,
  listing,
  quote,
  error,
  status,
  onConfirm,
  onBack,
}: QuoteOrderModalProps) => {
  if (!listing) return null;

  const quoteItem = quote?.['beckn:orderItems']?.[0] ?? null;
  const quoteOffer = quoteItem?.['beckn:acceptedOffer'] ?? null;
  const quoteQuantity = Number(
    quoteItem?.['beckn:quantity']?.unitQuantity ?? listing.quantity_available ?? 0
  );
  const quotedAmount = Number(
    quoteOffer?.['beckn:price']?.value ??
      quoteOffer?.['beckn:price']?.['schema:price'] ??
      listing.price_per_unit * listing.quantity_available
  );
  const quotePaymentStatus = quote?.['beckn:payment']?.['beckn:paymentStatus'] ?? 'Pending';
  const quoteOrderStatus = quote?.['beckn:orderStatus'] ?? 'Pending';

  return (
    <Dialog open={isOpen} onOpenChange={onBack}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Quotation</DialogTitle>
          <DialogDescription>
            Review the on_init quotation before confirming the order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">Seller</p>
            <p className="text-lg font-semibold">{listing.seller_name}</p>
            <p className="text-sm text-gray-600">{listing.offer_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Quoted Quantity</p>
              <p className="text-lg font-semibold">
                {quoteQuantity} {listing.quantity_unit}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Payment Status</p>
              <p className="text-lg font-semibold">{quotePaymentStatus}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Listed Price</p>
              <p className="text-lg font-semibold">₹{listing.price_per_unit.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Order Status</p>
              <p className="text-lg font-semibold">{quoteOrderStatus}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">Delivery Window</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {new Date(listing.delivery_start).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600">
                {new Date(listing.delivery_end).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Quotation Amount</p>
            <p className="text-3xl font-bold text-blue-600">₹{quotedAmount.toFixed(2)}</p>
          </div>

          {status === 'quoted' && !error && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle size={18} />
              <span>Quotation received successfully. Confirm to place the order.</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {status === 'confirmed' && !error && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle size={18} />
              <span>Order confirmed successfully.</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={status === 'confirming'}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={onConfirm}
              disabled={status === 'confirmed' || (status !== 'quoted' && status !== 'confirming')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {status === 'confirming' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : status === 'confirmed' ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmed
                </>
              ) : (
                'Confirm Order'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
