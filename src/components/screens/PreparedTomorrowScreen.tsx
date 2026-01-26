import { useState, useEffect } from "react";
import { Leaf, Clock, TrendingUp, Zap, AlertTriangle, RefreshCw, Check, Pause, Sliders, MessageCircle, X, ShieldX, ArrowLeft, Lock } from "lucide-react";
import { format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SamaiLogo from "../SamaiLogo";

interface PreparedTomorrowScreenProps {
  isVCVerified?: boolean;
  forecastWindows?: Array<{
    from_timestamp?: number;
    to_timestamp?: number;
    price_per_unit?: number;
    total_units?: number;
    expected_total?: number;
  }>;
  onLooksGood: () => void;
  onViewAdjust: () => void;
  onTalkToSamai: () => void;
  onVerifyNow?: () => void;
  onBack?: () => void;
}

const TIME_SLOTS = [
  { time: "11:00 AM – 12:00 PM", kWh: 5, rate: 6.10, earnings: 30 },
  { time: "12:00 PM – 1:00 PM", kWh: 5, rate: 6.20, earnings: 31 },
  { time: "1:00 PM – 2:00 PM", kWh: 4, rate: 6.00, earnings: 24 },
  { time: "2:00 PM – 3:00 PM", kWh: 4, rate: 6.25, earnings: 25 },
];

const SUGGESTION_CHIPS = [
  "Pause all trades for tomorrow",
  "Don't sell between 1 and 3 PM",
  "I'll have guests tomorrow evening",
  "Only sell if price > ₹6",
];

const HOUR_OPTIONS = ["10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];

const PreparedTomorrowScreen = ({ 
  isVCVerified = true, 
  forecastWindows = [],
  onLooksGood, 
  onTalkToSamai,
  onVerifyNow,
  onBack
}: PreparedTomorrowScreenProps) => {
  const forecastSlots = forecastWindows.length
    ? forecastWindows.map((window) => {
        const from = window.from_timestamp ? new Date(window.from_timestamp * 1000) : null;
        const to = window.to_timestamp ? new Date(window.to_timestamp * 1000) : null;
        const timeLabel = from && to
          ? `${format(from, "h:mm a")} – ${format(to, "h:mm a")}`
          : "Upcoming window";
        return {
          time: timeLabel,
          kWh: window.total_units || 0,
          rate: window.price_per_unit || 0,
          earnings: window.expected_total || 0,
        };
      })
    : TIME_SLOTS;

  const totalUnits = forecastSlots.reduce((sum, slot) => sum + slot.kWh, 0);
  const totalEarnings = forecastSlots.reduce((sum, slot) => sum + slot.earnings, 0);
  const confirmedTrades = forecastSlots.slice(0, 2).map((slot, index) => ({
    ...slot,
    discom: index === 0 ? "GridCo" : "TPDDL",
  }));
  
  const tomorrow = addDays(new Date(), 1);
  const [showVerificationError, setShowVerificationError] = useState(false);

  const handleLooksGood = () => {
    if (!isVCVerified) {
      setShowVerificationError(true);
    } else {
      onLooksGood();
    }
  };
  const tomorrowFormatted = format(tomorrow, "EEEE, MMMM d");
  const todayFormatted = format(new Date(), "EEEE, MMMM d");

  // Countdown timer - 6 hour cycle
  const [countdown, setCountdown] = useState("");
  
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const hours = now.getHours();
      // Next refresh at 6, 12, 18, or 24 (0)
      const nextRefreshHour = Math.ceil((hours + 1) / 6) * 6;
      const nextRefresh = new Date(now);
      nextRefresh.setHours(nextRefreshHour % 24, 0, 0, 0);
      if (nextRefreshHour >= 24) {
        nextRefresh.setDate(nextRefresh.getDate() + 1);
      }
      
      const diff = nextRefresh.getTime() - now.getTime();
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hoursLeft}h ${minsLeft}m`;
    };
    
    setCountdown(calculateCountdown());
    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Modal states
  const [showControlModal, setShowControlModal] = useState(false);
  const [modalStep, setModalStep] = useState<'main' | 'options' | 'time'>('main');
  const [excludedHours, setExcludedHours] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handleOpenControl = () => {
    setModalStep('main');
    setShowControlModal(true);
  };

  const handleOptionSelect = (option: string) => {
    if (option === 'pause') {
      setShowControlModal(false);
      // Handle pause action
    } else if (option === 'time') {
      setModalStep('time');
    } else if (option === 'talk') {
      setShowControlModal(false);
      onTalkToSamai();
    }
  };

  const toggleHour = (hour: string) => {
    setExcludedHours(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const handleConfirmChanges = () => {
    setShowControlModal(false);
    // Handle confirmed changes
  };

  return (
    <div className="screen-container !py-6">
      <div className="w-full max-w-md flex flex-col gap-3 px-4">
        {/* Warning Banner */}
        {!isVCVerified && (
          <div className="flex items-center gap-2.5 p-2.5 bg-destructive/5 border border-destructive/10 rounded-lg animate-slide-up">
            <AlertTriangle className="text-destructive flex-shrink-0" size={14} />
            <p className="text-xs text-foreground flex-1">DISCOM verification pending</p>
            <button onClick={onVerifyNow} className="text-xs font-medium text-primary">
              Verify
            </button>
          </div>
        )}

        {/* Header with Logo and date */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="h-8 w-8 rounded-full border border-border bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                aria-label="Back to home"
              >
                <ArrowLeft size={14} />
              </button>
            )}
            <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">All set for tomorrow</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{tomorrowFormatted}</p>
            </div>
          </div>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Earnings Summary Card - with color gradient */}
        <div className={`rounded-xl border border-border shadow-card overflow-hidden animate-scale-in ${!isVCVerified ? 'opacity-70' : ''}`}>
          <div className="p-4 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5">
            <p className="text-xs text-muted-foreground text-center">Expected Earnings</p>
            <div className="text-center py-2">
              <p className="text-3xl font-semibold text-foreground tracking-tight">₹{totalEarnings}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{totalUnits} kWh</p>
            </div>
          </div>
          
          {/* Green Energy Bar - light green background */}
          <div className="bg-accent/15 px-3 py-1.5 flex items-center justify-center gap-1.5 border-t border-accent/20">
            <Leaf className="text-accent" size={12} />
            <span className="text-xs font-medium text-accent">100% Solar</span>
          </div>
        </div>

        {/* Actions - placed above planned trades */}
        <div className="flex gap-2 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <button onClick={handleLooksGood} className="btn-solar flex-1 !py-2.5 text-sm">
            Publish Trades
          </button>
          <button onClick={handleOpenControl} className="btn-outline-calm flex-1 flex items-center justify-center gap-1.5 !py-2.5 text-sm">
            <span>Change</span>
          </button>
        </div>

        {/* Time Slots */}
        <div className="bg-card rounded-xl border border-border shadow-card p-3 animate-slide-up" style={{ animationDelay: "0.08s" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Planned Trades</p>
            {/* Non-closable countdown */}
            <div className="flex items-center gap-1 text-2xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
              <RefreshCw size={9} />
              <span>Refreshes in {countdown}</span>
            </div>
          </div>
          
          <div className="space-y-0">
            {forecastSlots.map((slot, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/6 flex items-center justify-center">
                    <Clock size={12} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-medium text-foreground">{slot.time}</p>
                      <Zap size={9} className="text-accent" />
                    </div>
                    <p className="text-2xs text-muted-foreground">
                      {slot.kWh} kWh · ₹{slot.rate.toFixed(2)}/unit
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">₹{slot.earnings}</p>
              </div>
            ))}
          </div>

          {/* Price Note */}
          <div className="flex items-center gap-1.5 pt-2 mt-1">
            <TrendingUp size={10} className="text-accent flex-shrink-0" />
            <p className="text-2xs text-muted-foreground">
              Prices may improve as demand updates.
            </p>
          </div>
        </div>

        {/* Confirmed Trades */}
        <div className="bg-card rounded-xl border border-border shadow-card p-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Confirmed</p>
            <div className="flex items-center gap-1.5 text-2xs text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
              <Lock size={10} />
              <span>Locked in</span>
            </div>
          </div>

          <div className="space-y-0">
            {confirmedTrades.map((trade, index) => (
              <div
                key={`${trade.time}-${index}`}
                className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Check size={12} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {trade.time} <span className="text-muted-foreground">· {trade.discom}</span>
                    </p>
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
      </div>

      {/* Take Control Modal */}
      <Dialog open={showControlModal} onOpenChange={setShowControlModal}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-3 border-b border-border">
            <DialogTitle className="text-base font-semibold">Take control</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Today, {todayFormatted} · Adjust Samai's plan for tomorrow ({format(tomorrow, "EEEE")})
            </p>
          </DialogHeader>

          {modalStep === 'main' && (
            <div className="p-4 space-y-4">
              {/* Talk to Samai section */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Talk to Samai</p>
                <p className="text-xs text-muted-foreground mb-3">Try saying:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTION_CHIPS.map((chip, index) => (
                    <button
                      key={index}
                      onClick={() => setChatInput(chip)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action to show options */}
              <button
                onClick={() => setModalStep('options')}
                className="w-full text-xs text-primary text-left hover:underline"
              >
                Or choose from options →
              </button>
            </div>
          )}

          {modalStep === 'options' && (
            <div className="p-4 space-y-2">
              <p className="text-sm font-medium text-foreground mb-3">What would you like to do?</p>
              
              {/* Pause option */}
              <button
                onClick={() => handleOptionSelect('pause')}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Pause size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Pause all trades for tomorrow</p>
                  <p className="text-xs text-muted-foreground">Samai won't publish any offers</p>
                </div>
              </button>

              {/* Adjust time option */}
              <button
                onClick={() => handleOptionSelect('time')}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sliders size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Adjust specific time windows</p>
                  <p className="text-xs text-muted-foreground">Choose which hours to exclude</p>
                </div>
              </button>

              {/* Talk to Samai option */}
              <button
                onClick={() => handleOptionSelect('talk')}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Talk to Samai</p>
                  <p className="text-xs text-muted-foreground">Describe what you need in plain language</p>
                </div>
              </button>

              <button
                onClick={() => setModalStep('main')}
                className="w-full text-xs text-muted-foreground text-center mt-2 hover:text-foreground"
              >
                ← Back
              </button>
            </div>
          )}

          {modalStep === 'time' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Adjust time windows</p>
                <button onClick={() => setModalStep('options')} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Tap hours to exclude them. Excluded hours won't be published or traded.
              </p>

              <div className="grid grid-cols-4 gap-2">
                {HOUR_OPTIONS.map((hour) => {
                  const isExcluded = excludedHours.includes(hour);
                  return (
                    <button
                      key={hour}
                      onClick={() => toggleHour(hour)}
                      className={`py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isExcluded 
                          ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                          : 'bg-accent/10 text-accent border border-accent/20'
                      }`}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleConfirmChanges}
                className="btn-green w-full !py-3 flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Confirm changes</span>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Error Modal */}
      <Dialog open={showVerificationError} onOpenChange={setShowVerificationError}>
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <ShieldX size={32} className="text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Verification Required</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You need to complete DISCOM verification before you can publish trades. This ensures your energy connection is valid.
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  setShowVerificationError(false);
                  onVerifyNow?.();
                }}
                className="btn-solar w-full !py-3"
              >
                Verify Now
              </button>
              <button 
                onClick={() => setShowVerificationError(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
              >
                I'll do this later
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreparedTomorrowScreen;
