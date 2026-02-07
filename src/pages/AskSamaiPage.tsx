import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mic, Send, Wallet } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";
import chatbotIcon from "@/assets/chatbot-icon.png";
import { useUserData } from "@/hooks/useUserData";

type TabType = "chat" | "home" | "statements";

const AskSamaiPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const userName = userData.name?.split(" ")[0] || "User";

  // Suggestion pills matching the screenshot
  const suggestions = [
    "Pause selling tomorrow",
    "Don't sell between 9 AM to 3 PM",
    "Only sell if price is above ₹6",
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: inputValue }]);
    setInputValue("");
    
    // Simulate assistant response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I understand! I'll update your preferences accordingly. Is there anything else you'd like me to help with?" 
      }]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col bg-background">
      {/* Chat Content Area */}
      <div className="flex-1 flex flex-col px-4 pt-6 pb-4 overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-auto">
          {messages.length === 0 ? (
            /* Initial greeting state */
            <div className="space-y-4">
              {/* Greeting */}
              <p className="text-lg font-medium text-foreground leading-relaxed">
                Hi {userName}! I'm Samai. How can I help you today?
              </p>
              
              {/* Suggestion pills */}
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2.5 bg-card border border-border rounded-full text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat messages */
            <div className="space-y-4">
              {/* Initial greeting always shown */}
              <p className="text-lg font-medium text-foreground leading-relaxed">
                Hi {userName}! I'm Samai. How can I help you today?
              </p>
              
              {/* Suggestion pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2.5 bg-card border border-border rounded-full text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              {/* Message list */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Input bar - fixed at bottom of content area */}
        <div className="flex-shrink-0 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 bg-card rounded-full p-1.5 border border-border">
            {/* Mic button */}
            <button
              onClick={() => setIsListening(!isListening)}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isListening 
                  ? "bg-primary/20 text-primary" 
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic size={20} />
            </button>
            
            {/* Text input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask Samai anything..."
              className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none"
            />
            
            {/* Send button */}
            <button
              onClick={handleSendMessage}
              className="w-10 h-10 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send size={16} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

// Bottom Navigation Component
const BottomNav = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: TabType) => void }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-around py-2 bg-card/90 backdrop-blur-sm border-t border-border/30">
      {/* Ask Samai - Left - Active with border */}
      <button
        onClick={() => onTabChange("chat")}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
          activeTab === "chat" 
            ? "bg-primary/10 border-2 border-primary text-primary" 
            : "text-muted-foreground hover:text-foreground border-2 border-transparent"
        }`}
      >
        <img src={chatbotIcon} alt="Samai" className="w-6 h-6" />
        <span className={`text-[10px] font-medium ${activeTab === "chat" ? "text-primary" : ""}`}>
          {t("nav.askSamai")}
        </span>
      </button>
      
      {/* Home - Center with bigger rotating Logo (no caption) - 20% bigger */}
      <button
        onClick={() => {
          navigate("/home");
          onTabChange("home");
        }}
        className={`flex items-center justify-center px-4 py-1 transition-colors ${
          activeTab === "home" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <div className="w-12 h-12 animate-spin-slow flex items-center justify-center">
          <SamaiLogo size="sm" showText={false} />
        </div>
      </button>
      
      {/* Payments - Right */}
      <button
        onClick={() => {
          navigate("/payments");
          onTabChange("statements");
        }}
        className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
          activeTab === "statements" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Wallet size={20} />
        <span className={`text-[10px] font-medium ${activeTab === "statements" ? "text-primary" : ""}`}>
          {t("nav.payments")}
        </span>
      </button>
    </div>
  );
};

export default AskSamaiPage;
