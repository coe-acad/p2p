import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Clock, TrendingUp, Zap, RefreshCw, Check, Pause, Sliders, MessageCircle, X, ArrowLeft, Battery, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format, addDays, parse } from "date-fns";
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


const SESSION_APPROVED_KEY = "samai_session_approved";
const PREPARED_EXCLUSIONS_KEY = "samai_prepared_excluded_slot_ids";
const PREPARED_PAUSED_KEY = "samai_prepared_trades_paused";
const APPROVAL_TTL_MS = 3 * 60 * 60 * 1000;

// Already confirmed/matched trades that won't be refreshed
const CONFIRMED_TRADES = [
  { time: "10:00 AM – 11:00 AM", kWh: 3, rate: 6.50, earnings: 20, buyer: "GridCo" },
  { time: "3:00 PM – 4:00 PM", kWh: 4, rate: 6.25, earnings: 25, buyer: "TPDDL" },
];

 const toISOTimeRange = (timeRange: string, targetDate: Date) => {
  // Example input: "10:00 AM – 11:00 AM"
  const [start, end] = timeRange.split("–").map(t => t.trim());

  const startDate = parse(start, "h:mm a", targetDate);
  const endDate = parse(end, "h:mm a", targetDate);

  return {
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  };
};

interface PreparedTomorrowScreenProps {
  hasConfirmedTrades?: boolean;
  onLooksGood: () => void;
  onViewAdjust: () => void;
  onTalkToSamai: () => void;
  onBack?: () => void;
}

// Base time slots - will be filtered based on user choices
// isBatteryPowered indicates if battery discharge is providing the energy (for evening/night)
// Base time slots configured for ₹185 total: 5+6+5+5+4+4 = 29 kWh @ ~₹6.38 avg
const BASE_TIME_SLOTS = [
  { id: "10AM", time: "10:00 AM – 11:00 AM", kWh: 5, rate: 6.30, isBatteryPowered: false },
  { id: "11AM", time: "11:00 AM – 12:00 PM", kWh: 6, rate: 6.35, isBatteryPowered: false },
  { id: "12PM", time: "12:00 PM – 1:00 PM", kWh: 5, rate: 6.40, isBatteryPowered: false },
  { id: "1PM", time: "1:00 PM – 2:00 PM", kWh: 5, rate: 6.45, isBatteryPowered: false },
  { id: "2PM", time: "2:00 PM – 3:00 PM", kWh: 4, rate: 6.50, isBatteryPowered: false },
  { id: "5PM", time: "5:00 PM – 6:00 PM", kWh: 4, rate: 6.55, isBatteryPowered: true },
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
  hasConfirmedTrades = false,
  onLooksGood, 
  onTalkToSamai,
  onBack 
}: PreparedTomorrowScreenProps) => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  const { publishTrades, updatePlannedTrades, tradesData, setTradesData } = usePublishedTrades();
  
  // Reset approval state when user makes changes
  const resetApprovalState = () => {
    if (tradesData.isPublished) {
      setTradesData({ isPublished: false });
      sessionStorage.removeItem(SESSION_APPROVED_KEY);
    }
  };

  // Auto-reset approval state after TTL
  useEffect(() => {
    if (!tradesData.isPublished || !tradesData.publishedAt) return;
    const publishedAtMs = Date.parse(tradesData.publishedAt);
    if (Number.isNaN(publishedAtMs)) return;

    const elapsed = Date.now() - publishedAtMs;
    const remaining = APPROVAL_TTL_MS - elapsed;

    if (remaining <= 0) {
      setTradesData({ isPublished: false });
      sessionStorage.removeItem(SESSION_APPROVED_KEY);
      return;
    }

    const timer = setTimeout(() => {
      setTradesData({ isPublished: false });
      sessionStorage.removeItem(SESSION_APPROVED_KEY);
    }, remaining);

    return () => clearTimeout(timer);
  }, [tradesData.isPublished, tradesData.publishedAt, setTradesData]);
  const isAutoMode = userData.automationLevel === "auto";
  
  // State for excluded hours + pause state (persisted until sign out)
  const [excludedSlotIds, setExcludedSlotIds] = useState<string[]>(() => {
    // Prefer explicitly persisted exclusions
    const stored = localStorage.getItem(PREPARED_EXCLUSIONS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(v => typeof v === "string")) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }

    // Back-compat: if we already have a persisted plan, infer exclusions from it
    if (tradesData.plannedTrades.length > 0) {
      const plannedIds = new Set(tradesData.plannedTrades.map(t => t.id));
      return BASE_TIME_SLOTS.filter(slot => !plannedIds.has(slot.id)).map(slot => slot.id);
    }

    return [];
  });

  const [isPaused, setIsPaused] = useState(() => {
    const stored = localStorage.getItem(PREPARED_PAUSED_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return false;
  });

  useEffect(() => {
    localStorage.setItem(PREPARED_EXCLUSIONS_KEY, JSON.stringify(excludedSlotIds));
  }, [excludedSlotIds]);

  useEffect(() => {
    localStorage.setItem(PREPARED_PAUSED_KEY, String(isPaused));
  }, [isPaused]);

  // Dev toggle for testing auto mode
  const toggleAutoMode = () => {
    setUserData({ 
      automationLevel: isAutoMode ? "recommend" : "auto" 
    });
  };
  
  // Calculate active time slots (not excluded and not paused)
  const activeTimeSlots = isPaused ? [] : BASE_TIME_SLOTS.filter(
    slot => !excludedSlotIds.includes(slot.id)
  ).map(slot => ({
    ...slot,
    earnings: calculateEarnings(slot.kWh, slot.rate)
  }));
  
  // Sync active trades to the hook whenever they change (for cross-page consistency)
  useEffect(() => {
    // Compute slots inside effect to avoid dependency on activeTimeSlots (which changes every render)
    const slotsToSync = isPaused ? [] : BASE_TIME_SLOTS.filter(
      slot => !excludedSlotIds.includes(slot.id)
    ).map(slot => ({
      id: slot.id,
      time: slot.time,
      kWh: slot.kWh,
      rate: slot.rate,
      isBatteryPowered: slot.isBatteryPowered,
    }));
    updatePlannedTrades(slotsToSync);
  }, [excludedSlotIds, isPaused, updatePlannedTrades]);

  const postTradesToBackend = async (slots: typeof activeTimeSlots) => {
  const tomorrow = addDays(new Date(), 1);

  const trades = slots.map(slot => {
    const { startTime, endTime } = toISOTimeRange(slot.time, tomorrow);

    return {
      startTime,
      endTime,
      price: slot.rate,
      kWh: slot.kWh,
    };
  });

  const payload = {
    trades,
    date: format(tomorrow, "yyyy-MM-dd"),
    source: "prepared_tomorrow_screen",
  };

  try {
    const API_URL = "https://atria-bbp.atriauniversity.ai/api/create";

    const res = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});


    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Trade post failed:", err);
    throw err;
  }
};

  
  // Handler for publishing trades (persists to localStorage)
  const handlePublish = async () => {
  if (activeTimeSlots.length === 0) {
    console.log("No active trades to approve — skipping publish");
    return;
  }

  try {
    // 1. Send to backend
    await postTradesToBackend(activeTimeSlots);

    // 2. Existing session logic
    sessionStorage.setItem(SESSION_APPROVED_KEY, "true");

    // 3. Keep your current local persistence
    void publishTrades(
      activeTimeSlots.map(slot => ({
        id: slot.id,
        time: slot.time,
        kWh: slot.kWh,
        rate: slot.rate,
        isBatteryPowered: slot.isBatteryPowered,
      }))
    );

    // 4. Continue existing flow
    onLooksGood();

  } catch (err) {
    // Optional: show UI error toast here
    alert("Failed to publish trades. Please try again.");
  }
};

  
  // Calculate totals dynamically from active slots
  const plannedUnits = activeTimeSlots.reduce((sum, slot) => sum + slot.kWh, 0);
  const plannedEarnings = activeTimeSlots.reduce((sum, slot) => sum + slot.earnings, 0);
  const confirmedUnits = hasConfirmedTrades ? CONFIRMED_TRADES.reduce((sum, slot) => sum + slot.kWh, 0) : 0;
  const confirmedEarnings = hasConfirmedTrades ? CONFIRMED_TRADES.reduce((sum, slot) => sum + slot.earnings, 0) : 0;
  const totalUnits = plannedUnits + confirmedUnits;
  const totalEarnings = plannedEarnings + confirmedEarnings;
  
  const tomorrow = addDays(new Date(), 1);
  const handleLooksGood = () => {
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
          content={`कल के लिए आपका सोलर ट्रेडिंग प्लान तैयार है। कुल अनुमानित कमाई ${totalEarnings} रुपये है, ${Math.round(totalUnits)} किलोवाट घंटे बिजली बेचकर। ${activeTimeSlots.length} ट्रेड प्लान किए गए हैं। अगर आप सहमत हैं तो अप्रूव नाउ बटन दबाएं और समाई कल आपके लिए ट्रेडिंग संभाल लेगा। बदलाव करने के लिए चेंज बटन दबाएं।`}
          autoPlay={true}
          storageKey="samai_prepared_narration_played"
          className="animate-fade-in"
        />

        {/* Earnings Summary Card - with color gradient */}
        <div className="rounded-xl border border-border shadow-card overflow-hidden animate-scale-in">
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
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Planned Trades</p>
              {/* Non-closable countdown */}
              <div className="flex items-center gap-1 text-2xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
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
                            resetApprovalState();
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
                            resetApprovalState();
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

          {/* Actions inside the card */}
          <div className="flex gap-2 p-3 pt-0">
            {tradesData.isPublished ? (
              <>
                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-accent/15 border border-accent/30">
                  <Check size={16} className="text-accent" />
                  <span className="text-sm font-medium text-accent">Approved</span>
                </div>
                <button onClick={() => { resetApprovalState(); handleOpenControl(); }} className="btn-outline-calm flex-1 flex items-center justify-center gap-1.5 !py-2.5 text-sm">
                  <span>Change</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLooksGood}
                  disabled={activeTimeSlots.length === 0}
                  className={`btn-solar flex-1 !py-2.5 text-sm ${activeTimeSlots.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Approve Now
                </button>
                <button onClick={() => { resetApprovalState(); handleOpenControl(); }} className="btn-outline-calm flex-1 flex items-center justify-center gap-1.5 !py-2.5 text-sm">
                  <span>Change</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Confirmed Trades - only show if user has confirmed trades */}
        {hasConfirmedTrades && (
          <ConfirmedTradesCard 
            trades={CONFIRMED_TRADES}
            className="animate-slide-up"
            style={{ animationDelay: "0.1s" }}
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

    </div>
  );
};

export default PreparedTomorrowScreen;
