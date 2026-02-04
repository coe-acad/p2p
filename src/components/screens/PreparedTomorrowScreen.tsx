import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Clock, TrendingUp, Zap, AlertTriangle, RefreshCw, Check, Pause, Sliders, MessageCircle, X, ShieldX, ChevronRight, HelpCircle, ArrowLeft, Timer, Battery, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SamaiLogo from "../SamaiLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmedTradesCard from "./ConfirmedTradesCard";
import { useUserData } from "@/hooks/useUserData";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";
import VoiceNarration from "../VoiceNarration";
import { publishTradesApi } from "@/api/publishTrades";

const WALKTHROUGH_STORAGE_KEY = "samai_prepared_walkthrough_seen";

// Already confirmed/matched trades that won't be refreshed
const CONFIRMED_TRADES = [
  { time: "10:00 AM – 11:00 AM", kWh: 3, rate: 6.50, earnings: 20, buyer: "GridCo" },
  { time: "3:00 PM – 4:00 PM", kWh: 4, rate: 6.25, earnings: 25, buyer: "TPDDL" },
];

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetRef: React.RefObject<HTMLElement>;
}

const WalkthroughOverlay = ({ 
  steps, 
  currentStep, 
  onNext, 
  onSkip,
  onComplete 
}: { 
  steps: WalkthroughStep[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}) => {
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipAbove, setTooltipAbove] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);

  const updatePositions = () => {
    if (step?.targetRef.current) {
      const rect = step.targetRef.current.getBoundingClientRect();
      const padding = 8;
      const tooltipHeight = 180;
      const viewportHeight = window.innerHeight;
      
      setHighlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      const wouldOverflowBottom = rect.bottom + 16 + tooltipHeight > viewportHeight;
      const hasSpaceAbove = rect.top - 16 - tooltipHeight > 0;
      
      const shouldPositionAbove = wouldOverflowBottom && hasSpaceAbove;
      setTooltipAbove(shouldPositionAbove);

      setTooltipPosition({
        top: shouldPositionAbove ? rect.top - 16 - tooltipHeight : rect.bottom + 16,
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - 140, window.innerWidth - 296)),
      });
      
      setIsPositioned(true);
    }
  };

  useEffect(() => {
    setIsPositioned(false);
    
    if (step?.targetRef.current) {
      // First scroll the element into view
      step.targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Wait for scroll to complete, then update positions
      const scrollTimer = setTimeout(() => {
        updatePositions();
      }, 350);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [step, currentStep]);

  // Also update on window resize
  useEffect(() => {
    const handleResize = () => updatePositions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [step]);

  if (!isPositioned) {
    return (
      <div className="fixed inset-0 z-50 bg-black/75" />
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="walkthrough-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect 
              x={highlightRect.left} 
              y={highlightRect.top} 
              width={highlightRect.width} 
              height={highlightRect.height} 
              rx="12"
              fill="black" 
            />
          </mask>
        </defs>
        <rect 
          x="0" 
          y="0" 
          width="100%" 
          height="100%" 
          fill="rgba(0,0,0,0.75)" 
          mask="url(#walkthrough-mask)" 
        />
      </svg>

      {/* Highlight border */}
      <div 
        className="absolute rounded-xl border-2 border-primary shadow-[0_0_0_4px_rgba(var(--primary-rgb),0.2)] transition-all duration-300"
        style={{
          top: highlightRect.top,
          left: highlightRect.left,
          width: highlightRect.width,
          height: highlightRect.height,
        }}
      />

      {/* Tooltip */}
      <div 
        className="absolute w-[280px] bg-card rounded-xl shadow-lg border border-border p-4 transition-all duration-300 animate-fade-in"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Step counter and indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            {currentStep + 1}/{steps.length}
          </span>
          <div className="flex items-center gap-1">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-3 bg-primary' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{step.description}</p>

        <div className="flex items-center justify-between">
          <button 
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <button 
            onClick={isLastStep ? onComplete : onNext}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {isLastStep ? "Got it!" : "Next"}
            {!isLastStep && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

interface PreparedTomorrowScreenProps {
  isVCVerified?: boolean;
  hasConfirmedTrades?: boolean;
  forceWalkthrough?: boolean;
  onLooksGood: () => void;
  onViewAdjust: () => void;
  onTalkToSamai: () => void;
  onVerifyNow?: () => void;
  onBack?: () => void;
}

// Base time slots - will be filtered based on user choices
// isBatteryPowered indicates if battery discharge is providing the energy (for evening/night)
// Base time slots configured for ₹145 total: 4+5+4+4+3+3 = 23 kWh @ ~₹6.30 avg
const BASE_TIME_SLOTS = [
  { id: "10AM", time: "10:00 AM – 11:00 AM", kWh: 4, rate: 6.25, isBatteryPowered: false },
  { id: "11AM", time: "11:00 AM – 12:00 PM", kWh: 5, rate: 6.20, isBatteryPowered: false },
  { id: "12PM", time: "12:00 PM – 1:00 PM", kWh: 4, rate: 6.30, isBatteryPowered: false },
  { id: "1PM", time: "1:00 PM – 2:00 PM", kWh: 4, rate: 6.35, isBatteryPowered: false },
  { id: "2PM", time: "2:00 PM – 3:00 PM", kWh: 3, rate: 6.40, isBatteryPowered: false },
  { id: "5PM", time: "5:00 PM – 6:00 PM", kWh: 3, rate: 6.50, isBatteryPowered: true },
];

// Helper to calculate earnings from kWh and rate
const calculateEarnings = (kWh: number, rate: number) => Math.round(kWh * rate);

// Map hour options to slot IDs for exclusion logic
const HOUR_TO_SLOT_ID: Record<string, string> = {
  "10 AM": "10AM",
  "11 AM": "11AM", 
  "12 PM": "12PM",
  "1 PM": "1PM",
  "2 PM": "2PM",
  "3 PM": "3PM",
  "4 PM": "4PM",
  "5 PM": "5PM",
};

const SUGGESTION_CHIPS = [
  "Pause all trades for tomorrow",
  "Don't sell between 1 and 3 PM",
  "I'll have guests tomorrow evening",
  "Only sell if price > ₹6",
];

const HOUR_OPTIONS = ["10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];

const PreparedTomorrowScreen = ({ 
  isVCVerified = true, 
  hasConfirmedTrades = false,
  forceWalkthrough = false,
  onLooksGood, 
  onTalkToSamai,
  onVerifyNow,
  onBack 
}: PreparedTomorrowScreenProps) => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  const { publishTrades, tradesData } = usePublishedTrades();
  const isAutoMode = userData.automationLevel === "auto";
  
  // State for excluded hours - persisted during session
  const [excludedSlotIds, setExcludedSlotIds] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  
  // Dev toggle for testing auto mode
  const toggleAutoMode = () => {
    setUserData({ 
      automationLevel: isAutoMode ? "recommend" : "auto" 
    });
  };
  
  // Handler for publishing trades (persists to localStorage)
  const handlePublish = async () => {
 try {
    await publishTradesApi(activeTimeSlots);
    console.log("Trades sent to backend successfully");
  } catch (error) {
    console.error("Failed to publish trades", error);
  }

    // Persist the active trades
    publishTrades(activeTimeSlots.map(slot => ({
      id: slot.id,
      time: slot.time,
      kWh: slot.kWh,
      rate: slot.rate,
      isBatteryPowered: slot.isBatteryPowered,
    })));
    // Call the original callback
    onLooksGood();
  };
  
  // Calculate active time slots (not excluded and not paused)
  const activeTimeSlots = isPaused ? [] : BASE_TIME_SLOTS.filter(
    slot => !excludedSlotIds.includes(slot.id)
  ).map(slot => ({
    ...slot,
    earnings: calculateEarnings(slot.kWh, slot.rate)
  }));
  
  // Calculate totals dynamically from active slots
  const plannedUnits = activeTimeSlots.reduce((sum, slot) => sum + slot.kWh, 0);
  const plannedEarnings = activeTimeSlots.reduce((sum, slot) => sum + slot.earnings, 0);
  const confirmedUnits = hasConfirmedTrades ? CONFIRMED_TRADES.reduce((sum, slot) => sum + slot.kWh, 0) : 0;
  const confirmedEarnings = hasConfirmedTrades ? CONFIRMED_TRADES.reduce((sum, slot) => sum + slot.earnings, 0) : 0;
  const totalUnits = plannedUnits + confirmedUnits;
  const totalEarnings = plannedEarnings + confirmedEarnings;
  
  const tomorrow = addDays(new Date(), 1);
  const [showVerificationError, setShowVerificationError] = useState(false);

  // Walkthrough state
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [narrationComplete, setNarrationComplete] = useState(false);
  const shouldWaitForNarration = useRef(false);

  // Refs for walkthrough targets
  const earningsRef = useRef<HTMLDivElement>(null);
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<HTMLDivElement>(null);
  const looksGoodRef = useRef<HTMLButtonElement>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const confirmedRef = useRef<HTMLDivElement>(null);
  const autoCountdownRef = useRef<HTMLDivElement>(null);

  // Auto-mode countdown (2 hours = 7200 seconds)
  const [autoCountdownSeconds, setAutoCountdownSeconds] = useState(2 * 60 * 60);
  
  useEffect(() => {
    if (!isAutoMode) return;
    
    const interval = setInterval(() => {
      setAutoCountdownSeconds(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isAutoMode]);

  const formatAutoCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  // Build walkthrough steps dynamically based on mode and confirmed trades
  const walkthroughSteps: WalkthroughStep[] = [
    {
      id: 'earnings',
      title: 'Expected Earnings',
      description: 'This shows your projected earnings for tomorrow based on current energy prices and your solar capacity.',
      targetRef: earningsRef,
    },
    {
      id: 'timeslots',
      title: 'Planned Trades',
      description: 'These are the time slots when Samai plans to sell your excess energy. Each shows the rate and expected earnings.',
      targetRef: timeSlotsRef,
    },
    // Add auto-mode countdown step if in auto mode
    ...(isAutoMode ? [{
      id: 'autoCountdown',
      title: 'Auto-Posting Countdown',
      description: 'Since you chose automatic selling, these trades will be posted to the market in 2 hours. You can approve earlier or make changes before then.',
      targetRef: autoCountdownRef,
    }] : []),
    {
      id: 'refresh',
      title: 'Auto-Refresh Timer',
      description: 'Prices update every 6 hours. This timer shows when the next update happens, so your plan always reflects current market rates.',
      targetRef: refreshTimerRef,
    },
    {
      id: 'looksGood',
      title: isAutoMode ? 'Approve Now' : 'Confirm Your Plan',
      description: isAutoMode 
        ? 'Don\'t want to wait? Tap here to approve and post these trades to the market immediately.'
        : 'Happy with the plan? Tap here to confirm and let Samai handle the trading for you tomorrow.',
      targetRef: looksGoodRef,
    },
    {
      id: 'change',
      title: 'Make Adjustments',
      description: 'Need to change something? Tap here to pause trades, adjust time windows, or talk to Samai in plain language.',
      targetRef: changeRef,
    },
    // Only include confirmed trades step if there are confirmed trades
    ...(hasConfirmedTrades ? [{
      id: 'confirmed',
      title: 'Confirmed Trades',
      description: 'These trades are already matched with buyers and locked in. They won\'t change at the next refresh.',
      targetRef: confirmedRef,
    }] : []),
  ];

  // Check if walkthrough should be shown on mount - only run once
  const walkthroughInitialized = useRef(false);
  
  useEffect(() => {
    // Prevent re-triggering if already initialized or already showing
    if (walkthroughInitialized.current || showWalkthrough) return;
    
    const hasSeenWalkthrough = localStorage.getItem(WALKTHROUGH_STORAGE_KEY);
    
    // Show walkthrough if coming from onboarding (forceWalkthrough) or if never seen
    if (forceWalkthrough || !hasSeenWalkthrough) {
      walkthroughInitialized.current = true;
      
      // Always wait for narration to complete before showing walkthrough for new users
      // The walkthrough will be triggered by handleNarrationComplete callback
      shouldWaitForNarration.current = true;
      return;
    }
  }, []);

  // Handler for when narration completes
  const handleNarrationComplete = () => {
    setNarrationComplete(true);
    // If we were waiting for narration before showing walkthrough, start it now
    if (shouldWaitForNarration.current && !showWalkthrough) {
      const timer = setTimeout(() => setShowWalkthrough(true), 300);
      return () => clearTimeout(timer);
    }
  };

  const handleWalkthroughComplete = () => {
    localStorage.setItem(WALKTHROUGH_STORAGE_KEY, 'true');
    setShowWalkthrough(false);
    setWalkthroughStep(0);
  };

  const handleWalkthroughSkip = () => {
    localStorage.setItem(WALKTHROUGH_STORAGE_KEY, 'true');
    setShowWalkthrough(false);
    setWalkthroughStep(0);
  };

  const handleWalkthroughNext = () => {
    setWalkthroughStep(prev => prev + 1);
  };

  const handleReplayTour = () => {
    setWalkthroughStep(0);
    setShowWalkthrough(true);
  };

  const handleLooksGood = () => {
    // if (!isVCVerified) {
    //   setShowVerificationError(true);
    // } else {
    //   handlePublish();
    // }
    handlePublish();
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
  const [modalStep, setModalStep] = useState<'main' | 'options' | 'time' | 'chat'>('main');
  const [tempExcludedHours, setTempExcludedHours] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  const handleOpenControl = () => {
    setModalStep('main');
    setChatInput("");
    setChatResponse("");
    // Initialize temp excluded hours from current state
    const currentExcluded = excludedSlotIds.map(id => {
      const entry = Object.entries(HOUR_TO_SLOT_ID).find(([_, slotId]) => slotId === id);
      return entry ? entry[0] : null;
    }).filter(Boolean) as string[];
    setTempExcludedHours(currentExcluded);
    setShowControlModal(true);
  };

  const handleOptionSelect = (option: string) => {
    if (option === 'pause') {
      setIsPaused(true);
      setShowControlModal(false);
    } else if (option === 'time') {
      setModalStep('time');
    } else if (option === 'talk') {
      setModalStep('chat');
    }
  };

  const toggleTempHour = (hour: string) => {
    setTempExcludedHours(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  // Process natural language commands
  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Pause all trades
    if (lowerCommand.includes('pause all') || lowerCommand.includes('stop all')) {
      setIsPaused(true);
      setChatResponse("✓ All trades paused for tomorrow. No energy will be sold.");
      return;
    }
    
    // Resume trades
    if (lowerCommand.includes('resume') || lowerCommand.includes('unpause')) {
      setIsPaused(false);
      setExcludedSlotIds([]);
      setChatResponse("✓ All trades resumed! Your full trading plan is active.");
      return;
    }
    
    // Don't sell between X and Y (handles "1 and 3 PM", "1 PM and 3 PM", "13 and 15")
    const betweenMatch = lowerCommand.match(/(?:don'?t|do not|no)\s+sell\s+(?:between\s+)?(\d{1,2})\s*(?:am|pm)?\s*(?:and|to|-)\s*(\d{1,2})\s*(am|pm)?/i);
    if (betweenMatch) {
      let startHour = parseInt(betweenMatch[1]);
      let endHour = parseInt(betweenMatch[2]);
      const period = betweenMatch[3]?.toLowerCase();
      
      // If PM is mentioned and hours are 1-12, convert to 24h format for processing
      if (period === 'pm') {
        if (startHour < 12) startHour += 12;
        if (endHour < 12) endHour += 12;
      }
      
      const hoursToExclude: string[] = [];
      
      for (let h = startHour; h < endHour; h++) {
        // Convert 24h back to 12h format with AM/PM for slot lookup
        let hourKey: string;
        if (h < 12) {
          hourKey = `${h === 0 ? 12 : h} AM`;
        } else if (h === 12) {
          hourKey = "12 PM";
        } else {
          hourKey = `${h - 12} PM`;
        }
        
        if (HOUR_TO_SLOT_ID[hourKey]) {
          hoursToExclude.push(HOUR_TO_SLOT_ID[hourKey]);
        }
      }
      
      setExcludedSlotIds(prev => [...new Set([...prev, ...hoursToExclude])]);
      const displayStart = startHour > 12 ? `${startHour - 12} PM` : startHour === 12 ? '12 PM' : `${startHour} AM`;
      const displayEnd = endHour > 12 ? `${endHour - 12} PM` : endHour === 12 ? '12 PM' : `${endHour} AM`;
      setChatResponse(`✓ Won't sell between ${displayStart} and ${displayEnd}. ${hoursToExclude.length} time slots excluded.`);
      return;
    }
    
    // Price threshold - only sell if price > X
    const priceMatch = lowerCommand.match(/price\s*>\s*[₹]?(\d+(?:\.\d+)?)/);
    if (priceMatch) {
      const minPrice = parseFloat(priceMatch[1]);
      const slotsToExclude = BASE_TIME_SLOTS.filter(slot => slot.rate < minPrice).map(slot => slot.id);
      setExcludedSlotIds(prev => [...new Set([...prev, ...slotsToExclude])]);
      const removedCount = slotsToExclude.length;
      setChatResponse(`✓ Only selling when price > ₹${minPrice}. ${removedCount} lower-rate slots excluded.`);
      return;
    }
    
    // Guests/evening - exclude afternoon slots
    if (lowerCommand.includes('guest') || lowerCommand.includes('evening')) {
      const afternoonSlots = ["2PM", "3PM", "4PM", "5PM"];
      setExcludedSlotIds(prev => [...new Set([...prev, ...afternoonSlots.filter(id => HOUR_TO_SLOT_ID[Object.keys(HOUR_TO_SLOT_ID).find(k => HOUR_TO_SLOT_ID[k] === id) || ""])])]);
      setChatResponse("✓ Afternoon/evening slots paused. You'll have full power for your guests!");
      return;
    }
    
    setChatResponse("I understood your request. Let me adjust your trading plan accordingly.");
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    processCommand(chatInput);
  };

  const handleChipClick = (chip: string) => {
    setChatInput(chip);
    processCommand(chip);
  };

  const handleConfirmTimeChanges = () => {
    // Convert temp excluded hours to slot IDs and apply
    const newExcludedSlotIds = tempExcludedHours
      .map(hour => HOUR_TO_SLOT_ID[hour])
      .filter(Boolean);
    setExcludedSlotIds(newExcludedSlotIds);
    setShowControlModal(false);
  };

  const handleConfirmChatChanges = () => {
    setShowControlModal(false);
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

        {/* Narration content for voice readout */}
        {/* Header with Back button, Logo and date */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-muted transition-colors"
              >
                <ArrowLeft size={16} className="text-foreground" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">All set for tomorrow</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">{tomorrowFormatted}</p>
                <button 
                  onClick={handleReplayTour}
                  className="flex items-center gap-1 text-2xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <HelpCircle size={10} />
                  <span>Tour</span>
                </button>
                {/* Dev toggle for testing auto mode */}
                <button
                  onClick={toggleAutoMode}
                  className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  title="Toggle auto mode for testing"
                >
                  [{isAutoMode ? "Auto" : "Recommend"}]
                </button>
              </div>
            </div>
          </div>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Voice Narration Control - Auto-plays on first visit */}
        <VoiceNarration 
          content={isAutoMode 
            ? `कल के लिए आपका सोलर ट्रेडिंग प्लान तैयार है। कुल अनुमानित कमाई ${totalEarnings} रुपये है, ${Math.round(totalUnits)} किलोवाट घंटे बिजली बेचकर। ${activeTimeSlots.length} ट्रेड प्लान किए गए हैं। चूंकि आपने ऑटो-सेल चुना है, ये ट्रेड 2 घंटे में अपने आप मार्केट में पोस्ट हो जाएंगे। आप चाहें तो अभी अप्रूव कर सकते हैं या उससे पहले बदलाव कर सकते हैं।`
            : `कल के लिए आपका सोलर ट्रेडिंग प्लान तैयार है। कुल अनुमानित कमाई ${totalEarnings} रुपये है, ${Math.round(totalUnits)} किलोवाट घंटे बिजली बेचकर। ${activeTimeSlots.length} ट्रेड प्लान किए गए हैं। अगर आप सहमत हैं तो लुक्स गुड बटन दबाएं और समाई कल आपके लिए ट्रेडिंग संभाल लेगा। बदलाव करने के लिए चेंज बटन दबाएं।`
          }
          autoPlay={true}
          storageKey="samai_prepared_narration_played"
          onSpeechComplete={handleNarrationComplete}
          className="animate-fade-in"
        />

        {/* Earnings Summary Card - with color gradient */}
        <div 
          ref={earningsRef}
          className={`rounded-xl border border-border shadow-card overflow-hidden animate-scale-in ${!isVCVerified ? 'opacity-70' : ''}`}
        >
          <div className="p-4 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5">
            <p className="text-xs text-muted-foreground text-center">Expected Earnings</p>
            <div className="text-center py-2">
              <p className="text-3xl font-semibold text-foreground tracking-tight">₹{totalEarnings}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{Math.round(totalUnits)} kWh</p>
            </div>
          </div>
          
          {/* Green Energy Bar - light green background */}
          <div className="bg-accent/15 px-3 py-1.5 flex items-center justify-center gap-1.5 border-t border-accent/20">
            <Leaf className="text-accent" size={12} />
            <span className="text-xs font-medium text-accent">100% Solar</span>
          </div>
        </div>

        {/* Time Slots */}
        <div ref={timeSlotsRef} className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Planned Trades</p>
              {/* Non-closable countdown */}
              <div ref={refreshTimerRef} className="flex items-center gap-1 text-2xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                <RefreshCw size={9} />
                <span>Refreshes in {countdown}</span>
              </div>
            </div>
            
            {/* Paused banner */}
            {isPaused && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pause size={14} className="text-amber-600" />
                    <p className="text-xs font-medium text-amber-800">All trades paused</p>
                  </div>
                  <button 
                    onClick={() => setIsPaused(false)}
                    className="text-2xs text-amber-700 hover:text-amber-900 font-medium"
                  >
                    Resume
                  </button>
                </div>
              </div>
            )}

            {/* Empty state when all slots excluded */}
            {!isPaused && activeTimeSlots.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No trades planned</p>
                <button 
                  onClick={() => setExcludedSlotIds([])}
                  className="text-xs text-primary mt-2 hover:underline"
                >
                  Reset exclusions
                </button>
              </div>
            )}

            <div className="space-y-0">
              {activeTimeSlots.map((slot, index) => (
                <div 
                  key={slot.id}
                  className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${slot.isBatteryPowered ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary/6'}`}>
                      {slot.isBatteryPowered ? (
                        <Battery size={12} className="text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Clock size={12} className="text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium text-foreground">{slot.time}</p>
                        <Zap size={9} className="text-accent" />
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-2xs text-muted-foreground">
                          {slot.kWh} kWh · ₹{slot.rate.toFixed(2)}/unit
                        </p>
                        {slot.isBatteryPowered && (
                          <span className="text-2xs text-amber-600 dark:text-amber-400 font-medium">
                            · Battery
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">₹{slot.earnings}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <MoreVertical size={14} className="text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem 
                          onClick={() => {
                            setChatInput(`Edit trade at ${slot.time}`);
                            handleOpenControl();
                          }}
                          className="text-xs"
                        >
                          <Pencil size={12} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setExcludedSlotIds(prev => [...prev, slot.id]);
                          }}
                          className="text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 size={12} className="mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Note - only show if there are active trades */}
            {activeTimeSlots.length > 0 && (
              <div className="flex items-center gap-1.5 pt-2 mt-1">
                <TrendingUp size={10} className="text-accent flex-shrink-0" />
                <p className="text-2xs text-muted-foreground">
                  Prices may improve as demand updates.
                </p>
              </div>
            )}
          </div>

          {/* Auto-mode countdown banner */}
          {isAutoMode && (
            <div 
              ref={autoCountdownRef}
              className="mx-3 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <Timer size={14} className="text-amber-600" />
                <p className="text-xs font-medium text-amber-800">Auto-posting in {formatAutoCountdown(autoCountdownSeconds)}</p>
              </div>
              <p className="text-2xs text-amber-700">
                These trades will be posted to the market automatically. Approve now to post immediately, or make changes before then.
              </p>
            </div>
          )}

          {/* Actions inside the card */}
          <div className="flex gap-2 p-3 pt-0">
            <button ref={looksGoodRef} onClick={handleLooksGood} className="btn-solar flex-1 !py-2.5 text-sm">
              {isAutoMode ? "Approve Now" : "Looks good"}
            </button>
            <button ref={changeRef} onClick={handleOpenControl} className="btn-outline-calm flex-1 flex items-center justify-center gap-1.5 !py-2.5 text-sm">
              <span>Change</span>
            </button>
          </div>
        </div>

        {/* Confirmed Trades - only show if user has confirmed trades */}
        {hasConfirmedTrades && (
          <ConfirmedTradesCard 
            trades={CONFIRMED_TRADES}
            className="animate-slide-up"
            style={{ animationDelay: "0.1s" }}
            innerRef={confirmedRef}
          />
        )}
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
              {/* Response feedback */}
              {chatResponse && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl animate-fade-in">
                  <p className="text-sm text-foreground">{chatResponse}</p>
                  <button
                    onClick={() => setShowControlModal(false)}
                    className="mt-2 w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Talk to Samai section - only show if no response yet */}
              {!chatResponse && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Talk to Samai</p>
                  <p className="text-xs text-muted-foreground mb-3">Try saying:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTION_CHIPS.map((chip, index) => (
                      <button
                        key={index}
                        onClick={() => handleChipClick(chip)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action to show options - only show if no response yet */}
              {!chatResponse && (
                <button
                  onClick={() => setModalStep('options')}
                  className="w-full text-xs text-primary text-left hover:underline"
                >
                  Or choose from options →
                </button>
              )}
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
                  const isExcluded = tempExcludedHours.includes(hour);
                  return (
                    <button
                      key={hour}
                      onClick={() => toggleTempHour(hour)}
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
                onClick={handleConfirmTimeChanges}
                className="btn-green w-full !py-3 flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Confirm changes</span>
              </button>
            </div>
          )}

          {/* Chat step for natural language input */}
          {modalStep === 'chat' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Talk to Samai</p>
                <button onClick={() => setModalStep('options')} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Try these suggestions or type your own:
              </p>

              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map((chip, index) => (
                  <button
                    key={index}
                    onClick={() => handleChipClick(chip)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      chatInput === chip 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border bg-card hover:bg-secondary'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Or type your request..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleChatSubmit}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                >
                  Send
                </button>
              </div>

              {chatResponse && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm text-foreground">{chatResponse}</p>
                </div>
              )}

              {chatResponse && (
                <button
                  onClick={handleConfirmChatChanges}
                  className="btn-green w-full !py-3 flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Done</span>
                </button>
              )}
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
                onClick={() => {
                  setShowVerificationError(false);
                  setUserData({ isVCVerified: false });
                  navigate("/home", { state: { isVCVerified: false } });
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
              >
                I'll do this later
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Walkthrough Overlay */}
      {showWalkthrough && (
        <WalkthroughOverlay
          steps={walkthroughSteps}
          currentStep={walkthroughStep}
          onNext={handleWalkthroughNext}
          onSkip={handleWalkthroughSkip}
          onComplete={handleWalkthroughComplete}
        />
      )}
    </div>
  );
};

export default PreparedTomorrowScreen;
