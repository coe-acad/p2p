import { useState, useEffect, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowLeft, Shield, Check, Loader2 } from "lucide-react";
import SamaiLogo from "../SamaiLogo";
import { useUserData } from "@/hooks/useUserData";
import { resolveRequiredEnv } from "@/services/apiClient";
import { logger } from "@/lib/logger";

interface VerificationScreenProps {
  onVerified: (phone?: string) => void;
  onBack: () => void;
  isReturningUser?: boolean;
  selectedIntent?: "sell" | "buy";
}

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

const isValidIndianMobile = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};

const VerificationScreen = ({ onVerified, onBack, isReturningUser = false, selectedIntent }: VerificationScreenProps) => {
  const { setUserData } = useUserData();
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isUserReturning, setIsUserReturning] = useState(isReturningUser);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  const resetRecaptchaVerifier = () => {
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;

    const container = document.getElementById(RECAPTCHA_CONTAINER_ID);
    if (container) {
      container.innerHTML = "";
    }
  };

  const getPhoneAuthErrorMessage = (error: unknown) => {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    const message =
      typeof error === "object" && error && "message" in error ? String((error as { message?: string }).message) : "";

    if (code === "auth/captcha-check-failed" || message.includes("auth/captcha-check-failed")) {
      return "Phone verification failed. Firebase reCAPTCHA rejected this request. Check that the current domain is authorized in Firebase Auth and retry.";
    }

    return message || "Failed to send OTP. Please try again.";
  };
  
  useEffect(() => {
    return () => {
      resetRecaptchaVerifier();
    };
  }, []);
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
      // Initialize RecaptchaVerifier if not already done
      const isTestingMode = import.meta.env.VITE_DISABLE_PHONE_APP_VERIFICATION_FOR_TESTING === "true";

      if (!recaptchaVerifierRef.current) {
        try {
          resetRecaptchaVerifier();

          const container = document.getElementById(RECAPTCHA_CONTAINER_ID);
          if (!container) {
            throw new Error("reCAPTCHA container not found in DOM");
          }

          const recaptchaConfig = {
            size: "invisible",
          };
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, recaptchaConfig);
          await recaptchaVerifierRef.current.render();
          logger.devLog("RecaptchaVerifier initialized successfully");
        } catch (err: any) {
          logger.error("Recaptcha initialization failed", err);
          // In testing mode, allow continuing without reCAPTCHA
          if (!isTestingMode) {
            setPhoneError("Verification initialization failed. Please try again.");
            throw err;
          } else {
            logger.devLog("Continuing without reCAPTCHA in testing mode");
          }
        }
      }

      logger.devLog("Sending OTP (dev only; number not logged in production)");

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("OTP request timed out. Please try again.")), 15000)
      );

      confirmationResultRef.current = await Promise.race([
        signInWithPhoneNumber(
          auth,
          `+91${phoneNumber}`,
          recaptchaVerifierRef.current
        ),
        timeoutPromise
      ]) as ConfirmationResult;

      logger.devLog("OTP sent successfully");
      setStep("otp");
    } catch (err: any) {
      logger.error("Phone OTP send failed", err);
      setPhoneError(getPhoneAuthErrorMessage(err));
      resetRecaptchaVerifier();
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

      // Seller flows still use BPP-backed auth/bootstrap helpers.
      // Buyer flows should not call seller BPP auth endpoints during startup.
      if (selectedIntent === "sell") {
        const BACKEND_URL = resolveRequiredEnv(import.meta.env.VITE_BACKEND_URL, "http://localhost:3002", "VITE_BACKEND_URL");
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          try {
            await fetch(`${BACKEND_URL}/api/auth/setup`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ phone_number: `+91${phoneNumber}` }),
            });
            logger.devLog("Auth bootstrap complete");
            // Force token refresh to include the newly set phone_number custom claim
            await auth.currentUser?.getIdToken(true);
            logger.devLog("Token refreshed with phone_number claim");
          } catch (err) {
            logger.devDebug("Auth bootstrap failed (non-critical):", err);
          }
        }
      }

      // For new users, save phone number so profile data can be saved to Firestore
      if (!isUserReturning) {
        // Only stage the phone number here.
        // Intent must be decided and persisted only in VerifyPage after we conclusively
        // determine whether this is an existing account or a true new-user signup.
        setUserData({
          phone: `+91${phoneNumber}`,
        });
      }
      // Both new and returning users proceed to VC upload after OTP verification
      onVerified(phoneNumber);
    } catch {
      setOtpError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    }
  };


  const handleResendOtp = async () => {
    resetRecaptchaVerifier();
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    await handlePhoneSubmit();
  };


  const ctaLabel = step === "phone" ? "Send OTP" : null;
  const ctaAction = step === "phone" ? handlePhoneSubmit : undefined;
  const ctaDisabled = phoneNumber.length !== 10 || !!phoneError || isSendingOtp;
  const ctaClassName = "btn-solar";

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
                Phone verification
              </div>
              <h2 className="mt-5 text-3xl font-semibold leading-tight text-foreground">
                Verify your mobile number and get started.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
                This step confirms your phone number for login, account recovery, and notifications on energy trades.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
                <p className="text-sm font-medium text-foreground">What happens here</p>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <p>Verify your mobile number with a one-time OTP.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <p>Set up your profile with your Generation or Consumption Verifiable Credential.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Security</p>
                <p className="mt-2 leading-6">
                  Your phone number is used only for authentication and account notifications. It's always encrypted.
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
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Title */}
        <div className="text-center animate-slide-up mb-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 shadow-sm ring-1 ring-orange-200/70">
            <Shield className="text-primary" size={22} />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight sm:text-xl">Verify your phone number</h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-sm">
            We'll send a one-time password to confirm your mobile number.
          </p>
        </div>

        {/* Steps - 2 steps (phone → otp) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 animate-fade-in mb-4">
          <div className={`w-2 h-2 rounded-full ${step !== "phone" || step === "phone" ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-5 h-0.5 ${["otp"].includes(step) ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-2 h-2 rounded-full ${["otp"].includes(step) ? "bg-primary" : "bg-muted"}`} />
        </div>

        {/* Content area */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-0 lg:pr-1">
          {/* Phone Step */}
          {step === "phone" && (
            <div className="flex flex-col gap-3 animate-slide-up">
              <div className="rounded-2xl border border-orange-200/70 bg-white/92 p-4 shadow-card">
                <label className="block text-sm font-medium text-foreground mb-1.5">Mobile Number</label>
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
            By continuing, you agree to Samai's{" "}
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
      <div id={RECAPTCHA_CONTAINER_ID} />

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
              
              <h4 className="font-medium text-foreground pt-2">2. Account Verification</h4>
              <p>
                Users must verify their phone number and upload their Verifiable Credentials (VC) for Generation or Consumption Profile. This information is used only for regulatory compliance and trade settlement.
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
