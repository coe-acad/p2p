import { useState, useEffect, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import SamaiLogo from "@/components/SamaiLogo";
import { resolveRequiredEnv } from "@/services/apiClient";
import { logger } from "@/lib/logger";

interface VerificationScreenProps {
  onVerified: (phone?: string) => void;
}

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";
const RESEND_COOLDOWN_SECONDS = 45;

const isValidIndianMobile = (phone: string): boolean => /^[6-9]\d{9}$/.test(phone);

const VerificationScreen = ({ onVerified }: VerificationScreenProps) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  const resetRecaptchaVerifier = () => {
    try {
      recaptchaVerifierRef.current?.clear();
    } catch {
      // clear() can throw if the widget never finished rendering; ignore and
      // still reset the DOM so the next attempt starts from a clean slate.
    }
    recaptchaVerifierRef.current = null;

    // grecaptcha tracks "already rendered" by element reference, not by
    // contents — so innerHTML = "" isn't enough. After a failed OTP + Edit,
    // the next render() would throw "reCAPTCHA has already been rendered in
    // this element". Swap the node for a fresh one with the same id.
    const old = document.getElementById(RECAPTCHA_CONTAINER_ID);
    if (old?.parentNode) {
      const fresh = document.createElement("div");
      fresh.id = RECAPTCHA_CONTAINER_ID;
      old.parentNode.replaceChild(fresh, old);
    }
  };

  useEffect(() => () => resetRecaptchaVerifier(), []);

  // Resend countdown — ticks once per second while > 0.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const getPhoneAuthErrorMessage = (error: unknown) => {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    const message =
      typeof error === "object" && error && "message" in error ? String((error as { message?: string }).message) : "";
    if (code === "auth/captcha-check-failed" || message.includes("auth/captcha-check-failed")) {
      return "Verification failed. Please refresh and try again.";
    }
    return message || "Failed to send code. Please try again.";
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(digitsOnly);
    if (phoneError) setPhoneError("");
  };

  const sendOtp = async () => {
    if (!isValidIndianMobile(phoneNumber)) {
      setPhoneError("Indian mobile numbers start with 6, 7, 8, or 9.");
      return;
    }
    setIsSendingOtp(true);
    setPhoneError("");

    try {
      const isTestingMode = import.meta.env.VITE_DISABLE_PHONE_APP_VERIFICATION_FOR_TESTING === "true";

      if (!recaptchaVerifierRef.current) {
        try {
          resetRecaptchaVerifier();
          const container = document.getElementById(RECAPTCHA_CONTAINER_ID);
          if (!container) throw new Error("reCAPTCHA container not found in DOM");
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, { size: "invisible" });
          await recaptchaVerifierRef.current.render();
        } catch (err: any) {
          logger.error("Recaptcha initialization failed", err);
          if (!isTestingMode) {
            setPhoneError("Verification initialization failed. Please try again.");
            throw err;
          }
        }
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), 15000),
      );

      confirmationResultRef.current = (await Promise.race([
        signInWithPhoneNumber(auth, `+91${phoneNumber}`, recaptchaVerifierRef.current!),
        timeoutPromise,
      ])) as ConfirmationResult;

      logger.devLog("OTP sent");
      setStep("otp");
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      logger.error("Phone OTP send failed", err);
      setPhoneError(getPhoneAuthErrorMessage(err));
      resetRecaptchaVerifier();
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async (enteredOtp: string) => {
    if (!confirmationResultRef.current || isVerifying) return;
    setIsVerifying(true);
    setOtpError("");

    try {
      await confirmationResultRef.current.confirm(enteredOtp);

      // Set the phone_number custom claim on Firebase so backend can authorize.
      const BACKEND_URL = resolveRequiredEnv(
        import.meta.env.VITE_BACKEND_URL,
        "http://localhost:3002",
        "VITE_BACKEND_URL",
      );
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        try {
          await fetch(`${BACKEND_URL}/api/auth/setup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ phone_number: `+91${phoneNumber}` }),
          });
          await auth.currentUser?.getIdToken(true); // force refresh to pick up claim
        } catch (err) {
          logger.devDebug("Auth bootstrap failed (non-critical):", err);
        }
      }

      onVerified(phoneNumber);
    } catch {
      setOtpError("That code didn't work. Please try again.");
      setOtp("");
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (otpError) setOtpError("");
    if (value.length === 6) verifyOtp(value);
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setOtp("");
    setOtpError("");
    resetRecaptchaVerifier();
    await sendOtp();
  };

  const handlePhoneFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length === 10 && !isSendingOtp) sendOtp();
  };

  const handleEditNumber = () => {
    setStep("phone");
    setOtp("");
    setOtpError("");
    confirmationResultRef.current = null;
    resetRecaptchaVerifier();
  };

  return (
    <div className="min-h-screen min-h-svh min-h-dvh flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          {step === "phone" && (
            <form onSubmit={handlePhoneFormSubmit} className="flex flex-col gap-6 slide-up">
              <div className="flex justify-center">
                <SamaiLogo size="md" showText={true} />
              </div>

              <div className="text-center">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                  Peer-to-peer solar trading
                </p>
                <h1 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
                  Start trading energy in a flow designed for mobile.
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your solar. Your choice.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Mobile number
                </Label>
                <div
                  className={`flex h-10 items-stretch rounded-md border bg-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-shadow ${
                    phoneError ? "border-destructive" : "border-input"
                  }`}
                >
                  <span className="flex items-center gap-1.5 border-r border-input px-3 text-sm text-muted-foreground select-none">
                    <span aria-hidden>🇮🇳</span>
                    <span className="nums">+91</span>
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel-national"
                    autoFocus
                    enterKeyHint="go"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="flex-1 min-w-0 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none nums"
                  />
                </div>
                {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
              </div>

              <Button
                type="submit"
                disabled={phoneNumber.length !== 10 || isSendingOtp}
                className="w-full"
                size="lg"
              >
                {isSendingOtp ? <Loader2 className="animate-spin" /> : "Continue"}
              </Button>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                By continuing you agree to CharzPe's{" "}
                <a href="#" className="text-foreground underline-offset-4 hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-foreground underline-offset-4 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          )}

          {step === "otp" && (
            <div className="flex flex-col gap-6 slide-up">
              <div className="flex justify-center">
                <SamaiLogo size="md" showText={true} />
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Enter verification code</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a 6-digit code to <span className="nums text-foreground">+91 {phoneNumber}</span>.{" "}
                  <button
                    type="button"
                    onClick={handleEditNumber}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    Edit
                  </button>
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={isVerifying}
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  containerClassName="gap-1.5 sm:gap-2"
                >
                  <InputOTPGroup className="gap-1.5 sm:gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className={`h-12 w-10 rounded-md border bg-card text-base font-medium first:rounded-md last:rounded-md sm:w-11 ${
                          otpError ? "border-destructive" : ""
                        }`}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                {isVerifying && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Verifying
                  </div>
                )}
                {otpError && !isVerifying && <p className="text-xs text-destructive">{otpError}</p>}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {resendIn > 0 ? (
                  <>
                    Didn't get it? Resend in <span className="nums text-foreground">0:{String(resendIn).padStart(2, "0")}</span>
                  </>
                ) : (
                  <>
                    Didn't get it?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-foreground font-medium underline-offset-4 hover:underline"
                    >
                      Resend code
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Invisible reCAPTCHA container required by Firebase Phone Auth */}
      <div id={RECAPTCHA_CONTAINER_ID} />
    </div>
  );
};

export default VerificationScreen;
