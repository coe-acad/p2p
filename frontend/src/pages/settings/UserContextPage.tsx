import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { useState } from "react";

const UserContextPage = () => {
  const navigate = useNavigate();
  const [context, setContext] = useState(
    "I work from home most days and prefer to use my solar power during peak hours. I'd like to sell excess energy in the morning when rates are better."
  );

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <div className="w-full max-w-md flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button 
            onClick={() => navigate("/profile")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Your Context</h1>
        </div>

        {/* Description */}
        <div className="flex items-start gap-3 animate-slide-up">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageSquare size={14} className="text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">
            Help Samai understand your energy habits and preferences. This context helps personalize recommendations.
          </p>
        </div>

        {/* Text Area */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Tell Samai about your energy usage patterns, work schedule, preferences..."
            className="w-full h-32 text-sm text-foreground bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/50"
          />
          <div className="flex justify-end mt-2">
            <span className="text-[10px] text-muted-foreground">{context.length}/500</span>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-muted/50 rounded-xl p-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-xs font-medium text-foreground mb-2">Tips for better context:</p>
          <ul className="text-[11px] text-muted-foreground space-y-1">
            <li>• Your typical work hours and schedule</li>
            <li>• When you use the most electricity</li>
            <li>• Any specific selling/buying preferences</li>
          </ul>
        </div>

        {/* Save Button */}
        <button
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          Save Context
        </button>
      </div>
    </div>
  );
};

export default UserContextPage;
