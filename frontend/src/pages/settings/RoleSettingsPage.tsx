import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { useState } from "react";

const RoleSettingsPage = () => {
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["seller"]); // Default from onboarding

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const roles = [
    { id: "seller", label: "Sell excess solar energy", description: "List your surplus energy for others to buy" },
    { id: "buyer", label: "Buy clean energy", description: "Purchase renewable energy from local producers" },
  ];

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <div className="w-full max-w-md flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button 
            onClick={() => navigate("/profile")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Your Role</h1>
        </div>

        {/* Role Selection */}
        <div className="space-y-3 animate-slide-up">
          {roles.map((role) => {
            const isSelected = selectedRoles.includes(role.id);
            return (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{role.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          You can select one or both roles
        </p>
      </div>
    </div>
  );
};

export default RoleSettingsPage;
