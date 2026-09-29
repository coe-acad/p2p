import { useState } from "react";
import { EnergyLoader } from "@/components/EnergyLoader";
import { useTheme } from "next-themes";
import { BorderBeam } from "border-beam";
import { ChevronRight, ShoppingBag, Sun } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";

interface IntentSelectionScreenProps {
  onSelect: (intents: ("sell" | "buy")[]) => void | Promise<void>;
  onBack?: () => void;
}

type Choice = "sell" | "buy";

const IntentSelectionScreen = ({ onSelect }: IntentSelectionScreenProps) => {
  // Track which card is being committed so we can show a spinner and prevent
  // double-taps while the save call is in flight in the parent IntentPage.
  const [submitting, setSubmitting] = useState<Choice | null>(null);
  const [hovered, setHovered] = useState<Choice | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleChoice = async (choice: Choice) => {
    if (submitting) return;
    setSubmitting(choice);
    try {
      await onSelect([choice]);
    } finally {
      // If the parent didn't navigate (e.g. missing phone in userData), clear
      // the spinner so the user can retry instead of being stuck forever.
      setSubmitting(null);
    }
  };

  // Each card keeps its persona colour: Buy = accent green, Sell = primary blue.
  // Class strings are written out in full so Tailwind's JIT scanner picks them up.
  const cards: Array<{
    id: Choice;
    icon: typeof Sun;
    title: string;
    sub: string;
    beam: "forest" | "ocean";
    tone: { wash: string; iconTile: string; iconHover: string; chevHover: string };
  }> = [
    {
      id: "buy",
      icon: ShoppingBag,
      title: "Buy energy",
      sub: "Browse offers from clean energy producers near you.",
      beam: "forest",
      tone: {
        wash: "bg-[linear-gradient(160deg,hsl(var(--accent)/0.10),transparent_60%)]",
        iconTile: "bg-accent/10 text-accent",
        iconHover: "group-hover:bg-accent group-hover:text-accent-foreground",
        chevHover: "group-hover:text-accent",
      },
    },
    {
      id: "sell",
      icon: Sun,
      title: "Sell energy",
      sub: "List your excess solar generation for nearby buyers.",
      beam: "ocean",
      tone: {
        wash: "bg-[linear-gradient(160deg,hsl(var(--primary)/0.10),transparent_60%)]",
        iconTile: "bg-primary/10 text-primary",
        iconHover: "group-hover:bg-primary group-hover:text-primary-foreground",
        chevHover: "group-hover:text-primary",
      },
    },
  ];

  return (
    <div className="circuit-bg min-h-screen min-h-svh min-h-dvh flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-md flex flex-col gap-8 slide-up">
          <div className="flex justify-center">
            <SamaiLogo size="lg" showText={true} />
          </div>

          <div className="text-center">
            <p className="kicker-zap text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Set up your trade intent
            </p>
            <h1 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
              What would you like Samai to help you do?
            </h1>
          </div>

          <div className="flex flex-col gap-3">
            {cards.map(({ id, icon: Icon, title, sub, beam, tone }, idx) => {
              const isActive = submitting === id;
              return (
                // Border beam (border-beam) traces the tile while hovered/focused.
                <BorderBeam
                  key={id}
                  size="md"
                  colorVariant={beam}
                  theme={isDark ? "dark" : "light"}
                  strength={0.8}
                  active={hovered === id || isActive}
                  borderRadius={20}
                >
                  <button
                    type="button"
                    onClick={() => handleChoice(id)}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(id)}
                    onBlur={() => setHovered(null)}
                    disabled={!!submitting}
                    style={{ animationDelay: `${idx * 80}ms` }}
                    className={`group relative flex w-full flex-col gap-1.5 rounded-[20px] border border-border bg-card p-5 text-left
                                shadow-[0_6px_18px_-12px_rgba(20,24,100,0.25)] slide-up opacity-0
                                transition-transform duration-300 ease-out
                                hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                                disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0
                                ${tone.wash}`}
                  >
                    <span className="mb-2.5 flex items-center justify-between">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-[13px] transition-colors duration-300 ${tone.iconTile} ${tone.iconHover}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className={`text-muted-foreground transition-all duration-300 ease-out group-hover:translate-x-1 ${tone.chevHover}`}>
                        {isActive ? (
                          <EnergyLoader className="text-primary" label="Saving" />
                        ) : (
                          <ChevronRight className="h-[18px] w-[18px] touch-nudge" />
                        )}
                      </span>
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-foreground">{title}</span>
                    <span className="text-sm text-muted-foreground">{sub}</span>
                  </button>
                </BorderBeam>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntentSelectionScreen;
