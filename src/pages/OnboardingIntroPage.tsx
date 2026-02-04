import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Cpu, MessageCircle, Sun, Sparkles } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";

const OnboardingIntroPage = () => {
  const navigate = useNavigate();

  const steps = [
    { step: 1, title: "Verify your electricity connection", icon: MapPin, color: "from-orange-400 to-amber-500" },
    { step: 2, title: "Help Samai understand you", icon: MessageCircle, color: "from-purple-400 to-indigo-500" },
  ];

  return (
    <div className="screen-container relative overflow-hidden">
      {/* Background gradient effects - Vibrant & Warm */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top warm sunlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-orange-300/35 via-amber-200/20 to-transparent rounded-full blur-3xl" />
        
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_4s_ease-in-out_infinite]" />
        
        {/* Colorful accent orbs */}
        <div className="absolute top-1/4 -left-20 w-[250px] h-[250px] bg-gradient-to-br from-orange-400/20 to-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/2 -right-20 w-[200px] h-[200px] bg-gradient-to-bl from-teal-400/15 to-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-[180px] h-[180px] bg-gradient-to-tr from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        
        {/* Bottom warm gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-orange-100/20 to-transparent" />
        
        {/* Floating particles */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-lg shadow-orange-400/30" />
        <div className="absolute top-32 right-1/4 w-1.5 h-1.5 bg-gradient-to-br from-teal-400 to-green-500 rounded-full animate-[pulse_3s_ease-in-out_infinite] shadow-lg shadow-teal-400/30" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full animate-[pulse_5s_ease-in-out_infinite] shadow-lg shadow-purple-400/30" style={{ animationDelay: "0.5s" }} />
        
        {/* Decorative icons */}
        <div className="absolute top-16 right-10 text-orange-400/20">
          <Sun size={40} className="animate-[pulse_6s_ease-in-out_infinite]" />
        </div>
        <div className="absolute bottom-28 left-6 text-amber-400/15">
          <Sparkles size={28} className="animate-[pulse_5s_ease-in-out_infinite]" style={{ animationDelay: "2s" }} />
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-8 px-4 relative z-10">
        {/* Logo */}
        <div className="animate-fade-in">
          <SamaiLogo size="md" />
        </div>

        {/* Message */}
        <div className="text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 mb-4">
            <Sparkles className="text-primary" size={26} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Your Samai account is ready!
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete 2 quick steps before you start earning.
          </p>
        </div>

        {/* Steps - Colorful cards */}
        <div className="w-full space-y-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-card hover:shadow-lg transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                  <Icon className="text-white" size={18} />
                </div>
                <p className="text-sm font-medium text-foreground flex-1">{item.title}</p>
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {item.step}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            // Clear userContext for new users starting fresh onboarding
            const currentData = JSON.parse(localStorage.getItem("samai_user_data") || "{}");
            localStorage.setItem("samai_user_data", JSON.stringify({ 
              ...currentData, 
              userContext: "" 
            }));
            navigate("/onboarding/location");
          }}
          className="btn-solar w-full flex items-center justify-center gap-2 animate-slide-up !py-3.5"
          style={{ animationDelay: "0.3s" }}
        >
          <Sparkles size={18} />
          Let's get started
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingIntroPage;
