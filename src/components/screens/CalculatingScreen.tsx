import { useEffect, useState } from "react";
import { Sun, Cloud, Users } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface CalculatingScreenProps {
  onComplete: () => void;
}
//
const CalculatingScreen = ({ onComplete }: CalculatingScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: Cloud, text: "Checking weather..." },
    { icon: Users, text: "Finding buyers..." },
    { icon: Sun, text: "Preparing plan..." },
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);
    const completeTimeout = setTimeout(onComplete, 5000);
    return () => {
      clearInterval(stepInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="screen-container">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 px-4">
        {/* Logo */}
        <div className="animate-fade-in">
          <SamaiLogo size="md" showText={false} animated />
        </div>

        {/* Title */}
        <div className="text-center animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Preparing your best plan
          </h2>
        </div>

        {/* Steps */}
        <div className="w-full space-y-1.5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStep;
            return (
              <div
                key={index}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-500 ${
                  isActive ? "opacity-100 bg-primary/5" : "opacity-30"
                }`}
              >
                <Icon className={isActive ? "text-primary" : "text-muted-foreground"} size={16} />
                <span className="text-sm text-foreground">{step.text}</span>
                {isActive && index < currentStep && (
                  <span className="ml-auto text-accent text-xs">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalculatingScreen;
