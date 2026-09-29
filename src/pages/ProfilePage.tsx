import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  BadgeCheck,
  ChevronRight,
  FileText,
  Landmark,
  LogOut,
  Moon,
  Phone,
  ReceiptText,
  ShieldCheck,
  Sun,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MainAppShell from "@/components/layout/MainAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { initialsFrom } from "@/components/layout/ProfileMenu";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";

/**
 * Profile — identity card, account links and log out.
 * Pure presentation over existing data and routes (same destinations as the
 * header ProfileMenu); nothing here computes or stores anything new.
 */

interface RowProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  tile: string;
}

const Row = ({ icon: Icon, title, hint, onClick, trailing, tile }: RowProps) => {
  const body = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${tile}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-tight text-foreground">{title}</span>
        {hint && <span className="mt-0.5 block text-xs leading-tight text-muted-foreground">{hint}</span>}
      </span>
      {trailing ?? (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </>
  );
  const cls = "group flex w-full items-center gap-3 px-4 py-3.5 text-left";
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} transition-colors hover:bg-muted/60`}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();
  const { userData, displayName } = useUserData();
  const { resolvedTheme } = useTheme();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!isLoading && !user) return <Navigate to="/" replace />;

  const isDark = resolvedTheme === "dark";
  const isBuyer = userData?.intent === "buy";
  const phone = userData?.phone as string | undefined;
  const isVCVerified = Boolean(userData?.is_vc_verified);
  const initials = initialsFrom(displayName || userData?.name, phone);
  const tile = isBuyer ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
      setConfirmingLogout(false);
    }
  };

  return (
    <MainAppShell>
      <div className="circuit-bg min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
        <PageContainer gap={2}>
          {/* Identity */}
          <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_6px_18px_-12px_rgba(20,24,100,0.25)] fade-in opacity-0">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,hsl(var(--primary)/0.14),hsl(var(--accent)/0.14))] text-xl font-bold text-primary nums">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
                {displayName || userData?.name || "Welcome"}
              </h1>
              {phone && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground nums">
                  <Phone className="h-3 w-3" /> {phone}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${tile}`}>
                  {isBuyer ? "Buyer" : "Seller"}
                </span>
                {isVCVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    <BadgeCheck className="h-3.5 w-3.5" /> Meter verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/vc")}
                    className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-destructive"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Account */}
          <p className="kicker-zap mt-3 px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Account
          </p>
          <section className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <Row
              icon={ReceiptText}
              title={isBuyer ? "Purchase history" : "Trade history"}
              hint={isBuyer ? "Past purchases and orders" : "Past trades and orders"}
              onClick={() => navigate(isBuyer ? "/buyer-order-history" : "/order-history")}
              tile={tile}
            />
            {!isBuyer && (
              <>
                <Row icon={Wallet} title="Earnings" hint="Settlement payouts for completed trades" onClick={() => navigate("/earnings")} tile={tile} />
                <Row icon={Landmark} title="Payout method" hint="Where we send your money" onClick={() => navigate("/payout-method")} tile={tile} />
              </>
            )}
            <Row
              icon={FileText}
              title="Verifiable credential"
              hint={isVCVerified ? "Verified" : "Not uploaded yet"}
              onClick={() => navigate("/vc")}
              tile={tile}
            />
          </section>

          {/* Preferences */}
          <p className="kicker-zap mt-3 px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Preferences
          </p>
          <section className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <Row
              icon={isDark ? Moon : Sun}
              title="Appearance"
              hint={isDark ? "Dark theme" : "Light theme"}
              trailing={<ThemeToggle />}
              tile={tile}
            />
            <Row icon={ShieldCheck} title="Terms of service" onClick={() => navigate("/terms")} tile={tile} />
            <Row icon={ShieldCheck} title="Privacy policy" onClick={() => navigate("/privacy")} tile={tile} />
            <Row icon={ShieldCheck} title="Pricing policy" onClick={() => navigate("/pricing")} tile={tile} />
          </section>

          <button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/15 bg-destructive/[0.06] text-sm font-semibold text-destructive transition-colors hover:bg-destructive/[0.1]"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </PageContainer>
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        onOpenChange={(open) => !loggingOut && setConfirmingLogout(open)}
        title="Are you sure you want to log out?"
        description="You'll need your phone number to sign back in."
        proceedLabel="Log out"
        destructive
        loading={loggingOut}
        onProceed={handleLogout}
      />
    </MainAppShell>
  );
};

export default ProfilePage;
