import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Send } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import MainAppShell from "@/components/layout/MainAppShell";

const AskSamaiPage = () => {
  const { t } = useTranslation();
  const { userData } = useUserData();
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
    <MainAppShell contentClassName="lg:py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-6.5rem)] w-full max-w-5xl flex-col overflow-hidden bg-background lg:min-h-[calc(100dvh-3rem)] lg:rounded-[2rem] lg:border lg:border-border/50 lg:bg-white/55 lg:shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] lg:backdrop-blur-sm">
      {/* Chat Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4 pt-6 sm:px-5 lg:px-8 lg:pb-6 lg:pt-8">
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
      </div>
    </MainAppShell>
  );
};

export default AskSamaiPage;
