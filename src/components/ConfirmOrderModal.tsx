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
  offers: EnergyListing[];
  selectedOffer: EnergyListing | null;
  isLoading: boolean;
  error: string | null;
  status: 'idle' | 'selecting' | 'selected' | 'confirming' | 'confirmed';
  onSelectOffer: (offer: EnergyListing) => Promise<void>;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const ConfirmOrderModal = ({
  isOpen,
  listing,
  offers,
  selectedOffer,
  isLoading,
  error,
  status,
  onSelectOffer,
  onConfirm,
  onCancel,
}: ConfirmOrderModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectingOfferId, setSelectingOfferId] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSelectOffer = async (offer: EnergyListing) => {
    setSelectingOfferId(offer.id);
    try {
      await onSelectOffer(offer);
    } finally {
      setSelectingOfferId(null);
    }
  };

  if (!listing) return null;

  const totalPrice = listing.price_per_unit * listing.quantity_available;
  const showOfferList = !selectedOffer && offers.length > 0;

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
          {showOfferList ? (
            <>
              <div className="border rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">Seller</p>
                <p className="text-lg font-semibold">{listing.seller_name}</p>
                <p className="text-sm text-gray-600">
                  {offers.length} offers available in this catalog
                </p>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {offers.map((offer) => {
                  const offerTotal = offer.price_per_unit * offer.quantity_available;
                  const isSelectingThisOffer = selectingOfferId === offer.id || (status === 'selecting' && selectedOffer?.id === offer.id);

                  return (
                    <div key={offer.id} className="border rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{offer.offer_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {offer.quantity_available} {offer.quantity_unit} at ₹{offer.price_per_unit.toFixed(2)}/{offer.quantity_unit}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {new Date(offer.delivery_start).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span>
                          {new Date(offer.delivery_end).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-blue-600">₹{offerTotal.toFixed(2)}</p>
                        <Button
                          onClick={() => handleSelectOffer(offer)}
                          disabled={isLoading || status === 'selecting' || status === 'confirming'}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSelectingThisOffer ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Selecting...
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading || status === 'selecting'}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
