import { Lock, CheckCircle2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface ConfirmedTrade {
  time: string;
  kWh: number;
  rate: number;
  earnings: number;
  buyer?: string;
}

interface ConfirmedTradesCardProps {
  trades: ConfirmedTrade[];
  className?: string;
  style?: React.CSSProperties;
  innerRef?: React.RefObject<HTMLDivElement>;
}

const ConfirmedTradesCard = ({ trades, className = "", style, innerRef }: ConfirmedTradesCardProps) => {
  const { t } = useTranslation();
  if (trades.length === 0) return null;

  return (
    <div ref={innerRef} className={`bg-card rounded-xl border border-border shadow-card p-3 ${className}`} style={style}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("trades.confirmed")}</p>
        <div className="flex items-center gap-1 text-2xs text-accent bg-accent/10 rounded-full px-2 py-0.5">
          <Lock size={9} />
          <span>{t("prepared.lockedIn")}</span>
        </div>
      </div>
      
      <div className="space-y-0">
        {trades.map((trade, index) => (
          <div 
            key={index}
            className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle2 size={12} className="text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-medium text-foreground">{trade.time}</p>
                  {trade.buyer && (
                    <span className="text-2xs text-muted-foreground">· {trade.buyer}</span>
                  )}
                </div>
                <p className="text-2xs text-muted-foreground">
                  {trade.kWh} kWh · ₹{trade.rate.toFixed(2)}/unit
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground">₹{trade.earnings}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfirmedTradesCard;
