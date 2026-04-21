import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useUserData } from "@/hooks/useUserData";
import PageContainer from "@/components/layout/PageContainer";

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUserData();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData.name || "");
  const [meterId, setMeterId] = useState(userData.consumerId || "");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.trim() || !meterId.trim()) {
      setError("Name and Meter Number are required");
      return;
    }
    setUserData({
      name: name.trim(),
      consumerId: meterId.trim(),
    });
    setIsEditing(false);
    setError("");
  };

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <PageContainer gap={4}>
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
        </div>

        {/* Name Section */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up">
          <p className="text-xs text-muted-foreground mb-2">Full Name</p>
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your full name"
              className="w-full text-lg font-medium text-foreground bg-transparent border-b border-primary focus:outline-none pb-1"
              autoFocus
            />
          ) : (
            <p className="text-lg font-medium text-foreground">{name || "Not set"}</p>
          )}
        </div>

        {/* Meter Number Section */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <p className="text-xs text-muted-foreground mb-2">Meter Number</p>
          {isEditing ? (
            <input
              type="text"
              value={meterId}
              onChange={(e) => {
                setMeterId(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your meter number"
              className="w-full text-lg font-medium text-foreground bg-transparent border-b border-primary focus:outline-none pb-1"
            />
          ) : (
            <p className="text-lg font-medium text-foreground">{meterId || "Not set"}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-2xs text-destructive text-center bg-destructive/10 rounded-lg p-2">
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(userData.name || "");
                  setMeterId(userData.consumerId || "");
                  setError("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={!name.trim() || !meterId.trim()}
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          This information is used in your energy trade listings
        </p>
      </PageContainer>
    </div>
  );
};

export default ProfileSettingsPage;
