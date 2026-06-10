import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Pill-shaped theme toggle with a sliding thumb. The thumb morphs colour and
 * icon between Sun (amber) and Moon (Atria blue). Smooth 350ms slide, soft
 * glow ring around the active state for a quiet "futuristic" feel.
 */
export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid hydration mismatch — next-themes can return `undefined` on first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full
                  border border-border bg-secondary/80
                  transition-colors duration-300 ease-out
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  ${className}`}
    >
      {/* Faded track icons — the inactive side stays visible to suggest the
          destination state. */}
      <Sun
        aria-hidden
        className={`absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-300
                    ${isDark ? "text-amber-400 opacity-50" : "opacity-0"}`}
      />
      <Moon
        aria-hidden
        className={`absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-300
                    ${isDark ? "opacity-0" : "text-primary opacity-50"}`}
      />

      {/* Thumb — slides between the two ends, carrying the active icon with
          a soft coloured ring underneath it. */}
      <span
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full
                    bg-card shadow-[0_2px_6px_-1px_rgba(0,0,0,0.18)]
                    ring-2 transition-all duration-[350ms] ease-[cubic-bezier(0.32,0.72,0.18,1.06)]
                    ${
                      isDark
                        ? "translate-x-[1.85rem] ring-primary/35"
                        : "translate-x-0.5 ring-amber-300/45"
                    }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-400/40" strokeWidth={2.2} />
        )}
      </span>
    </button>
  );
};
