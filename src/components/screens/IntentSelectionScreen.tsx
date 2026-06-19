import { useState } from "react";
import { ChevronRight, Loader2, ShoppingBag, Sun } from "lucide-react";
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

  // Each card has its own brand identity color, applied at rest (not just on hover).
  // Buy = primary blue (steady, structural). Sell = accent green (active, energy).
  // Class strings written out in full so Tailwind's JIT scanner can pick them up.
  const cards: Array<{
    id: Choice;
    icon: typeof Sun;
    title: string;
    sub: string;
    tone: {
      restBorder: string;
      restShadow: string;
      restWash: string;
      hoverBorder: string;
      hoverShadow: string;
      stripe: string;
      iconTile: string;
      iconHover: string;
      chevHover: string;
      underline: string;
    };
  }> = [
    // Persona-by-color: Buy = GREEN identity (buyer world), Sell = BLUE identity
    // (seller world). The intent screen is the bridge — colour picks the world.
    // Washes use a solid bg-{color}/x rather than gradients (no-gradients rule).
    {
      id: "buy",
      icon: ShoppingBag,
      title: "Buy energy",
      sub: "Browse offers from clean energy producers near you.",
      tone: {
        restBorder: "border-accent/15",
        restShadow: "shadow-[0_6px_18px_-10px_rgba(31,138,82,0.22)]",
        restWash: "bg-accent/[0.04]",
        hoverBorder: "hover:border-accent/55",
        hoverShadow: "hover:shadow-[0_18px_40px_-18px_rgba(31,138,82,0.40)]",
        stripe: "bg-accent",
        iconTile: "bg-accent/12 text-accent",
        iconHover: "group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-[0_8px_16px_-6px_rgba(31,138,82,0.50)]",
        chevHover: "group-hover:text-accent",
        underline: "bg-accent",
      },
    },
    {
      id: "sell",
      icon: Sun,
      title: "Sell energy",
      sub: "List your excess solar generation for nearby buyers.",
      tone: {
        restBorder: "border-primary/15",
        restShadow: "shadow-[0_6px_18px_-10px_rgba(36,40,128,0.22)]",
        restWash: "bg-primary/[0.04]",
        hoverBorder: "hover:border-primary/55",
        hoverShadow: "hover:shadow-[0_18px_40px_-18px_rgba(36,40,128,0.40)]",
        stripe: "bg-primary",
        iconTile: "bg-primary/12 text-primary",
        iconHover: "group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_8px_16px_-6px_rgba(36,40,128,0.50)]",
        chevHover: "group-hover:text-primary",
        underline: "bg-primary",
      },
    },
  ];

  return (
    <div className="min-h-screen min-h-svh min-h-dvh flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-md flex flex-col gap-8 slide-up">
          <div className="flex justify-center">
            <SamaiLogo size="lg" showText={true} />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Set up your trade intent
            </p>
            <h1 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
              What would you like CharzPe to help you do?
            </h1>
          </div>

          <div className="flex flex-col gap-3">
            {cards.map(({ id, icon: Icon, title, sub, tone }, idx) => {
              const isActive = submitting === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleChoice(id)}
                  disabled={!!submitting}
                  style={{ animationDelay: `${idx * 80}ms` }}
                  className={`group relative overflow-hidden flex items-center gap-4
                              rounded-xl border bg-card p-5 pl-6 text-left
                              slide-up opacity-0
                              transition-all duration-300 ease-out
                              ${tone.restBorder} ${tone.restShadow}
                              hover:-translate-y-1 hover:scale-[1.005]
                              ${tone.hoverBorder} ${tone.hoverShadow}
                              active:scale-[0.99] active:translate-y-0
                              active:transition-[transform] active:duration-100
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                              disabled:cursor-not-allowed disabled:opacity-60
                              disabled:hover:translate-y-0 disabled:hover:scale-100`}
                >
                  {/* Always-visible left stripe in the card's identity color. Grows to
                      full saturation on hover. */}
                  <span
                    aria-hidden
                    className={`absolute left-0 top-0 h-full w-1 ${tone.stripe}
                                opacity-40 transition-opacity duration-300 ease-out
                                group-hover:opacity-100`}
                  />

                  {/* Always-visible gradient wash in the card's identity color.
                      Subtle at rest, more saturated on hover. */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 -z-0
                                ${tone.restWash}
                                opacity-100 transition-opacity duration-300 ease-out
                                group-hover:opacity-[1.5]`}
                  />

                  {/* Icon tile — tinted in card's color at rest, fully saturated on hover. */}
                  <span className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg
                                    ${tone.iconTile}
                                    transition-all duration-300 ease-out
                                    ${tone.iconHover}
                                    group-hover:scale-110`}>
                    <Icon className="h-5 w-5 transition-transform duration-300 ease-out group-hover:scale-105" />
                  </span>

                  <span className="relative z-10 min-w-0 flex-1">
                    <span className="relative inline-block text-base font-medium text-foreground
                                     transition-colors duration-200 group-hover:text-foreground">
                      {title}
                      {/* Underline reveal in the card's color. */}
                      <span
                        aria-hidden
                        className={`absolute -bottom-0.5 left-0 h-px w-0 ${tone.underline}
                                    transition-[width] duration-300 ease-out
                                    group-hover:w-full`}
                      />
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{sub}</span>
                  </span>

                  <span className={`relative z-10 text-muted-foreground
                                    transition-all duration-300 ease-out
                                    group-hover:translate-x-1.5 ${tone.chevHover}`}>
                    {isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4 touch-nudge" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntentSelectionScreen;
