import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

const MobileSettingsPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("+91 98765 43210"); // Current value
  const [isEditing, setIsEditing] = useState(false);

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
          <h1 className="text-lg font-bold text-foreground">Mobile Number</h1>
        </div>

        {/* Current Number */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up">
          <p className="text-xs text-muted-foreground mb-2">Registered mobile number</p>
          {isEditing ? (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-lg font-medium text-foreground bg-transparent border-b border-primary focus:outline-none pb-1"
              autoFocus
            />
          ) : (
            <p className="text-lg font-medium text-foreground">{phone}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Change Number
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Changing your number will require OTP verification
        </p>
      </div>
    </div>
  );
};

export default MobileSettingsPage;
