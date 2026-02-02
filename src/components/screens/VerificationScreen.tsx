import { useState } from "react";
import { ArrowLeft, Shield, Check, X, CreditCard, Building2, Receipt } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface VerificationScreenProps {
  onVerified: () => void;
  onBack: () => void;
}

const isValidIndianMobile = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};

const isValidAadhaar = (aadhaar: string): boolean => {
  return /^\d{12}$/.test(aadhaar);
};

const isValidPAN = (pan: string): boolean => {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
};

const isValidGSTIN = (gstin: string): boolean => {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin.toUpperCase());
};

const VerificationScreen = ({ onVerified, onBack }: VerificationScreenProps) => {
  const [step, setStep] = useState<"phone" | "otp" | "aadhaar" | "aadhaar-otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Aadhaar manual entry state
  const [aadhaarMethod, setAadhaarMethod] = useState<"digilocker" | "manual" | "pan" | "gstin" | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarError, setAadhaarError] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState(["", "", "", "", "", ""]);
  
  // Business verification state
  const [panNumber, setPanNumber] = useState("");
  const [panError, setPanError] = useState("");
  const [gstinNumber, setGstinNumber] = useState("");
  const [gstinError, setGstinError] = useState("");
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(digitsOnly);
    if (phoneError) setPhoneError("");
    if (digitsOnly.length === 10 && !isValidIndianMobile(digitsOnly)) {
      setPhoneError("Must start with 6, 7, 8, or 9");
    }
  };

  const handlePhoneSubmit = () => {
    if (!isValidIndianMobile(phoneNumber)) {
      setPhoneError("Must start with 6, 7, 8, or 9");
      return;
    }
    setStep("otp");
  };

  // Check if user has completed Aadhaar verification before (returning user)
  const isReturningUser = (): boolean => {
    return localStorage.getItem("samai_aadhaar_verified") === "true";
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
      if (newOtp.every(d => d) && newOtp.join("").length === 6) {
        // Returning users skip Aadhaar, new users go to Aadhaar step
        if (isReturningUser()) {
          setTimeout(() => onVerified(), 500);
        } else {
          setTimeout(() => setStep("aadhaar"), 500);
        }
      }
    }
  };

  const handleAadhaarChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 12);
    setAadhaarNumber(digitsOnly);
    if (aadhaarError) setAadhaarError("");
  };

  const handleAadhaarSubmit = () => {
    if (!isValidAadhaar(aadhaarNumber)) {
      setAadhaarError("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    setStep("aadhaar-otp");
  };

  const handlePanChange = (value: string) => {
    const formatted = value.toUpperCase().slice(0, 10);
    setPanNumber(formatted);
    if (panError) setPanError("");
  };

  const handlePanSubmit = () => {
    if (!isValidPAN(panNumber)) {
      setPanError("Please enter a valid PAN (e.g., ABCDE1234F)");
      return;
    }
    localStorage.setItem("samai_aadhaar_verified", "true");
    onVerified();
  };

  const handleGstinChange = (value: string) => {
    const formatted = value.toUpperCase().slice(0, 15);
    setGstinNumber(formatted);
    if (gstinError) setGstinError("");
  };

  const handleGstinSubmit = () => {
    if (!isValidGSTIN(gstinNumber)) {
      setGstinError("Please enter a valid 15-character GSTIN");
      return;
    }
    localStorage.setItem("samai_aadhaar_verified", "true");
    onVerified();
  };

  const handleAadhaarOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...aadhaarOtp];
      newOtp[index] = value;
      setAadhaarOtp(newOtp);
      if (value && index < 5) document.getElementById(`aadhaar-otp-${index + 1}`)?.focus();
      if (newOtp.every(d => d) && newOtp.join("").length === 6) {
        // Mark as verified user for future logins
        localStorage.setItem("samai_aadhaar_verified", "true");
        setTimeout(() => onVerified(), 500);
      }
    }
  };

  const handleDigiLockerVerify = () => {
    if (consentChecked) {
      // Mark as verified user for future logins
      localStorage.setItem("samai_aadhaar_verified", "true");
      onVerified();
    }
  };

  const formatAadhaar = (value: string) => {
    return value.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
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
          <div className="flex items-center gap-2">
            {/* Dev skip button for testing */}
            <button 
              onClick={onVerified}
              className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground"
              title="Skip verification (dev)"
            >
              [Skip]
            </button>
            <SamaiLogo size="sm" showText={false} />
          </div>
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
          <div className={`w-5 h-0.5 ${step === "otp" || step === "aadhaar" ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-2 h-2 rounded-full ${step === "otp" || step === "aadhaar" ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-5 h-0.5 ${step === "aadhaar" ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-2 h-2 rounded-full ${step === "aadhaar" ? "bg-primary" : "bg-muted"}`} />
        </div>

        {/* Content area */}
        <div className="flex-1">
          {/* Phone Step */}
          {step === "phone" && (
            <div className="flex flex-col gap-3 animate-slide-up">
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

          {/* OTP Step */}
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

          {/* Aadhaar Step */}
          {step === "aadhaar" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div className="flex items-center gap-2 p-2.5 bg-accent/8 rounded-lg">
                <Check className="text-accent" size={14} />
                <span className="text-xs text-foreground">Phone verified: +91 {phoneNumber}</span>
              </div>

              <div className="bg-card rounded-xl border border-border p-3 shadow-card">
                <h3 className="text-sm font-medium text-foreground mb-0.5">Identity Verification</h3>
                <p className="text-2xs text-primary font-medium mb-3">Required for energy trading registration.</p>
                
                {/* Individual Options */}
                <p className="text-2xs text-muted-foreground mb-2 font-medium">For Individuals:</p>
                
                {/* DigiLocker Option */}
                <button 
                  onClick={() => {
                    setAadhaarMethod("digilocker");
                    setConsentChecked(true);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border-2 transition-all mb-1.5 ${
                    aadhaarMethod === "digilocker" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-base font-bold">D</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-medium text-foreground">Verify via DigiLocker</p>
                    <p className="text-2xs text-muted-foreground">Instant Aadhaar verification</p>
                  </div>
                  {aadhaarMethod === "digilocker" && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="text-primary-foreground" size={12} />
                    </div>
                  )}
                </button>

                {/* Manual Aadhaar Entry Option */}
                <button 
                  onClick={() => {
                    setAadhaarMethod("manual");
                    setConsentChecked(true);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border-2 transition-all mb-3 ${
                    aadhaarMethod === "manual" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="text-white" size={18} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-medium text-foreground">Enter Aadhaar Number</p>
                    <p className="text-2xs text-muted-foreground">OTP to registered mobile</p>
                  </div>
                  {aadhaarMethod === "manual" && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="text-primary-foreground" size={12} />
                    </div>
                  )}
                </button>

                {/* Aadhaar Number Input (shown when manual is selected) */}
                {aadhaarMethod === "manual" && (
                  <div className="mb-3 animate-fade-in">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Aadhaar Number</label>
                    <input
                      type="text"
                      maxLength={14}
                      value={formatAadhaar(aadhaarNumber)}
                      onChange={(e) => handleAadhaarChange(e.target.value)}
                      placeholder="XXXX XXXX XXXX"
                      className={`w-full px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm tracking-widest focus:outline-none focus:ring-1 transition-all ${
                        aadhaarError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
                      }`}
                    />
                    {aadhaarError && <p className="text-2xs text-destructive mt-1">{aadhaarError}</p>}
                  </div>
                )}

                {/* Business Options */}
                <p className="text-2xs text-muted-foreground mb-2 font-medium">For Businesses:</p>
                
                {/* PAN Option */}
                <button 
                  onClick={() => {
                    setAadhaarMethod("pan");
                    setConsentChecked(true);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border-2 transition-all mb-1.5 ${
                    aadhaarMethod === "pan" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="text-white" size={18} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-medium text-foreground">Verify via PAN</p>
                    <p className="text-2xs text-muted-foreground">For sole proprietors & individuals</p>
                  </div>
                  {aadhaarMethod === "pan" && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="text-primary-foreground" size={12} />
                    </div>
                  )}
                </button>

                {/* PAN Input (shown when PAN is selected) */}
                {aadhaarMethod === "pan" && (
                  <div className="mb-3 animate-fade-in">
                    <label className="block text-xs font-medium text-foreground mb-1.5">PAN Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => handlePanChange(e.target.value)}
                      placeholder="ABCDE1234F"
                      className={`w-full px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm tracking-widest uppercase focus:outline-none focus:ring-1 transition-all ${
                        panError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
                      }`}
                    />
                    {panError && <p className="text-2xs text-destructive mt-1">{panError}</p>}
                  </div>
                )}

                {/* GSTIN Option */}
                <button 
                  onClick={() => {
                    setAadhaarMethod("gstin");
                    setConsentChecked(true);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border-2 transition-all ${
                    aadhaarMethod === "gstin" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Receipt className="text-white" size={18} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-medium text-foreground">Verify via GSTIN</p>
                    <p className="text-2xs text-muted-foreground">For registered businesses</p>
                  </div>
                  {aadhaarMethod === "gstin" && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="text-primary-foreground" size={12} />
                    </div>
                  )}
                </button>

                {/* GSTIN Input (shown when GSTIN is selected) */}
                {aadhaarMethod === "gstin" && (
                  <div className="mt-3 animate-fade-in">
                    <label className="block text-xs font-medium text-foreground mb-1.5">GSTIN</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstinNumber}
                      onChange={(e) => handleGstinChange(e.target.value)}
                      placeholder="22AAAAA0000A1Z5"
                      className={`w-full px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm tracking-widest uppercase focus:outline-none focus:ring-1 transition-all ${
                        gstinError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
                      }`}
                    />
                    {gstinError && <p className="text-2xs text-destructive mt-1">{gstinError}</p>}
                  </div>
                )}
                
                <p className="text-2xs text-muted-foreground text-center mt-3">
                  🔒 Your data is encrypted and secure
                </p>
              </div>
            </div>
          )}

          {/* Aadhaar OTP Step */}
          {step === "aadhaar-otp" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div className="flex items-center gap-2 p-2.5 bg-accent/8 rounded-lg">
                <Check className="text-accent" size={14} />
                <span className="text-xs text-foreground">Aadhaar: XXXX XXXX {aadhaarNumber.slice(-4)}</span>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">OTP sent to Aadhaar-registered mobile</p>
                <div className="flex justify-center gap-1.5 mt-3">
                  {aadhaarOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`aadhaar-otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleAadhaarOtpChange(index, e.target.value)}
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
              disabled={phoneNumber.length !== 10 || !!phoneError}
              className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send OTP
            </button>
          )}
          {step === "aadhaar" && aadhaarMethod === "digilocker" && (
            <button
              onClick={handleDigiLockerVerify}
              disabled={!consentChecked}
              className="btn-green w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify via DigiLocker
            </button>
          )}
          {step === "aadhaar" && aadhaarMethod === "manual" && (
            <button
              onClick={handleAadhaarSubmit}
              disabled={aadhaarNumber.length !== 12}
              className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send OTP to Aadhaar Mobile
            </button>
          )}
          {step === "aadhaar" && aadhaarMethod === "pan" && (
            <button
              onClick={handlePanSubmit}
              disabled={panNumber.length !== 10}
              className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify PAN
            </button>
          )}
          {step === "aadhaar" && aadhaarMethod === "gstin" && (
            <button
              onClick={handleGstinSubmit}
              disabled={gstinNumber.length !== 15}
              className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify GSTIN
            </button>
          )}
          
          {/* Consent text */}
          <p className="text-2xs text-muted-foreground text-center mt-3 leading-relaxed">
            By continuing, you consent to share your Aadhaar verification status with Samai for the purpose of energy trading registration. Further you agree to Samai's{" "}
            <button
              onClick={() => setShowTermsModal(true)}
              className="text-primary hover:underline font-medium"
            >
              terms and conditions
            </button>
            .
          </p>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-lg animate-slide-up max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Terms & Conditions</h3>
              <button onClick={() => setShowTermsModal(false)}>
                <X size={18} className="text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">Last updated: January 2026</p>
              
              <p>
                Welcome to Samai. By using our platform, you agree to comply with and be bound by the following terms and conditions.
              </p>
              
              <h4 className="font-medium text-foreground pt-2">1. Energy Trading</h4>
              <p>
                Samai facilitates peer-to-peer energy trading between verified users. All trades are subject to applicable regulations and DISCOM guidelines.
              </p>
              
              <h4 className="font-medium text-foreground pt-2">2. Identity Verification</h4>
              <p>
                Users must complete Aadhaar verification via DigiLocker. We do not store your Aadhaar number. Verification status is shared only for regulatory compliance.
              </p>
              
              <h4 className="font-medium text-foreground pt-2">3. User Responsibilities</h4>
              <p>
                You are responsible for maintaining accurate device and location information. Providing false information may result in account suspension.
              </p>
              
              <h4 className="font-medium text-foreground pt-2">4. Pricing & Payments</h4>
              <p>
                Energy prices are determined by market conditions. Samai charges a nominal platform fee on successful trades.
              </p>
              
              <h4 className="font-medium text-foreground pt-2">5. Privacy</h4>
              <p>
                Your data is protected under our Privacy Policy. We collect only essential information required for platform operation.
              </p>
              
              <h4 className="font-medium text-foreground pt-2">6. Limitation of Liability</h4>
              <p>
                Samai is not liable for any indirect, incidental, or consequential damages arising from platform use.
              </p>
            </div>
            
            <div className="p-4 border-t border-border">
              <button
                onClick={() => setShowTermsModal(false)}
                className="btn-solar w-full text-sm !py-2.5"
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationScreen;
