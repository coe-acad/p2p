const samaiLogoSvg = "/charzpe_embedded.svg";

interface SVMCLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  animated?: boolean;
}

const SVMCLogo = ({ size = "md", showText = true, animated = false }: SVMCLogoProps) => {
  const sizes = {
    xs: { container: 28, text: "text-sm", border: 2 },
    sm: { container: 39, text: "text-xl", border: 2 },
    md: { container: 67, text: "text-3xl", border: 2 },
    lg: { container: 120, text: "text-4xl", border: 3 },
    xl: { container: 160, text: "text-5xl", border: 3 },
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
          className="relative flex items-center justify-center rounded-full border border-primary/20 bg-primary/5"
          style={{
            width: containerSize,
            height: containerSize,
            borderWidth: sizes[size].border
          }}
        >
          {/* Logo image */}
          <img
            src={samaiLogoSvg}
            alt="CharzPe"
            className={`w-[85%] h-[85%] object-contain ${animated ? 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]' : ''}`}
          />
        </div>
      </div>
      
      {showText && (
        <h1 className={`${sizes[size].text} font-semibold text-foreground tracking-tight`}>
          CharzPe
        </h1>
      )}
    </div>
  );
};

export default SVMCLogo;
