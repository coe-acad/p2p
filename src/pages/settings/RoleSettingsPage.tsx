import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useUserData } from "@/hooks/useUserData";

type IntentValue = "sell" | "buy";

const ROLES: { id: IntentValue; label: string; description: string }[] = [
  { id: "sell", label: "Sell excess solar energy", description: "List your surplus energy for others to buy" },
  { id: "buy", label: "Buy clean energy", description: "Purchase renewable energy from local producers" },
];

const RoleSettingsPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  const currentIntent = userData.intent === "buy" || userData.intent === "sell" ? userData.intent : undefined;
  const [selected, setSelected] = useState<IntentValue | undefined>(currentIntent);

  useEffect(() => {
    if (userData.intent === "buy" || userData.intent === "sell") {
      setSelected(userData.intent);
    }
  }, [userData.intent]);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!selected || saving || selected === currentIntent) {
      navigate("/profile");
      return;
    }
    setSaving(true);
    setUserData({ intent: selected });
    navigate(selected === "buy" ? "/buyer-home" : "/home", { replace: true });
  };

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <PageContainer gap={4}>
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
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
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

        <button
          onClick={handleSave}
          disabled={saving || !selected}
          className="btn-solar w-full text-sm !py-3 mt-2 disabled:opacity-50"
        >
          {!selected ? "Choose a role" : selected === currentIntent ? "Done" : "Save & Switch"}
        </button>
      </PageContainer>
    </div>
  );
};

export default RoleSettingsPage;
