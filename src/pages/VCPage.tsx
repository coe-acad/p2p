import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainAppShell from "@/components/layout/MainAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";
import { saveUser } from "@/services/userService";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  Copy,
  FileText,
  Fingerprint,
  Loader2,
  RotateCw,
} from "lucide-react";

/** Drops values that look like backend format errors (e.g. "%!f(string=u)"). */
const clean = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  if (s.startsWith("%!")) return undefined; // Go fmt error sentinel
  return s;
};

const formatDate = (iso?: string) => {
  if (!iso) return undefined;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return undefined;
  }
};

/** Detail row used inside the credential cards. Right value is selectable. */
const Field = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 px-5 py-3.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="break-words text-sm font-medium text-foreground select-text">{value}</p>
    </div>
  );
};

const VCPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  const { toast } = useToast();

  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [copied, setCopied] = useState(false);

  const isVerified = Boolean((userData as any)?.is_vc_verified);
  const isBuyer = (userData as any)?.intent === "buy";
  const vcRoot = ((userData as any)?.vc_data || {}) as Record<string, any>;
  const cred = (isBuyer ? vcRoot.consumption : vcRoot.generation) || {};

  // Persona-by-color rule: buyer = green-dominant, seller = blue-dominant.
  // The subject card takes the persona color; the metadata card takes the secondary.
  // Strings are written out in full so Tailwind's JIT scanner picks them up.
  const tone = isBuyer
    ? {
        heroBg: "bg-accent",
        heroShadow: "shadow-[0_10px_24px_-10px_rgba(31,138,82,0.55)]",
        kicker: "text-accent",
        subjectBorder: "border-accent/25",
        subjectShadow: "shadow-[0_8px_24px_-14px_rgba(31,138,82,0.22)]",
        subjectHeaderBorder: "border-accent/15",
        subjectHeaderBg: "bg-accent/[0.06]",
        subjectIconBg: "bg-accent/15",
        subjectIconText: "text-accent",
        metaBorder: "border-primary/15",
        metaShadow: "shadow-[0_8px_24px_-14px_rgba(36,40,128,0.20)]",
        metaHeaderBorder: "border-primary/12",
        metaHeaderBg: "bg-primary/[0.05]",
        metaIconBg: "bg-primary/15",
        metaIconText: "text-primary",
      }
    : {
        heroBg: "bg-primary",
        heroShadow: "shadow-[0_10px_24px_-10px_rgba(36,40,128,0.55)]",
        kicker: "text-primary",
        subjectBorder: "border-primary/25",
        subjectShadow: "shadow-[0_8px_24px_-14px_rgba(36,40,128,0.22)]",
        subjectHeaderBorder: "border-primary/15",
        subjectHeaderBg: "bg-primary/[0.06]",
        subjectIconBg: "bg-primary/15",
        subjectIconText: "text-primary",
        metaBorder: "border-accent/15",
        metaShadow: "shadow-[0_8px_24px_-14px_rgba(31,138,82,0.20)]",
        metaHeaderBorder: "border-accent/12",
        metaHeaderBg: "bg-accent/[0.05]",
        metaIconBg: "bg-accent/15",
        metaIconText: "text-accent",
      };

  useEffect(() => {
    if (!isVerified) navigate("/onboarding/vc", { replace: true });
  }, [isVerified, navigate]);

  if (!isVerified) return null;

  const credentialType = isBuyer ? "Consumption Profile" : "Generation Profile";
  const credentialSubtitle = isBuyer ? "Electricity meter credentials" : "Solar generation credentials";

  // Subject fields (try several casing variants)
  const subjectFields: Array<{ label: string; value?: string }> = isBuyer
    ? [
        { label: "Consumer Number",       value: clean(cred.consumerNumber || cred.consumer_number) },
        { label: "Full Name",             value: clean(cred.fullName || cred.full_name) },
        { label: "Meter Number",          value: clean(cred.meterNumber || cred.meter_number) },
        { label: "Premises Type",         value: clean(cred.premisesType || cred.premises_type) },
        { label: "Tariff Category Code",  value: clean(cred.tariffCategoryCode || cred.tariff_category_code) },
        { label: "Sanctioned Load (kW)",  value: clean(cred.sanctionedLoad || cred.sanctioned_load) },
        { label: "Connection Type",       value: clean(cred.connectionType || cred.connection_type) },
        { label: "Issuer Name",           value: clean(cred.issuerName || cred.issuer_name || cred.issuer) },
      ]
    : [
        { label: "Asset ID",              value: clean(cred.assetId || cred.asset_id) },
        { label: "Full Name",             value: clean(cred.fullName || cred.full_name) },
        { label: "Capacity (kW)",         value: clean(cred.capacity || cred.capacity_kw) },
        { label: "Generation Type",       value: clean(cred.generationType || cred.generation_type) },
        { label: "Commissioning Date",    value: formatDate(clean(cred.commissioningDate || cred.commissioning_date)) },
        { label: "Manufacturer",          value: clean(cred.manufacturer) },
        { label: "Model Number",          value: clean(cred.modelNumber || cred.model_number) },
        { label: "Meter Number",          value: clean(cred.meterNumber || cred.meter_number) },
        { label: "Consumer Number",       value: clean(cred.consumerNumber || cred.consumer_number) },
        { label: "Issuer Name",           value: clean(cred.issuerName || cred.issuer_name || cred.issuer) },
      ];

  // Credential envelope metadata
  const vcId = clean(cred.id || cred.vcId || cred.credentialId || vcRoot.id);
  const issuedOn = formatDate(clean(cred.issuanceDate || cred.issued_at));
  const expiresOn = formatDate(clean(cred.expirationDate || cred.expires_at));

  const handleCopyId = async () => {
    if (!vcId) return;
    try {
      await navigator.clipboard.writeText(vcId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  };

  const handleClearAndReupload = async () => {
    setClearing(true);
    try {
      setUserData({
        ...userData,
        is_vc_verified: false,
        vc_data: undefined,
        onboardingComplete: false,
      } as any);

      if ((userData as any)?.phone) {
        await saveUser({
          phone: (userData as any).phone,
          is_vc_verified: false,
          vc_data: null,
          onboardingComplete: false,
        } as any).catch((err) => console.error("Failed to clear VC on server:", err));
      }

      localStorage.removeItem("samai_onboarding_vc_done");
      localStorage.removeItem("samai_onboarding_complete");

      toast({
        title: "Credential cleared",
        description: "Upload a new credential to continue trading.",
      });
      navigate("/onboarding/vc", { replace: true });
    } catch (err) {
      toast({
        title: "Couldn't clear credential",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <MainAppShell>
      <PageContainer gap={4}>
        {/* Hero — verified identity badge */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className={`relative flex h-16 w-16 items-center justify-center rounded-full ${tone.heroBg} text-white ${tone.heroShadow}`}>
            <BadgeCheck className="h-8 w-8" strokeWidth={2.5} />
          </span>
          <div>
            <p className={`text-xs font-medium uppercase tracking-[0.18em] ${tone.kicker}`}>
              Verified · VC Documents
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {credentialType}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{credentialSubtitle}</p>
          </div>
        </div>

        {/* Subject card — distinct identity-document styling (cream paper feel
            with serif-influenced spacing, no green stripe to set it apart
            from listing cards). */}
        <section className={`overflow-hidden rounded-2xl border ${tone.subjectBorder} bg-card ${tone.subjectShadow}`}>
          <header className={`flex items-center justify-between border-b ${tone.subjectHeaderBorder} ${tone.subjectHeaderBg} px-5 py-3`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tone.subjectIconBg} ${tone.subjectIconText}`}>
                <FileText className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-semibold text-foreground">{credentialType}</p>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {credentialSubtitle}
            </span>
          </header>
          <div className="divide-y divide-border/40">
            {subjectFields.map((f) => (
              <Field key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </section>

        {/* Credential metadata card */}
        <section className={`overflow-hidden rounded-2xl border ${tone.metaBorder} bg-card ${tone.metaShadow}`}>
          <header className={`flex items-center gap-2 border-b ${tone.metaHeaderBorder} ${tone.metaHeaderBg} px-5 py-3`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tone.metaIconBg} ${tone.metaIconText}`}>
              <Fingerprint className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-semibold text-foreground">Credential Information</p>
          </header>
          <div className="divide-y divide-border/40">
            {vcId && (
              <div className="flex items-start gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    VC ID
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-foreground select-text nums">
                    {vcId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  aria-label="Copy VC ID"
                  className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
            <Field label="Issuance Date" value={issuedOn} />
            <Field label="Expiration Date" value={expiresOn} />
          </div>
        </section>

        {/* Single combined Clear & Re-upload action */}
        {!confirmingClear ? (
          <Button
            onClick={() => setConfirmingClear(true)}
            variant="outline"
            className="h-auto w-full justify-start gap-3 whitespace-normal border-destructive/30 px-4 py-3 hover:border-destructive/50 hover:bg-destructive/[0.04]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <RotateCw className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-medium leading-snug text-destructive">
                Clear &amp; Re-upload {isBuyer ? "Consumption" : "Generation"} VC
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                Removes the current credential and opens the upload screen
              </span>
            </span>
          </Button>
        ) : (
          <div className="rounded-xl border border-destructive/30 bg-destructive/[0.06] p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium text-destructive">Clear and re-upload?</p>
                <p className="mt-1 text-muted-foreground">
                  Trading will be disabled until you upload a new credential.
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingClear(false)}
                disabled={clearing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleClearAndReupload}
                disabled={clearing}
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Clear & continue"}
              </Button>
            </div>
          </div>
        )}
      </PageContainer>
    </MainAppShell>
  );
};

export default VCPage;
