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
import { Loader2, AlertCircle } from 'lucide-react';

interface ConfirmOrderModalProps {
  isOpen: boolean;
  listing: EnergyListing | null;
  offers: EnergyListing[];
  error: string | null;
  status: 'idle' | 'selecting' | 'quoted' | 'confirming' | 'confirmed';
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
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Offer</DialogTitle>
          <DialogDescription>
            Select one offer from this catalog to get the quotation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {showOfferList && (
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
                          disabled={status === 'selecting'}
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
                  disabled={status === 'selecting'}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
