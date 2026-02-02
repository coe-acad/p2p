import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Wallet, Check } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";

const PaymentSettingsPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  const { toast } = useToast();
  const [upiId, setUpiId] = useState(userData.upiId || "");

  const handleSave = () => {
    if (!upiId.trim()) {
      toast({
        title: "UPI ID required",
        description: "Please enter your UPI ID to receive payments",
        variant: "destructive",
      });
      return;
    }

    // Basic UPI format validation
    if (!upiId.includes("@")) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID (e.g., name@upi)",
        variant: "destructive",
      });
      return;
    }

    setUserData({ upiId });
    toast({
      title: "Payment method saved",
      description: "Your UPI ID has been updated successfully",
    });
    navigate(-1);
  };

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <div className="w-full max-w-md flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Payment Settings</h1>
        </div>

        {/* Main Content */}
        <div className="space-y-4 animate-slide-up">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">UPI ID</p>
                <p className="text-xs text-muted-foreground">For receiving trade settlements</p>
              </div>
            </div>

            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <p className="text-2xs text-muted-foreground mt-2">
              Enter your UPI ID linked to your bank account. All trade earnings will be credited here at end of month.
            </p>
          </div>

          {/* Settlement Info */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-foreground">How settlements work</p>
            <ul className="space-y-1.5 text-2xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check size={12} className="text-accent mt-0.5 flex-shrink-0" />
                <span>All trades are settled at the end of each month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={12} className="text-accent mt-0.5 flex-shrink-0" />
                <span>Earnings credited directly to your UPI account</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={12} className="text-accent mt-0.5 flex-shrink-0" />
                <span>View transaction history in Payments page, updated daily at 10 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-auto pt-4">
          <button 
            onClick={handleSave}
            className="btn-solar w-full"
          >
            Save Payment Method
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;
