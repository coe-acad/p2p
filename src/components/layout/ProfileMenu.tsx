import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import {
  BadgeCheck,
  ChevronRight,
  LogOut,
  Moon,
  Phone,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

// eslint-disable-next-line react-refresh/only-export-components -- tiny shared helper
export const initialsFrom = (name?: string, phone?: string) => {
  const n = (name || "").trim();
  if (n) {
    return n
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  // Fall back to last 2 digits of phone if no name
  const digits = (phone || "").replace(/\D/g, "");
  return digits.slice(-2) || "—";
};

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  hint?: string;
  badge?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  iconTileClass?: string;
  hoverBgClass?: string;
}

const MenuItem = ({
  icon: Icon,
  label,
  hint,
  badge,
  onClick,
  destructive,
  iconTileClass = "bg-accent/10 text-accent",
  hoverBgClass = "hover:bg-accent/[0.08]",
}: MenuItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150
                ${destructive
                  ? "bg-destructive/[0.06] text-destructive hover:bg-destructive/[0.1]"
                  : `text-foreground ${hoverBgClass}`}`}
  >
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                  ${destructive ? "bg-destructive/10 text-destructive" : iconTileClass}`}
    >
      <Icon className="h-4 w-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium leading-tight">{label}</span>
      {hint && <span className="block text-xs leading-tight text-muted-foreground">{hint}</span>}
    </span>
    {badge ?? (
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
    )}
  </button>
);

const Divider = () => <div className="my-1 h-px w-full bg-border/60" />;

export const ProfileMenu = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { userData, displayName } = useUserData();
  const { resolvedTheme } = useTheme();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isDark = resolvedTheme === "dark";

  const isBuyer = userData?.intent === "buy";
  const phone = userData?.phone as string | undefined;
  const isVCVerified = Boolean(userData?.is_vc_verified);

  const initials = initialsFrom(displayName || userData?.name, phone);

  // Persona-by-color: buyer = green identity, seller = blue identity.
  // Full strings spelled out so Tailwind's JIT picks them up.
  const tone = isBuyer
    ? {
        triggerBorder: "border-accent/20",
        triggerBg: "bg-accent/[0.06]",
        triggerText: "text-accent",
        triggerHoverBorder: "hover:border-accent/45",
        triggerHoverBg: "hover:bg-accent/[0.12]",
        bandBg: "bg-accent/12",
        bandHoverBg: "hover:bg-accent/[0.18]",
        avatarBg: "bg-accent text-accent-foreground",
        avatarShadow: "shadow-[0_8px_18px_-8px_rgba(31,138,82,0.50)]",
        chevHover: "group-hover:text-accent",
        rolePill: "bg-accent/10 text-accent",
        iconTile: "bg-accent/10 text-accent",
        rowHover: "hover:bg-accent/[0.08]",
      }
    : {
        triggerBorder: "border-primary/20",
        triggerBg: "bg-primary/[0.06]",
        triggerText: "text-primary",
        triggerHoverBorder: "hover:border-primary/45",
        triggerHoverBg: "hover:bg-primary/[0.12]",
        bandBg: "bg-primary/12",
        bandHoverBg: "hover:bg-primary/[0.18]",
        avatarBg: "bg-primary text-primary-foreground",
        avatarShadow: "shadow-[0_8px_18px_-8px_rgba(36,40,128,0.50)]",
        chevHover: "group-hover:text-primary",
        rolePill: "bg-primary/10 text-primary",
        iconTile: "bg-primary/10 text-primary",
        rowHover: "hover:bg-primary/[0.08]",
      };

  // Profile band opens the full Profile page (identity, account links, log out).
  const profileRoute = "/profile";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className={`group flex h-10 w-10 items-center justify-center rounded-full
                      border ${tone.triggerBorder} ${tone.triggerBg} text-sm font-semibold ${tone.triggerText}
                      transition-all duration-200
                      ${tone.triggerHoverBorder} ${tone.triggerHoverBg} hover:scale-[1.03]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
        >
          <span className="nums">{initials}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-[0_18px_40px_-18px_rgba(36,40,128,0.30)]"
      >
        {/* Header — entire band is clickable; routes to VC/profile.
            Soft green tint mirrors the listing card stripe pattern.
            The verified status pill on the right doubles as a VC-status signal. */}
        <button
          type="button"
          onClick={() => navigate(profileRoute)}
          className={`group block w-full ${tone.bandBg} px-4 py-4 text-left transition-colors duration-200 ${tone.bandHoverBg}`}
        >
          <div className="flex items-center gap-3">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone.avatarBg} text-lg font-semibold ${tone.avatarShadow} ring-4 ring-card/70 transition-transform duration-200 group-hover:scale-[1.03]`}>
              <span className="nums">{initials}</span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-base font-semibold tracking-tight text-foreground">
                  {displayName || userData?.name || "Welcome"}
                </p>
              </div>
              {phone && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground nums">
                  <Phone className="h-3 w-3" />
                  {phone}
                </p>
              )}
              <p className="mt-1.5 flex items-center gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${tone.rolePill}`}>
                  {isBuyer ? "Buyer" : "Seller"}
                </span>
                {isVCVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                    <BadgeCheck className="h-3 w-3" /> Meter verified
                  </span>
                )}
                {!isVCVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-destructive">
                    Verify
                  </span>
                )}
              </p>
            </div>
            <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 ${tone.chevHover}`} />
          </div>
        </button>

        {/* Items */}
        <div className="p-1.5">
          {/* Theme toggle — futuristic pill switch, no full-row click target so
              the toggle owns the interaction. */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.iconTile}`}>
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight text-foreground">Appearance</p>
              <p className="text-xs leading-tight text-muted-foreground">
                {isDark ? "Dark theme" : "Light theme"}
              </p>
            </div>
            <ThemeToggle />
          </div>

          <Divider />

          <MenuItem
            icon={LogOut}
            label="Log out"
            onClick={() => setConfirmingLogout(true)}
            destructive
          />
        </div>
      </DropdownMenuContent>

      {/* Confirm popup — sits outside DropdownMenuContent so it survives the
          dropdown closing when AlertDialog opens. */}
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
    </DropdownMenu>
  );
};
