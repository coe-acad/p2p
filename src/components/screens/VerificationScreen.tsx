import { useState, useEffect, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowLeft, Shield, Check, X, CreditCard, Receipt, Loader2, Lock, ShieldCheck, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import SamaiLogo from "../SamaiLogo";
import { useUserData } from "@/hooks/useUserData";
import { ensureUserOnServer } from "@/services/userService";

const discomByState: Record<string, string> = {
  "karnataka": "BESCOM",
  "maharashtra": "MSEDCL",
  "tamil nadu": "TANGEDCO",
  "telangana": "TSSPDCL",
  "andhra pradesh": "APEPDCL",
  "delhi": "TPDDL",
  "west bengal": "WBSEDCL",
  "rajasthan": "JVVNL",
  "punjab": "PSPCL",
  "haryana": "DSCL",
  "himachal pradesh": "HPSEBL",
  "uttarakhand": "UPCL",
  "uttar pradesh": "UPCL",
  "madhya pradesh": "MPEZ",
  "chhattisgarh": "CSPTCL",
  "jharkhand": "JSEB",
  "odisha": "CESU",
  "bihar": "NBISL",
  "kerala": "KSEB",
  "goa": "EDCL",
};

interface VerificationScreenProps {
  onVerified: (phone?: string) => void;
  onBack: () => void;
  isReturningUser?: boolean;
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

const VerificationScreen = ({ onVerified, onBack, isReturningUser = false }: VerificationScreenProps) => {
  const { setUserData } = useUserData();
  const [step, setStep] = useState<"phone" | "otp" | "profile" | "aadhaar" | "aadhaar-otp" | "fetching" | "location">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Profile step state
  const [profileName, setProfileName] = useState("");
  const [profileMeterId, setProfileMeterId] = useState("");
  const [profileError, setProfileError] = useState("");

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

  // Location step state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [discom, setDiscom] = useState("");
  const [locationError, setLocationError] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [discomExpanded, setDiscomExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Fetching loading state
  const [fetchingProgress, setFetchingProgress] = useState(0);
  const [fetchingStep, setFetchingStep] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  
  const fetchingMessages = [
    { icon: Loader2, text: "Connecting to DigiLocker...", spin: true },
    { icon: Lock, text: "Fetching securely...", spin: false },
    { icon: ShieldCheck, text: "Verification complete!", spin: false },
  ];

  // Handle fetching animation
  useEffect(() => {
    if (step === "fetching") {
      setFetchingProgress(0);
      setFetchingStep(0);

      const progressInterval = setInterval(() => {
        setFetchingProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 3.33; // Complete in ~3 seconds
        });
      }, 100);

      const stepTimers = [
        setTimeout(() => setFetchingStep(1), 1000),
        setTimeout(() => setFetchingStep(2), 2000),
        setTimeout(() => {
          localStorage.setItem("samai_aadhaar_verified", "true");
          setStep("location");
        }, 3000),
      ];

      return () => {
        clearInterval(progressInterval);
        stepTimers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [step, onVerified]);

  // Auto-detect location when reaching location step
  useEffect(() => {
    if (step === "location" && !address) {
      detectLocationAuto();
    }
  }, [step]);

  const detectLocationAuto = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const fullAddress = data.address?.road || data.display_name || "";
          const state = data.address?.state || "";
          const detectedCity = data.address?.city || data.address?.town || "";

          setAddress(fullAddress);
          setCity(detectedCity);

          // Auto-select DISCOM based on detected state
          const selectedDiscom = discomByState[state.toLowerCase()] || "BESCOM";
          setDiscom(selectedDiscom);
          setLocationError("");
        } catch (err) {
          console.error("Geocoding error:", err);
          setLocationError("Could not detect location. Please enter manually.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Location access denied. Please enter manually.");
        setDetectingLocation(false);
      }
    );
  };
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(digitsOnly);
    if (phoneError) setPhoneError("");
    if (digitsOnly.length === 10 && !isValidIndianMobile(digitsOnly)) {
      setPhoneError("Must start with 6, 7, 8, or 9");
    }
  };

  const handlePhoneSubmit = async () => {
    if (!isValidIndianMobile(phoneNumber)) {
      setPhoneError("Must start with 6, 7, 8, or 9");
      return;
    }
    setIsSendingOtp(true);
    setPhoneError("");
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
      confirmationResultRef.current = await signInWithPhoneNumber(
        auth,
        `+91${phoneNumber}`,
        recaptchaVerifierRef.current
      );
      setStep("otp");
    } catch (err: any) {
      setPhoneError(err.message ?? "Failed to send OTP. Please try again.");
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpError("");
      if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
      if (newOtp.every(d => d) && newOtp.join("").length === 6) {
        verifyOtp(newOtp.join(""));
      }
    }
  };

  const verifyOtp = async (enteredOtp: string) => {
    if (!confirmationResultRef.current) return;
    try {
      await confirmationResultRef.current.confirm(enteredOtp);
      if (isReturningUser) {
        onVerified(phoneNumber);
      } else {
        // Save phone number immediately so profile data can be saved to Firestore
        setUserData({
          phone: `+91${phoneNumber}`,
        });
        setStep("profile");
      }
    } catch {
      setOtpError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    }
  };

  const handleProfileSubmit = async () => {
    if (!profileName.trim() || !profileMeterId.trim()) {
      setProfileError("Name and Meter Number are required");
      return;
    }
    const name = profileName.trim();
    const meter_number = profileMeterId.trim();
    setUserData({
      name,
      consumerId: meter_number,
    });
    try {
      await ensureUserOnServer(name, meter_number);
    } catch (err) {
      console.error("Failed to sync user profile:", err);
    }
    setStep("aadhaar");
  };

  const handleResendOtp = async () => {
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    await handlePhoneSubmit();
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
    setStep("fetching");
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
    setStep("fetching");
  };

  const handleAadhaarOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...aadhaarOtp];
      newOtp[index] = value;
      setAadhaarOtp(newOtp);
      if (value && index < 5) document.getElementById(`aadhaar-otp-${index + 1}`)?.focus();
      if (newOtp.every(d => d) && newOtp.join("").length === 6) {
        setTimeout(() => setStep("fetching"), 500);
      }
    }
  };

  const handleDigiLockerVerify = () => {
    if (consentChecked) {
      setStep("fetching");
    }
  };

  const handleLocationSubmit = () => {
    if (!address.trim() || !city.trim() || !discom) {
      setLocationError("Address, City, and DISCOM are required");
      return;
    }
    setUserData({
      address,
      city,
      discom,
    });
    onVerified(phoneNumber);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatAadhaar = (value: string) => {
    return value.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const ctaLabel =
    step === "phone"
      ? "Send OTP"
      : step === "profile"
        ? "Continue"
        : step === "aadhaar" && aadhaarMethod === "digilocker"
          ? "Verify via DigiLocker"
          : step === "aadhaar" && aadhaarMethod === "manual"
            ? "Send OTP to Aadhaar Mobile"
            : step === "aadhaar" && aadhaarMethod === "pan"
              ? "Verify PAN"
              : step === "aadhaar" && aadhaarMethod === "gstin"
                ? "Verify GSTIN"
                : step === "location"
                  ? "Complete Setup"
                  : null;

  const ctaAction =
    step === "phone"
      ? handlePhoneSubmit
      : step === "profile"
        ? handleProfileSubmit
        : step === "aadhaar" && aadhaarMethod === "digilocker"
          ? handleDigiLockerVerify
          : step === "aadhaar" && aadhaarMethod === "manual"
            ? handleAadhaarSubmit
            : step === "aadhaar" && aadhaarMethod === "pan"
              ? handlePanSubmit
              : step === "aadhaar" && aadhaarMethod === "gstin"
                ? handleGstinSubmit
                : step === "location"
                  ? handleLocationSubmit
                  : undefined;

  const ctaDisabled =
    step === "phone"
      ? phoneNumber.length !== 10 || !!phoneError || isSendingOtp
      : step === "profile"
        ? !profileName.trim() || !profileMeterId.trim()
        : step === "aadhaar" && aadhaarMethod === "digilocker"
          ? !consentChecked
          : step === "aadhaar" && aadhaarMethod === "manual"
            ? aadhaarNumber.length !== 12
            : step === "aadhaar" && aadhaarMethod === "pan"
              ? panNumber.length !== 10
              : step === "aadhaar" && aadhaarMethod === "gstin"
                ? gstinNumber.length !== 15
                : step === "location"
                  ? !address.trim() || !city.trim() || !discom
                  : true;

  const ctaClassName =
    step === "aadhaar" && aadhaarMethod === "digilocker"
      ? "btn-green"
      : "btn-solar";

  return (
    <div className="screen-container !justify-start !py-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 h-[280px] w-[440px] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-300/30 via-amber-200/15 to-transparent blur-3xl sm:h-[340px] sm:w-[560px]" />
        <div className="absolute top-[20%] -left-24 h-[220px] w-[220px] rounded-full bg-gradient-to-br from-orange-400/15 to-amber-500/10 blur-3xl" />
        <div className="absolute bottom-[15%] -right-20 h-[180px] w-[180px] rounded-full bg-gradient-to-bl from-teal-400/15 to-green-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(320px,0.72fr)] lg:items-stretch">
        <div className="hidden lg:flex">
          <div className="flex w-full flex-col justify-between rounded-[2rem] border border-white/60 bg-white/55 p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur-md">
            <div>
              <div className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Identity setup
              </div>
              <h2 className="mt-5 text-3xl font-semibold leading-tight text-foreground">
                Verify once and unlock the full Samai trading flow.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
                This step confirms your phone number and identity so Samai can prepare trades, register devices, and settle payments safely.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
                <p className="text-sm font-medium text-foreground">What happens here</p>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <p>Phone verification for login and account recovery.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <p>Basic profile details to connect your account to the right meter.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <p>Aadhaar, PAN, or GSTIN verification depending on the user type.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Security</p>
                <p className="mt-2 leading-6">
                  Verification data is used only for onboarding, compliance, and trade registration. Sensitive IDs are not kept in long-term app storage.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0">
          <div className="flex w-full flex-col rounded-[1.75rem] border border-orange-200/80 bg-gradient-to-br from-orange-50 via-amber-50 to-white p-4 shadow-[0_24px_80px_-40px_rgba(249,115,22,0.28)] backdrop-blur-md sm:p-5 lg:min-h-[44rem] lg:rounded-[2rem] lg:p-6">
        {/* Header with Logo */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            {/* Dev skip button for testing */}
            <button 
              onClick={() => onVerified()}
              className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground"
              title="Skip verification (dev)"
            >
              [Skip]
            </button>
            <SamaiLogo size="sm" showText={false} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center animate-slide-up mb-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 shadow-sm ring-1 ring-orange-200/70">
            <Shield className="text-primary" size={22} />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight sm:text-xl">Verify your identity</h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-sm">
            {isReturningUser
              ? "Sign back in and continue with your existing Samai account."
              : "Complete a few steps so Samai can prepare your first trading setup."}
          </p>
        </div>

        {/* Steps - 2 for returning users, 5 for new users (phone → otp → profile → aadhaar → location) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 animate-fade-in mb-4">
          <div className={`w-2 h-2 rounded-full ${step !== "phone" || step === "phone" ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-5 h-0.5 ${["otp", "profile", "aadhaar", "aadhaar-otp", "fetching", "location"].includes(step) ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-2 h-2 rounded-full ${["otp", "profile", "aadhaar", "aadhaar-otp", "fetching", "location"].includes(step) ? "bg-primary" : "bg-muted"}`} />
          {!isReturningUser && (
            <>
              <div className={`w-5 h-0.5 ${["profile", "aadhaar", "aadhaar-otp", "fetching", "location"].includes(step) ? "bg-primary" : "bg-muted"}`} />
              <div className={`w-2 h-2 rounded-full ${["profile", "aadhaar", "aadhaar-otp", "fetching", "location"].includes(step) ? "bg-primary" : "bg-muted"}`} />
              <div className={`w-5 h-0.5 ${["aadhaar", "aadhaar-otp", "fetching", "location"].includes(step) ? "bg-primary" : "bg-muted"}`} />
              <div className={`w-2 h-2 rounded-full ${["aadhaar", "aadhaar-otp", "fetching", "location"].includes(step) ? "bg-primary" : "bg-muted"}`} />
              <div className={`w-5 h-0.5 ${["location"].includes(step) ? "bg-primary" : "bg-muted"}`} />
              <div className={`w-2 h-2 rounded-full ${["location"].includes(step) ? "bg-primary" : "bg-muted"}`} />
            </>
          )}
        </div>

        {/* Content area */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-0 lg:pr-1">
          {/* Phone Step */}
          {step === "phone" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div className="rounded-2xl border border-orange-200/70 bg-white/92 p-4 shadow-card">
                <p className="mb-3 text-sm font-medium text-foreground">Mobile number</p>
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
                <p className="mt-3 text-2xs leading-5 text-muted-foreground">
                  We’ll send a one-time password to this number.
                </p>
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div className="rounded-2xl border border-orange-200/70 bg-white/92 p-4 text-center shadow-card">
                <p className="text-xs text-muted-foreground">OTP sent to +91 {phoneNumber}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="h-11 w-10 rounded-lg border border-input bg-card text-center text-base font-semibold focus:outline-none focus:ring-1 focus:ring-primary sm:h-12 sm:w-11"
                    />
                  ))}
                </div>
                <p className="mt-3 text-2xs leading-5 text-muted-foreground">
                  Enter the 6-digit code to continue.
                </p>
              </div>
              {otpError && <p className="text-2xs text-destructive text-center">{otpError}</p>}
              <button onClick={handleResendOtp} className="text-2xs text-muted-foreground hover:text-primary text-center">
                Resend OTP
              </button>
            </div>
          )}

          {/* Profile Step */}
          {step === "profile" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div className="flex items-center gap-2 p-2.5 bg-accent/8 rounded-lg">
                <Check className="text-accent" size={14} />
                <span className="text-xs text-foreground">Phone verified: +91 {phoneNumber}</span>
              </div>

              <div className="rounded-xl border border-orange-200/70 bg-white/92 p-3 shadow-card">
                <h3 className="text-sm font-medium text-foreground mb-0.5">Complete Your Profile</h3>
                <p className="text-2xs text-muted-foreground mb-3">This information will be used in your energy trades.</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => {
                        setProfileName(e.target.value);
                        if (profileError) setProfileError("");
                      }}
                      placeholder="Enter your full name"
                      className={`w-full px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-1 transition-all ${
                        profileError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Meter Number</label>
                    <input
                      type="text"
                      value={profileMeterId}
                      onChange={(e) => {
                        setProfileMeterId(e.target.value);
                        if (profileError) setProfileError("");
                      }}
                      placeholder="Enter your utility meter number"
                      className={`w-full px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-1 transition-all ${
                        profileError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
                      }`}
                    />
                  </div>

                  {profileError && <p className="text-2xs text-destructive">{profileError}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Aadhaar Step */}
          {step === "aadhaar" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div className="flex items-center gap-2 p-2.5 bg-accent/8 rounded-lg">
                <Check className="text-accent" size={14} />
                <span className="text-xs text-foreground">Phone verified: +91 {phoneNumber}</span>
              </div>

              <div className="rounded-xl border border-orange-200/70 bg-white/92 p-3 shadow-card">
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
              
              <div className="rounded-2xl border border-orange-200/70 bg-white/92 p-4 text-center shadow-card">
                <p className="text-xs text-muted-foreground">OTP sent to Aadhaar-registered mobile</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {aadhaarOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`aadhaar-otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleAadhaarOtpChange(index, e.target.value)}
                      className="h-11 w-10 rounded-lg border border-input bg-card text-center text-base font-semibold focus:outline-none focus:ring-1 focus:ring-primary sm:h-12 sm:w-11"
                    />
                  ))}
                </div>
              </div>
              <button className="text-2xs text-muted-foreground hover:text-primary text-center">
                Resend OTP
              </button>
            </div>
          )}

          {/* Fetching/Loading Step */}
          {step === "fetching" && (
            <div className="flex flex-col items-center justify-center gap-6 animate-fade-in py-8">
              {/* Logo with pulse */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Shield className="text-primary" size={28} />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs">
                <Progress value={fetchingProgress} className="h-1.5" />
              </div>

              {/* Status messages */}
              <div className="w-full space-y-2">
                {fetchingMessages.map((msg, index) => {
                  const Icon = msg.icon;
                  const isActive = index <= fetchingStep;
                  const isComplete = index < fetchingStep;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                        isActive ? "opacity-100 bg-primary/5" : "opacity-30"
                      }`}
                    >
                      {isComplete ? (
                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <Check className="text-accent-foreground" size={12} />
                        </div>
                      ) : (
                        <Icon
                          className={`text-primary ${msg.spin && isActive && !isComplete ? "animate-spin" : ""}`}
                          size={20}
                        />
                      )}
                      <span className="text-sm text-foreground">{msg.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Security note */}
              <div className="text-center space-y-1 pt-2">
                <p className="text-2xs text-muted-foreground">🔒 Your data is encrypted end-to-end</p>
                <p className="text-2xs text-muted-foreground">We never store your Aadhaar number</p>
              </div>
            </div>
          )}

          {/* Location/DISCOM/VC Step */}
          {step === "location" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div className="flex items-center gap-2 p-2.5 bg-accent/8 rounded-lg">
                <Check className="text-accent" size={14} />
                <span className="text-xs text-foreground">Identity verified</span>
              </div>

              <div className="rounded-xl border border-orange-200/70 bg-white/92 p-3 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Location, DISCOM & VC Documents</h3>
                    <p className="text-2xs text-muted-foreground mt-0.5">Complete your details to finalize your account setup.</p>
                  </div>
                  <button
                    onClick={detectLocationAuto}
                    disabled={detectingLocation}
                    className="flex items-center gap-1 px-2 py-1.5 text-2xs font-medium text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                  >
                    {detectingLocation ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <MapPin size={12} />
                        Auto-detect
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Address */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (locationError) setLocationError("");
                      }}
                      placeholder="Enter your address or use auto-detect"
                      rows={2}
                      className="w-full text-sm font-medium text-foreground bg-card border border-input rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  {/* City/Region */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">City / Region</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (locationError) setLocationError("");
                      }}
                      placeholder="e.g., Bengaluru, Karnataka"
                      className="w-full text-sm font-medium text-foreground bg-card border border-input rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* DISCOM Selection */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Electricity Distribution Company</label>
                    <button
                      onClick={() => setDiscomExpanded(!discomExpanded)}
                      className={`w-full px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between ${
                        discomExpanded
                          ? "border-primary bg-primary/5"
                          : "border-input bg-card hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {discom || "Select DISCOM"}
                      </span>
                      <span className={`text-muted-foreground transition-transform ${discomExpanded ? "rotate-180" : ""}`}>
                        ▼
                      </span>
                    </button>

                    {/* Expanded Options */}
                    {discomExpanded && (
                      <div className="mt-2 grid grid-cols-2 gap-2 animate-fade-in">
                        {["BESCOM", "MESCOM", "HESCOM", "GESCOM", "CESC", "MSEDCL", "TPDDL"].map((d) => (
                          <button
                            key={d}
                            onClick={() => {
                              setDiscom(d);
                              setDiscomExpanded(false);
                            }}
                            className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                              discom === d
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border/50"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">VC Documents (Optional)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.json,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 flex flex-col items-center gap-2"
                    >
                      <div className="text-2xs text-foreground">Click to upload VC documents</div>
                      <div className="text-2xs text-muted-foreground">PDF, JSON, JPG, PNG (optional)</div>
                    </button>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-2xs font-medium text-muted-foreground">Uploaded ({uploadedFiles.length})</p>
                        <div className="space-y-1">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-1.5 bg-muted/30 rounded-lg text-2xs">
                              <span className="truncate text-foreground">{file.name}</span>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-muted-foreground hover:text-destructive flex-shrink-0 ml-2"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {locationError && <p className="text-2xs text-destructive">{locationError}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed bottom CTA */}
        <div className="mt-4 border-t border-border/60 pt-4 pb-1">
          {ctaLabel && ctaAction && (
            <button
              onClick={ctaAction}
              disabled={ctaDisabled}
              className={`${ctaClassName} w-full text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {step === "phone" && isSendingOtp ? <Loader2 size={16} className="animate-spin mx-auto" /> : ctaLabel}
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
        </div>
      </div>

      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container" />

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
