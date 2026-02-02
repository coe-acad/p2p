import { useState, useEffect, useRef } from "react";

interface RollingNumberProps {
  value: number;
  prefix?: string;
  className?: string;
  duration?: number;
}

const RollingNumber = ({ value, prefix = "", className = "", duration = 600 }: RollingNumberProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsAnimating(true);
      
      const startValue = prevValueRef.current;
      const endValue = value;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          prevValueRef.current = value;
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, duration]);

  const digits = String(displayValue).split("");

  return (
    <span className={`inline-flex items-center ${className}`}>
      {prefix}
      <span className="inline-flex overflow-hidden">
        {digits.map((digit, i) => (
          <span 
            key={`${i}-${digit}`}
            className={`inline-block transition-transform duration-150 ${
              isAnimating ? "animate-[digit-roll_0.3s_ease-out]" : ""
            }`}
            style={{ 
              animationDelay: `${(digits.length - 1 - i) * 50}ms`
            }}
          >
            {digit}
          </span>
        ))}
      </span>
      {isAnimating && (
        <span className="absolute -right-4 top-0 animate-[sparkle-pop_0.5s_ease-out_forwards] text-accent">✨</span>
      )}
    </span>
  );
};

export default RollingNumber;
