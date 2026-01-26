import { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface ReturningUserScreenProps {
  onSubmit: (phone: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const isValidIndianMobile = (phone: string): boolean => /^[6-9]\d{9}$/.test(phone);

const ReturningUserScreen = ({ onSubmit, onBack, isLoading = false }: ReturningUserScreenProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(digitsOnly);
    if (phoneError) setPhoneError("");
    if (digitsOnly.length === 10 && !isValidIndianMobile(digitsOnly)) {
      setPhoneError("Must start with 6, 7, 8, or 9");
    }
  };

  const handleSubmit = () => {
    if (!isValidIndianMobile(phoneNumber)) {
      setPhoneError("Must start with 6, 7, 8, or 9");
      return;
    }
    onSubmit(phoneNumber);
  };

  return (
    <div className="screen-container !py-6">
      <div className="w-full max-w-md flex flex-col gap-5 px-4">
        <button onClick={onBack} className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        <div className="text-center animate-slide-up">
          <h2 className="text-xl font-bold text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">Enter your registered mobile number</p>
        </div>

        <div className="flex flex-col gap-4 animate-slide-up">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Enter 10-digit number"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-card text-foreground text-sm focus:outline-none focus:ring-1 transition-all ${
                  phoneError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
                }`}
              />
            </div>
            {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={phoneNumber.length !== 10 || !!phoneError || isLoading}
            className="btn-solar w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Checking..." : "Go to dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturningUserScreen;
