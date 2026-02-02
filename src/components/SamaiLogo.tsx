import samaiLogoSvg from "@/assets/samai-logo.svg";

interface SamaiLogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
  animated?: boolean;
}

const SamaiLogo = ({ size = "md", showText = true, animated = false }: SamaiLogoProps) => {
  const sizes = {
    xs: { container: 28, text: "text-sm" },
    sm: { container: 39, text: "text-xl" },
    md: { container: 67, text: "text-3xl" },
    lg: { container: 89, text: "text-4xl" },
  };

  const containerSize = sizes[size].container;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Outer glow rings - only show when animated */}
        {animated && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-xl scale-150 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 blur-2xl scale-[2] animate-[pulse_3s_ease-in-out_infinite]" />
          </>
        )}
        
        {/* Main logo container */}
        <div 
          className="relative flex items-center justify-center"
          style={{ width: containerSize, height: containerSize }}
        >
          {/* Logo image */}
          <img
            src={samaiLogoSvg}
            alt="Samai"
            className={`w-full h-full object-contain ${animated ? 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]' : ''}`}
          />
        </div>
      </div>
      
      {showText && (
        <h1 className={`${sizes[size].text} font-semibold text-foreground tracking-tight`}>
          Samai
        </h1>
      )}
    </div>
  );
};

export default SamaiLogo;
