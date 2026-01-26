import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";

const OnboardingIntroPage = () => {
  const navigate = useNavigate();

  const steps = [
    { step: 1, title: "Verify electricity connection" },
    { step: 2, title: "Confirm your solar setup" },
    { step: 3, title: "Help Samai understand you" },
  ];

  return (
    <div className="screen-container">
      <div className="w-full max-w-md flex flex-col items-center gap-8 px-4">
        {/* Logo */}
        <div className="animate-fade-in">
          <SamaiLogo size="md" />
        </div>

        {/* Message */}
        <div className="text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Your Samai account is ready.
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete 3 things before you start earning.
          </p>
        </div>

        {/* Steps */}
        <div className="w-full space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {item.step}
              </div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/onboarding/location")}
          className="btn-solar w-full flex items-center justify-center gap-2 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          Let's get started <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingIntroPage;
