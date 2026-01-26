import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, User, AlertTriangle, ShieldCheck, X, Sparkles, Plane, CalendarClock } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";
import chatbotIcon from "@/assets/chatbot-icon.png";
import { useUser } from "@/hooks/use-user";
import { useForecast } from "@/hooks/use-forecast";

type TabType = "chat" | "home" | "statements";
type TomorrowStatus = "not_published" | "published_confirmed" | "published_pending";
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVCVerified = location.state?.isVCVerified ?? true;
  const { user, sessionValid } = useUser();
  const userName = useMemo(() => user?.name || "there", [user]);
  const userRole = useMemo(() => user?.role || localStorage.getItem("samai_user_role") || "", [user]);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const { forecastWindows, refetch: refetchForecast } = useForecast();
  const forecastTotals = useMemo(() => {
    if (!forecastWindows.length) return null;
    const totalUnits = forecastWindows.reduce((sum, window) => sum + (window.total_units || 0), 0);
    const totalEarnings = forecastWindows.reduce((sum, window) => sum + (window.expected_total || 0), 0);
    return {
      totalUnits: Number(totalUnits.toFixed(2)),
      totalEarnings: Number(totalEarnings.toFixed(2)),
    };
  }, [forecastWindows]);
  
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [dismissedNudges, setDismissedNudges] = useState<string[]>([]);
  
  // Demo state - in real app would come from backend
  const [tomorrowStatus] = useState<TomorrowStatus>("published_confirmed");
  const tomorrowData = { units: 12.5, earnings: 187 };

  const dismissNudge = (id: string) => {
    setDismissedNudges([...dismissedNudges, id]);
  };

  const nudges = [
    { id: "holiday", text: "Going on a holiday?", icon: Plane },
    { id: "event", text: "Any upcoming events?", icon: CalendarClock },
  ].filter(n => !dismissedNudges.includes(n.id));

  const renderHomeContent = () => (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden">
      {/* Warning Banner */}
      {!isVCVerified && (
        <div className="flex items-center gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-xl animate-slide-up">
          <AlertTriangle className="text-destructive flex-shrink-0" size={16} />
          <p className="text-xs text-foreground flex-1">Complete DISCOM verification to start trading</p>
          <button onClick={() => navigate("/onboarding/location")} className="p-1.5 bg-primary/10 rounded-lg">
            <ShieldCheck size={14} className="text-primary" />
          </button>
        </div>
      )}

      {/* Section 1: Earnings Snapshot */}
      <div className="bg-card rounded-xl p-3 shadow-card animate-slide-up">
        <p className="text-xs font-medium text-muted-foreground mb-2">Earnings</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-lg font-bold text-foreground">₹{isVCVerified ? "127" : "0"}</p>
            <p className="text-xs text-muted-foreground">{isVCVerified ? "8.5" : "0"} kWh</p>
          </div>
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="text-lg font-bold text-primary">₹{isVCVerified ? "2,847" : "0"}</p>
            <p className="text-xs text-muted-foreground">{isVCVerified ? "189" : "0"} kWh</p>
          </div>
        </div>
      </div>

      {/* Section 2: Tomorrow's Status Card */}
      <div className="bg-card rounded-xl p-3 shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <p className="text-xs font-medium text-muted-foreground mb-2">Tomorrow</p>
        
        {!isVCVerified ? (
          <div className="text-center py-3">
            <p className="text-sm text-muted-foreground">Complete verification to start trading</p>
          </div>
        ) : tomorrowStatus === "not_published" ? (
          <div className="space-y-2">
            <p className="text-sm text-foreground">Prepared to sell your excess energy for tomorrow</p>
            <button 
              onClick={() => navigate("/prepared", { state: { isVCVerified } })}
              className="btn-solar w-full text-sm !py-2"
            >
              Publish now
            </button>
          </div>
        ) : tomorrowStatus === "published_confirmed" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-accent/10 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Selling tomorrow</p>
                <p className="text-base font-bold text-foreground">
                  {forecastTotals?.totalUnits ?? tomorrowData.units} kWh • ₹{forecastTotals?.totalEarnings ?? tomorrowData.earnings}
                </p>
              </div>
              <span className="text-xs text-accent bg-accent/20 px-2 py-0.5 rounded-full">Confirmed</span>
            </div>
            <button 
              onClick={handleViewDetails}
              className="btn-outline-calm w-full text-sm !py-2"
            >
              {isForecastLoading ? "Loading..." : "View details"}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-2.5 bg-muted/50 rounded-lg">
              <p className="text-sm text-foreground">No buyers confirmed yet</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Samai is still looking <span>👀</span>
              </p>
              <p className="text-xs text-primary mt-1">Prices may improve</p>
            </div>
            <button 
              onClick={handleViewDetails}
              className="btn-outline-calm w-full text-sm !py-2"
            >
              {isForecastLoading ? "Loading..." : "View details"}
            </button>
          </div>
        )}
      </div>

      {/* Section 3: Gentle Nudges */}
      {nudges.length > 0 && isVCVerified && (
        <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {nudges.map((nudge) => {
            const Icon = nudge.icon;
            return (
              <div 
                key={nudge.id}
                className="bg-card rounded-xl p-3 shadow-card flex items-center justify-between"
              >
                <button 
                  onClick={() => setActiveTab("chat")}
                  className="flex items-center gap-2.5 text-left flex-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <p className="text-sm text-foreground">{nudge.text}</p>
                </button>
                <button 
                  onClick={() => dismissNudge(nudge.id)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-card rounded-xl p-3 shadow-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Action logs</p>
            <p className="text-xs text-muted-foreground">View live on_select/on_init/on_confirm events</p>
          </div>
          <button
            onClick={() => navigate("/action-logs")}
            className="btn-outline-calm text-xs px-3 py-1.5"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );

  const renderChatContent = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatScreen userName={userName} />
    </div>
  );

  const renderStatementsContent = () => (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden">
      <StatementsScreen isVCVerified={isVCVerified} />
    </div>
  );

  useEffect(() => {
    if (!sessionValid) {
      localStorage.removeItem("samai_user_id");
      localStorage.removeItem("samai_user_role");
      localStorage.removeItem("samai_last_login");
      navigate("/returning");
      return;
    }
  }, [navigate, sessionValid, user]);

  const handleViewDetails = async () => {
    if (isForecastLoading) return;
    try {
      setIsForecastLoading(true);
      let windows = forecastWindows;
      if (!windows.length) {
        const result = await refetchForecast();
        windows = result.data?.data?.forecast_windows || [];
      }
      if (!windows.length) {
        alert("Could not load forecast. Please try again.");
        return;
      }
      navigate("/prepared", { state: { isVCVerified, forecastWindows: windows } });
    } catch (error) {
      console.error("Forecast failed", error);
      alert("Could not load forecast. Please check your connection.");
    } finally {
      setIsForecastLoading(false);
    }
  };

  return (
    <div className="screen-container !justify-start !pt-4 !pb-0">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 animate-fade-in">
          <div>
            <p className="text-xs text-muted-foreground">{getGreeting()},</p>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">{userName}</h1>
              {userRole && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  {userRole}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SamaiLogo size="sm" showText={false} />
            <button 
              onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            >
              <User size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden pb-16">
          {activeTab === "home" && renderHomeContent()}
          {activeTab === "chat" && renderChatContent()}
          {activeTab === "statements" && renderStatementsContent()}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-3.5 py-0.5 flex justify-around items-center max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab("chat")}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors"
          >
            <img src={chatbotIcon} alt="Ask Samai" className="w-5 h-5" />
            <span className={`text-xs ${activeTab === "chat" ? "text-primary font-medium" : "text-foreground"}`}>Ask Samai</span>
          </button>
          <button 
            onClick={() => setActiveTab("home")}
            className="flex items-center justify-center px-4 py-1.5 transition-colors"
          >
            <div className="scale-[0.73]">
              <SamaiLogo size="md" showText={false} />
            </div>
          </button>
          <button 
            onClick={() => setActiveTab("statements")}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors"
          >
            <FileText size={20} className="text-foreground" />
            <span className={`text-xs ${activeTab === "statements" ? "text-primary font-medium" : "text-foreground"}`}>Statements</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Chat Screen Component
const ChatScreen = ({ userName }: { userName: string }) => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hi! I'm Samai. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setMessages((prev) => {
      if (!prev.length) return prev;
      const first = prev[0];
      if (first.role !== "assistant") return prev;
      const updated = { ...first, text: `Hi ${userName}! I'm Samai. How can I help you today?` };
      return [updated, ...prev.slice(1)];
    });
  }, [userName]);

  const suggestions = [
    "Pause selling tomorrow",
    "Don't sell between 9 AM to 3 PM",
    "Only sell if price is above ₹6",
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages([...messages, { role: "user", text }]);
    setInput("");
    
    // Simulate response
    setTimeout(() => {
      let response = "I understand. Let me help you with that.";
      if (text.toLowerCase().includes("pause")) {
        response = "Done! I've paused selling for tomorrow. You can resume anytime by telling me.";
      } else if (text.toLowerCase().includes("9 am") || text.toLowerCase().includes("3 pm")) {
        response = "Got it! I won't sell your energy between 9 AM and 3 PM. This will apply to all future trades.";
      } else if (text.toLowerCase().includes("₹6") || text.toLowerCase().includes("price")) {
        response = "Perfect! I'll only sell when the price is ₹6 or higher. I'll notify you when good prices are available.";
      }
      setMessages(prev => [...prev, { role: "assistant", text: response }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.map((msg, i) => (
          <div 
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] text-sm ${
                msg.role === "user" 
                  ? "px-3 py-2 rounded-xl bg-primary text-primary-foreground" 
                  : "text-foreground"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => handleSend(s)}
              className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1.5 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Ask Samai anything..."
          className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button 
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
          className="px-3 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
        >
          <Sparkles size={18} />
        </button>
      </div>
    </div>
  );
};

// Statements Screen Component
const StatementsScreen = ({ isVCVerified }: { isVCVerified: boolean }) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const monthlyData = isVCVerified ? [
    {
      month: "January 2026",
      totalUnits: 189,
      totalAmount: 2847,
      transactions: [
        { date: "Jan 24", time: "2:00 PM", units: 12.5, amount: 187 },
        { date: "Jan 23", time: "1:30 PM", units: 8.2, amount: 123 },
        { date: "Jan 22", time: "3:00 PM", units: 15.0, amount: 225 },
        { date: "Jan 21", time: "12:45 PM", units: 6.8, amount: 102 },
        { date: "Jan 20", time: "2:15 PM", units: 11.3, amount: 170 },
        { date: "Jan 19", time: "1:00 PM", units: 9.7, amount: 146 },
        { date: "Jan 18", time: "3:30 PM", units: 14.2, amount: 213 },
        { date: "Jan 17", time: "2:00 PM", units: 10.5, amount: 158 },
        { date: "Jan 16", time: "1:15 PM", units: 8.9, amount: 134 },
        { date: "Jan 15", time: "2:45 PM", units: 13.1, amount: 197 },
        { date: "Jan 14", time: "12:30 PM", units: 7.6, amount: 114 },
        { date: "Jan 13", time: "3:15 PM", units: 11.8, amount: 177 },
        { date: "Jan 12", time: "1:45 PM", units: 9.2, amount: 138 },
        { date: "Jan 11", time: "2:30 PM", units: 12.0, amount: 180 },
        { date: "Jan 10", time: "1:00 PM", units: 6.5, amount: 98 },
        { date: "Jan 9", time: "3:00 PM", units: 10.8, amount: 162 },
        { date: "Jan 8", time: "2:15 PM", units: 8.4, amount: 126 },
        { date: "Jan 7", time: "1:30 PM", units: 7.3, amount: 110 },
        { date: "Jan 6", time: "2:45 PM", units: 5.2, amount: 78 },
      ],
    },
    {
      month: "December 2025",
      totalUnits: 156,
      totalAmount: 2340,
      transactions: [
        { date: "Dec 31", time: "2:00 PM", units: 10.2, amount: 153 },
        { date: "Dec 30", time: "1:30 PM", units: 8.5, amount: 128 },
        { date: "Dec 29", time: "3:00 PM", units: 12.0, amount: 180 },
        { date: "Dec 28", time: "12:45 PM", units: 7.8, amount: 117 },
      ],
    },
  ] : [];

  return (
    <div className="space-y-3 overflow-y-auto max-h-full pb-4">
      <h2 className="text-base font-bold text-foreground">Statements</h2>
      
      {monthlyData.length === 0 ? (
        <div className="bg-card rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">No statements yet</p>
          <p className="text-xs text-muted-foreground mt-1">Complete verification to start trading</p>
        </div>
      ) : (
        <div className="space-y-2">
          {monthlyData.map((month) => (
            <div key={month.month} className="bg-card rounded-xl shadow-card overflow-hidden">
              {/* Month Header - Clickable */}
              <button
                onClick={() => setExpandedMonth(expandedMonth === month.month ? null : month.month)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{month.month}</p>
                  <p className="text-xs text-muted-foreground">{month.totalUnits} kWh sold</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-primary">₹{month.totalAmount.toLocaleString()}</p>
                  <svg 
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedMonth === month.month ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Transactions - Expandable */}
              {expandedMonth === month.month && (
                <div className="border-t border-border divide-y divide-border/50 max-h-60 overflow-y-auto">
                  {month.transactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-muted/20">
                      <div>
                        <p className="text-xs font-medium text-foreground">{tx.date}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.time} • {tx.units} kWh</p>
                      </div>
                      <p className="text-xs font-semibold text-accent">+₹{tx.amount}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
