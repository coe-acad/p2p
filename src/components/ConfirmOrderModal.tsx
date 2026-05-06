import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EnergyListing } from '@/hooks/useDiscoverListings';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ConfirmOrderModalProps {
  isOpen: boolean;
  listing: EnergyListing | null;
  isLoading: boolean;
  error: string | null;
  status: 'idle' | 'selecting' | 'selected' | 'confirming' | 'confirmed';
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const ConfirmOrderModal = ({
  isOpen,
  listing,
  isLoading,
  error,
  status,
  onConfirm,
  onCancel,
}: ConfirmOrderModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  if (!listing) return null;

  const totalPrice = listing.price_per_unit * listing.quantity_available;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm Order</DialogTitle>
          <DialogDescription>
            Review and confirm your energy purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seller Info */}
          <div className="border rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">Seller</p>
            <p className="text-lg font-semibold">{listing.seller_name}</p>
            <p className="text-sm text-gray-600">{listing.offer_name}</p>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Quantity</p>
              <p className="text-lg font-semibold">
                {listing.quantity_available} {listing.quantity_unit}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Price per Unit</p>
              <p className="text-lg font-semibold">
                ₹{listing.price_per_unit.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Delivery Window */}
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

          {/* Total Amount */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600">
              ₹{totalPrice.toFixed(2)}
            </p>
          </div>

          {/* Status Messages */}
          {status === 'selected' && !error && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle size={18} />
              <span>Offer selected successfully. Ready to confirm.</span>
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
              <span>Order confirmed successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isConfirming}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                isLoading ||
                isConfirming ||
                status === 'confirmed' ||
                status === 'confirming'
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isConfirming || status === 'confirming' ? (
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
