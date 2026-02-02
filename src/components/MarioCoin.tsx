interface MarioCoinProps {
  size?: number;
  className?: string;
}

const MarioCoin = ({ size = 24, className = "" }: MarioCoinProps) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer gold ring */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)",
          boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4), 0 2px 8px rgba(255,165,0,0.5)"
        }}
      />
      {/* Inner circle with star/₹ symbol */}
      <div 
        className="absolute flex items-center justify-center"
        style={{
          top: "15%",
          left: "15%",
          right: "15%",
          bottom: "15%",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FFED4A 0%, #FFD700 100%)",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.2)"
        }}
      >
        <span 
          className="font-black text-amber-700"
          style={{ fontSize: size * 0.4 }}
        >
          ₹
        </span>
      </div>
      {/* Shine effect */}
      <div 
        className="absolute rounded-full bg-white/40"
        style={{
          top: "12%",
          left: "20%",
          width: "25%",
          height: "15%",
          transform: "rotate(-30deg)"
        }}
      />
    </div>
  );
};

export default MarioCoin;
