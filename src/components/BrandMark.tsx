import { Zap } from "lucide-react";

type Size = "sm" | "lg";

const sizeClasses: Record<Size, { wrap: string; icon: string }> = {
  sm: { wrap: "text-sm sm:text-base gap-1.5", icon: "h-4 w-4" },
  lg: { wrap: "text-4xl sm:text-5xl gap-3", icon: "h-10 w-10 sm:h-12 sm:w-12" },
};

/**
 * The Samai wordmark — Atria-blue text with an accent-green Zap glyph.
 * Samai is the product brand; the AU blue+green palette is the visual scheme.
 *
 * Use `size="lg"` for hero/centered placements (auth, onboarding entry).
 * Use `size="sm"` for compact header/nav placements inside the app.
 */
const BrandMark = ({ size = "sm", className = "" }: { size?: Size; className?: string }) => {
  const s = sizeClasses[size];
  return (
    <span className={`inline-flex items-center font-semibold tracking-tight ${s.wrap} ${className}`}>
      {/* Zap glyph wrapped in a relative span so the electric-pulse aura
          breathes around it on the auth screens (matches the header brand). */}
      <span className={`relative inline-flex items-center justify-center ${s.icon}`}>
        <span aria-hidden className="electric-pulse absolute inset-0" />
        <Zap className={`relative ${s.icon} fill-accent text-accent`} strokeWidth={0} />
      </span>
      <span className="text-primary">Samai</span>
    </span>
  );
};

export default BrandMark;
