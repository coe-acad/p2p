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

interface SelectedOrderModalProps {
  isOpen: boolean;
  listing: EnergyListing | null;
  error: string | null;
  status: 'idle' | 'selecting' | 'selected' | 'quoting' | 'quoted' | 'confirming' | 'confirmed';
  onRequestInit: () => Promise<void>;
  onBack: () => void;
}

export const SelectedOrderModal = ({
  isOpen,
  listing,
  error,
  status,
  onRequestInit,
  onBack,
}: SelectedOrderModalProps) => {
  if (!listing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onBack}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Selected Order</DialogTitle>
          <DialogDescription>
            Your offer has been selected. Request the quotation to continue.
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
              <p className="text-xs text-gray-600 mb-1">Quantity</p>
              <p className="text-lg font-semibold">
                {listing.quantity_available} {listing.quantity_unit}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Price Per Unit</p>
              <p className="text-lg font-semibold">₹{listing.price_per_unit.toFixed(2)}</p>
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

          {status === 'selected' && !error && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle size={18} />
              <span>Offer selected successfully. Ready to request quotation.</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={status === 'quoting'}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={onRequestInit}
              disabled={status === 'quoting'}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {status === 'quoting' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                'Request Quotation'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
