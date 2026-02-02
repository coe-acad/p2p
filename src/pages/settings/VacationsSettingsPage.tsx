import { useNavigate } from "react-router-dom";
import { ChevronLeft, GraduationCap, Sun, CalendarClock } from "lucide-react";
import { useState } from "react";
import { useUserData } from "@/hooks/useUserData";

const VacationsSettingsPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  
  const [schoolHolidays, setSchoolHolidays] = useState(userData.schoolHolidays || "");
  const [summerVacationStart, setSummerVacationStart] = useState(userData.summerVacationStart || "");
  const [summerVacationEnd, setSummerVacationEnd] = useState(userData.summerVacationEnd || "");
  const [upcomingEvents, setUpcomingEvents] = useState(userData.upcomingEvents || "");

  const handleSave = () => {
    setUserData({
      schoolHolidays,
      summerVacationStart,
      summerVacationEnd,
      upcomingEvents,
    });
    navigate("/profile");
  };

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
          <h1 className="text-lg font-bold text-foreground">Vacations & Holidays</h1>
        </div>

        {/* Description */}
        <div className="flex items-start gap-3 animate-slide-up">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CalendarClock size={14} className="text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">
            Let Samai know about your upcoming vacations and holidays. This helps optimize your energy trading during times when you're away.
          </p>
        </div>

        {/* School Holidays */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <GraduationCap size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">School Holidays</p>
              <p className="text-xs text-muted-foreground">e.g., March 15-30, Diwali break</p>
            </div>
          </div>
          <input
            type="text"
            value={schoolHolidays}
            onChange={(e) => setSchoolHolidays(e.target.value)}
            placeholder="Enter school holiday dates..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Summer Vacation */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Sun size={14} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Summer Vacation</p>
              <p className="text-xs text-muted-foreground">When will you be away this summer?</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
              <input
                type="date"
                value={summerVacationStart}
                onChange={(e) => setSummerVacationStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
              <input
                type="date"
                value={summerVacationEnd}
                onChange={(e) => setSummerVacationEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Other Events */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <CalendarClock size={14} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Other Upcoming Events</p>
              <p className="text-xs text-muted-foreground">Family functions, travel plans, etc.</p>
            </div>
          </div>
          <textarea
            value={upcomingEvents}
            onChange={(e) => setUpcomingEvents(e.target.value)}
            placeholder="Describe any other upcoming events or times you'll be away..."
            className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Info Note */}
        <div className="bg-muted/50 rounded-xl p-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-xs text-muted-foreground">
            💡 During vacations, Samai can maximize your solar selling since you'll likely use less energy at home.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          Save Vacation Dates
        </button>
      </div>
    </div>
  );
};

export default VacationsSettingsPage;

