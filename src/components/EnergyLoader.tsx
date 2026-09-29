import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { ThinkingOrb } from "thinking-orbs";

/** Samai "Block" bolt — flat top like a road-sign bolt; reads well at tiny sizes. */
const BOLT_PATH = "M9.5 1.5h7.5l-3 7.5H19L7.5 22.5 10 12.5H5l4.5-11z";

/** Resolve the element's CSS text colour to rgb() (canvas can't read CSS variables). */
const useInkColor = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [color, setColor] = useState<string>();
  const { resolvedTheme } = useTheme();
  useLayoutEffect(() => {
    if (ref.current) setColor(getComputedStyle(ref.current).color);
  }, [resolvedTheme]);
  return { ref, color };
};

/** Two charges orbiting the bolt on a tilted path; the nearer one is brighter. */
const TwinCharges = ({ size, color }: { size: number; color: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr;
    cv.height = size * dpr;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = size / 2;
    const tilt = -0.5;
    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = color;
      for (let k = 0; k < 2; k++) {
        const a = t * Math.PI * 2 * 0.6 + k * Math.PI;
        const x = Math.cos(a) * size * 0.42;
        const y = Math.sin(a) * size * 0.16;
        ctx.globalAlpha = 0.45 + 0.55 * ((Math.sin(a) + 1) / 2);
        ctx.beginPath();
        ctx.arc(c + x * Math.cos(tilt) - y * Math.sin(tilt), c + x * Math.sin(tilt) + y * Math.cos(tilt), Math.max(1, size / 24), 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size, color]);
  return <canvas ref={ref} aria-hidden className="absolute inset-0" style={{ width: size, height: size }} />;
};

interface EnergyLoaderProps {
  /** 20/24 = inline (buttons, rows), 32 = compact, 64 = page. */
  size?: 20 | 24 | 32 | 64;
  label?: string;
  className?: string;
}

/**
 * The app's one loading indicator: the Samai bolt charges up from bottom to top
 * while two charges orbit it. Drawn in currentColor — set it with a text-* class
 * (brand blue on pages; inherits white/ink on primary buttons).
 */
export const EnergyLoader = ({ size = 24, label = "Loading", className = "" }: EnergyLoaderProps) => {
  const { ref, color } = useInkColor<HTMLSpanElement>();
  const bolt = Math.round(size * 0.48);
  // Inline sizes beat the button's `[&_svg]:size-4` rule.
  const svgStyle = { width: bolt, height: bolt };

  return (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
    >
      {color && <TwinCharges size={size} color={color} />}
      <span className="relative" style={svgStyle} aria-hidden>
        <svg viewBox="0 0 24 24" fill="currentColor" className="absolute inset-0 opacity-20" style={svgStyle}>
          <path d={BOLT_PATH} />
        </svg>
        <svg viewBox="0 0 24 24" fill="currentColor" className="charge-fill absolute inset-0" style={svgStyle}>
          <path d={BOLT_PATH} />
        </svg>
      </span>
    </span>
  );
};

/**
 * Breathing dotted orb that circles the Samai bolt (login, OTP, app bar).
 */
export const BrandOrb = ({ size = 64, className = "" }: { size?: 20 | 32 | 64; className?: string }) => {
  const { ref, color } = useInkColor<HTMLSpanElement>();
  return (
    <span ref={ref} aria-hidden style={{ width: size, height: size }} className={`pointer-events-none ${className}`}>
      {color && <ThinkingOrb state="breathing" size={size} color={color} aria-hidden />}
    </span>
  );
};

export default EnergyLoader;
