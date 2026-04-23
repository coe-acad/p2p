import { EnergyListing } from '@/hooks/useDiscoverListings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface EnergyListingCardProps {
  listing: EnergyListing;
  onSelect?: (listing: EnergyListing) => void;
}

export const EnergyListingCard = ({ listing, onSelect }: EnergyListingCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

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
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{listing.seller_name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {listing.offer_name}
            </CardDescription>
          </div>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="ml-2 text-gray-400 hover:text-red-500"
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
            <p className="text-lg font-semibold">
              ₹{listing.price_per_unit.toFixed(2)}/{listing.quantity_unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
            <p className="text-lg font-semibold">
              {listing.quantity_available.toFixed(2)} {listing.quantity_unit}
            </p>
          </div>
        </div>

        {/* Total Price */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Total Available Value</p>
          <p className="text-xl font-bold text-blue-600">
            ₹{listing.total_price.toFixed(2)}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Source Type</p>
            <Badge variant="secondary" className="mt-1">
              {listing.source_type}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pricing Model</p>
            <Badge variant="outline" className="mt-1">
              {listing.pricing_model}
            </Badge>
          </div>
        </div>

        {/* Delivery Window */}
        {(listing.delivery_start || listing.delivery_end) && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Delivery</p>
            <div className="flex items-center justify-between text-sm">
              <span>
                {listing.delivery_start
                  ? `${formatDate(listing.delivery_start)} ${formatTime(listing.delivery_start)}`
                  : 'Flexible'}
              </span>
              <span className="text-gray-400">→</span>
              <span>
                {listing.delivery_end
                  ? `${formatDate(listing.delivery_end)} ${formatTime(listing.delivery_end)}`
                  : 'Flexible'}
              </span>
            </div>
          </div>
        )}

        {/* Validity Window */}
        {(listing.validity_start || listing.validity_end) && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Valid Until</p>
            <p className="text-sm">
              {listing.validity_end
                ? formatDate(listing.validity_end)
                : 'Open-ended'}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onSelect?.(listing)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
