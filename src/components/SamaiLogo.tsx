interface SamaiLogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
  animated?: boolean;
}

const SamaiLogo = ({ size = "md", showText = true, animated = false }: SamaiLogoProps) => {
  const sizes = {
    xs: { text: "text-sm", container: "p-1", img: "w-5 h-5" },
    sm: { text: "text-xl", container: "p-2", img: "w-7 h-7" },
    md: { text: "text-3xl", container: "p-3", img: "w-12 h-12" },
    lg: { text: "text-4xl", container: "p-4", img: "w-16 h-16" },
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Outer glow rings - only show when animated */}
        {animated && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-primary/10 blur-xl scale-150 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/15 to-accent/10 blur-2xl scale-[2] animate-[pulse_3s_ease-in-out_infinite]" />
          </>
        )}
        
        {/* Main logo container */}
        <div className={`relative rounded-full ${sizes[size].container} bg-gradient-to-br from-primary/10 via-amber-100/50 to-accent/10 ${animated ? 'animate-[spin_20s_linear_infinite]' : ''}`}>
          {/* Inner glow */}
          {animated && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-amber-400/20 to-transparent" />
          )}
          
          <img
            src="/logo.svg"
            alt="Samai"
            className={`relative z-10 ${sizes[size].img} ${animated ? 'drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]' : ''}`}
          />
        </div>

        {/* Sunray effects - only show when animated */}
        {animated && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-8 bg-gradient-to-t from-amber-400/30 to-transparent rounded-full origin-bottom"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                  animation: `pulse ${2 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
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
