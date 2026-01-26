import { useState } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface VerificationScreenProps {
  onVerified: (details: { name: string; phone: string }) => void;
  onBack: () => void;
}

const isValidIndianMobile = (phone: string): boolean => /^[6-9]\d{9}$/.test(phone);

const VerificationScreen = ({ onVerified, onBack }: VerificationScreenProps) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) setNameError("");
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(digitsOnly);
    if (phoneError) setPhoneError("");
    if (digitsOnly.length === 10 && !isValidIndianMobile(digitsOnly)) {
      setPhoneError("Must start with 6, 7, 8, or 9");
    }
  };

  const handlePhoneSubmit = () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    if (!isValidIndianMobile(phoneNumber)) {
      setPhoneError("Must start with 6, 7, 8, or 9");
      return;
    }
    setStep("otp");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
      if (newOtp.every(d => d) && newOtp.join("").length === 6) {
        setTimeout(() => onVerified({ name: name.trim(), phone: phoneNumber }), 500);
      }
    }
  };

  return (
    <div className="screen-container !py-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Title */}
        <div className="text-center animate-slide-up mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-2">
            <Shield className="text-primary" size={22} />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Verify your identity</h2>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-1.5 animate-fade-in mb-3">
          <div className={`w-2 h-2 rounded-full ${step !== "phone" || step === "phone" ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-5 h-0.5 ${step === "otp" ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-2 h-2 rounded-full ${step === "otp" ? "bg-primary" : "bg-muted"}`} />
        </div>

        {/* Content area */}
        <div className="flex-1">
          {step === "phone" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-1 transition-all ${
                    nameError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
                  }`}
                />
                {nameError && <p className="text-2xs text-destructive mt-1">{nameError}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter 10-digit number"
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-1 transition-all ${
                      phoneError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
                    }`}
                  />
                </div>
                {phoneError && <p className="text-2xs text-destructive mt-1">{phoneError}</p>}
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">OTP sent to +91 {phoneNumber}</p>
                <div className="flex justify-center gap-1.5 mt-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-9 h-10 text-center text-base font-semibold rounded-lg border border-input bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ))}
                </div>
              </div>
              <button className="text-2xs text-muted-foreground hover:text-primary text-center">
                Resend OTP
              </button>
            </div>
          )}
        </div>

        {/* Fixed bottom CTA */}
        <div className="mt-auto pt-4 pb-6">
          {step === "phone" && (
            <button
              onClick={handlePhoneSubmit}
              disabled={!name.trim() || phoneNumber.length !== 10 || !!phoneError}
              className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationScreen;
