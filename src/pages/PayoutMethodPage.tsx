import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Landmark,
  Loader2,
  Lock,
  Smartphone,
  Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPayoutDetails,
  savePayoutDetails,
  type PayoutAccount,
} from "@/services/settlementService";

type Mode = "bank" | "upi";
type FieldKey = "holderName" | "ifsc" | "accountNumber" | "confirmAccountNumber" | "vpa";
type FieldErrors = Partial<Record<FieldKey, string>>;

// Client-side mirrors of the backend validation rules — keep in sync.
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^\d{6,18}$/;
const VPA_REGEX = /^[a-z0-9][a-z0-9._-]*@[a-z0-9]+$/;

const stripSpaces = (value: string): string => value.replace(/\s+/g, "");

const validateHolderName = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 120) {
    return "Enter the account holder's name (3–120 characters).";
  }
  return null;
};

const validateIfsc = (value: string): string | null =>
  IFSC_REGEX.test(value) ? null : "Enter a valid 11-character IFSC, like HDFC0001234.";

const validateAccountNumber = (value: string): string | null =>
  ACCOUNT_NUMBER_REGEX.test(stripSpaces(value)) ? null : "Enter an account number of 6–18 digits.";

const validateConfirmAccountNumber = (value: string, original: string): string | null =>
  stripSpaces(value) === stripSpaces(original) && stripSpaces(value).length > 0
    ? null
    : "Account numbers don't match.";

const validateVpa = (value: string): string | null =>
  VPA_REGEX.test(value) ? null : "Enter a valid UPI ID, like name@bank.";

const messageFromError = (err: unknown): string => {
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "Something went wrong. Please try again.";
};

const PayoutSkeleton = () => (
  <div className="space-y-2">
    <div className="h-2.5 w-32 rounded bg-muted animate-pulse" />
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-muted animate-pulse" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-40 rounded bg-muted animate-pulse" />
        <div className="h-2.5 w-28 rounded bg-muted/60 animate-pulse" />
      </div>
      <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
    </div>
  </div>
);

interface CurrentMethodCardProps {
  account: PayoutAccount;
  justSaved: boolean;
}

const CurrentMethodCard = ({ account, justSaved }: CurrentMethodCardProps) => {
  const ModeIcon = account.mode === "bank" ? Landmark : Smartphone;
  const isActive = account.status.toLowerCase() === "active";

  return (
    <div className="space-y-2">
      <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Current method
      </p>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <ModeIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground nums">
              {account.masked_target}
            </p>
            {account.account_holder_name && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {account.account_holder_name}
              </p>
            )}
          </div>
          {isActive ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
              <CheckCircle className="h-2.5 w-2.5" />
              Active
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {account.status}
            </span>
          )}
        </div>
        {justSaved && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-accent">
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            Payout method saved. Settlements will be sent here.
          </p>
        )}
      </div>
    </div>
  );
};

/** Only allow in-app return targets — never external URLs. */
const sanitizeNextPath = (raw: string | null): string | null =>
  raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;

const PayoutMethodPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [mode, setMode] = useState<Mode>("bank");
  const [holderName, setHolderName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [vpa, setVpa] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const loadPayoutDetails = async () => {
      try {
        const data = await getPayoutDetails();
        setAccount(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load payout details:", err);
        setError(messageFromError(err));
      } finally {
        setLoading(false);
      }
    };
    loadPayoutDetails();
  }, []);

  const clearFieldError = (field: FieldKey) => {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setFieldError = (field: FieldKey, message: string | null) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const validateVisibleFields = (): FieldErrors => {
    const errors: FieldErrors = {};
    const holderError = validateHolderName(holderName);
    if (holderError) errors.holderName = holderError;
    if (mode === "bank") {
      const ifscError = validateIfsc(ifsc);
      if (ifscError) errors.ifsc = ifscError;
      const accountError = validateAccountNumber(accountNumber);
      if (accountError) errors.accountNumber = accountError;
      const confirmError = validateConfirmAccountNumber(confirmAccountNumber, accountNumber);
      if (confirmError) errors.confirmAccountNumber = confirmError;
    } else {
      const vpaError = validateVpa(vpa);
      if (vpaError) errors.vpa = vpaError;
    }
    return errors;
  };

  const formValid =
    !validateHolderName(holderName) &&
    (mode === "bank"
      ? !validateIfsc(ifsc) &&
        !validateAccountNumber(accountNumber) &&
        !validateConfirmAccountNumber(confirmAccountNumber, accountNumber)
      : !validateVpa(vpa));

  const resetForm = () => {
    setMode("bank");
    setHolderName("");
    setIfsc("");
    setAccountNumber("");
    setConfirmAccountNumber("");
    setVpa("");
    setFieldErrors({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateVisibleFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const saved = await savePayoutDetails(
        mode === "bank"
          ? {
              mode,
              account_holder_name: holderName.trim(),
              ifsc,
              account_number: stripSpaces(accountNumber),
            }
          : {
              mode,
              account_holder_name: holderName.trim(),
              vpa,
            }
      );
      setAccount(saved);
      setJustSaved(true);
      resetForm();
    } catch (err) {
      console.error("Failed to save payout details:", messageFromError(err));
      setError(messageFromError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeChange = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setFieldErrors((prev) => ({
      ...(prev.holderName ? { holderName: prev.holderName } : {}),
    }));
  };

  // The form only exists for first-time setup. Once an account is on file it
  // is locked — changes go through support, never self-serve.
  const formVisible = !loading && account === null;

  const modeCardClass = (selected: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium
     transition-colors duration-200 ease-out
     ${
       selected
         ? "border-primary bg-primary/5 text-primary"
         : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
     }`;

  return (
    <MainAppShell>
      <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
        <PageContainer gap={5}>
          {/* Heading — blue icon tile for seller persona */}
          <div className="flex items-center gap-3 fade-in opacity-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Payout method
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Where should we send your money?
              </p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Something went wrong</p>
                <p className="mt-1 break-words text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <PayoutSkeleton />
          ) : (
            <>
              {account && <CurrentMethodCard account={account} justSaved={justSaved} />}

              {/* Return to the flow that sent us here (e.g. catalog publish) */}
              {account && nextPath && (
                <Button type="button" className="w-full" onClick={() => navigate(nextPath)}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {/* Locked: no self-serve changes once a method is on file. */}
              {account && (
                <p className="flex items-start gap-1.5 px-1 text-xs text-muted-foreground">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                  Your payout method is locked for security. To change it, contact support.
                </p>
              )}

              {formVisible && (
                <div className="space-y-2">
                  <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Add payout method
                  </p>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="mb-4 text-sm text-muted-foreground">
                      {nextPath
                        ? "Add a bank account or UPI ID to publish your catalog — this is where your settlement payouts go."
                        : "Add a bank account or UPI ID to receive settlement payouts for your energy sales."}
                    </p>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                      {/* Mode toggle */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-pressed={mode === "bank"}
                          className={modeCardClass(mode === "bank")}
                          onClick={() => handleModeChange("bank")}
                        >
                          <Landmark className="h-4 w-4" />
                          Bank account
                        </button>
                        <button
                          type="button"
                          aria-pressed={mode === "upi"}
                          className={modeCardClass(mode === "upi")}
                          onClick={() => handleModeChange("upi")}
                        >
                          <Smartphone className="h-4 w-4" />
                          UPI
                        </button>
                      </div>

                      {/* Account holder name */}
                      <div>
                        <Label htmlFor="payout-holder-name" className="text-xs text-muted-foreground">
                          Account holder name
                        </Label>
                        <Input
                          id="payout-holder-name"
                          className="mt-1"
                          value={holderName}
                          autoComplete="name"
                          maxLength={120}
                          placeholder="As it appears on the account"
                          onChange={(e) => {
                            setHolderName(e.target.value);
                            clearFieldError("holderName");
                          }}
                          onBlur={() => setFieldError("holderName", validateHolderName(holderName))}
                        />
                        {fieldErrors.holderName && (
                          <p className="text-destructive text-xs mt-1">{fieldErrors.holderName}</p>
                        )}
                      </div>

                      {mode === "bank" ? (
                        <>
                          {/* IFSC */}
                          <div>
                            <Label htmlFor="payout-ifsc" className="text-xs text-muted-foreground">
                              IFSC
                            </Label>
                            <Input
                              id="payout-ifsc"
                              className="mt-1 nums"
                              value={ifsc}
                              maxLength={11}
                              autoComplete="off"
                              placeholder="HDFC0001234"
                              onChange={(e) => {
                                setIfsc(e.target.value.toUpperCase());
                                clearFieldError("ifsc");
                              }}
                              onBlur={() => setFieldError("ifsc", validateIfsc(ifsc))}
                            />
                            {fieldErrors.ifsc && (
                              <p className="text-destructive text-xs mt-1">{fieldErrors.ifsc}</p>
                            )}
                          </div>

                          {/* Account number */}
                          <div>
                            <Label htmlFor="payout-account-number" className="text-xs text-muted-foreground">
                              Account number
                            </Label>
                            <Input
                              id="payout-account-number"
                              className="mt-1 nums"
                              value={accountNumber}
                              inputMode="numeric"
                              maxLength={18}
                              autoComplete="off"
                              placeholder="6–18 digits"
                              onChange={(e) => {
                                setAccountNumber(stripSpaces(e.target.value));
                                clearFieldError("accountNumber");
                              }}
                              onBlur={() =>
                                setFieldError("accountNumber", validateAccountNumber(accountNumber))
                              }
                            />
                            {fieldErrors.accountNumber && (
                              <p className="text-destructive text-xs mt-1">
                                {fieldErrors.accountNumber}
                              </p>
                            )}
                          </div>

                          {/* Confirm account number */}
                          <div>
                            <Label
                              htmlFor="payout-confirm-account-number"
                              className="text-xs text-muted-foreground"
                            >
                              Confirm account number
                            </Label>
                            <Input
                              id="payout-confirm-account-number"
                              className="mt-1 nums"
                              value={confirmAccountNumber}
                              inputMode="numeric"
                              maxLength={18}
                              autoComplete="off"
                              placeholder="Re-enter account number"
                              onChange={(e) => {
                                setConfirmAccountNumber(stripSpaces(e.target.value));
                                clearFieldError("confirmAccountNumber");
                              }}
                              onBlur={() =>
                                setFieldError(
                                  "confirmAccountNumber",
                                  validateConfirmAccountNumber(confirmAccountNumber, accountNumber)
                                )
                              }
                            />
                            {fieldErrors.confirmAccountNumber && (
                              <p className="text-destructive text-xs mt-1">
                                {fieldErrors.confirmAccountNumber}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        /* VPA */
                        <div>
                          <Label htmlFor="payout-vpa" className="text-xs text-muted-foreground">
                            UPI ID
                          </Label>
                          <Input
                            id="payout-vpa"
                            className="mt-1 nums"
                            value={vpa}
                            autoComplete="off"
                            placeholder="name@bank"
                            onChange={(e) => {
                              setVpa(e.target.value.toLowerCase());
                              clearFieldError("vpa");
                            }}
                            onBlur={() => setFieldError("vpa", validateVpa(vpa))}
                          />
                          {fieldErrors.vpa && (
                            <p className="text-destructive text-xs mt-1">{fieldErrors.vpa}</p>
                          )}
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={!formValid || submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          "Save payout method"
                        )}
                      </Button>

                      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                        Double-check the details — your payout method is locked once saved and
                        can only be changed through support. We share these details only with
                        our payment partner (RazorpayX) and store a masked copy.
                      </p>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default PayoutMethodPage;
