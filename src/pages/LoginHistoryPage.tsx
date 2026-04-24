import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, MapPin, Calendar } from "lucide-react";
import { getLoginHistory, LoginRecord } from "@/services/loginHistoryService";
import MainAppShell from "@/components/layout/MainAppShell";

const LoginHistoryPage = () => {
  const navigate = useNavigate();
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogins = async () => {
      try {
        const data = await getLoginHistory();
        setLogins(data);
      } catch (error) {
        console.error("Failed to load login history:", error);
        setLogins([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogins();
  }, []);

  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return "Unknown";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getDeviceType = (deviceInfo: string) => {
    if (!deviceInfo) return "Unknown Device";
    if (deviceInfo.toLowerCase().includes("iphone")) return "iPhone";
    if (deviceInfo.toLowerCase().includes("ipad")) return "iPad";
    if (deviceInfo.toLowerCase().includes("android")) return "Android";
    if (deviceInfo.toLowerCase().includes("windows")) return "Windows";
    if (deviceInfo.toLowerCase().includes("mac")) return "Mac";
    if (deviceInfo.toLowerCase().includes("linux")) return "Linux";
    return "Web Browser";
  };

  return (
    <MainAppShell>
      <div className="screen-container !justify-start !pt-4">
        <div className="w-full max-w-xl flex flex-col h-full px-4 lg:max-w-4xl lg:px-0">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 animate-fade-in">
            <button
              onClick={() => navigate("/profile")}
              className="p-1.5 -ml-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <h1 className="text-base font-bold text-foreground">Login History</h1>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading login history...</div>
            ) : logins.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No login history</p>
                <p className="text-xs text-muted-foreground">Your login activity will appear here</p>
              </div>
            ) : (
              logins.map((login) => (
                <div
                  key={login.login_id}
                  className="w-full bg-card rounded-xl p-4 shadow-card animate-slide-up"
                >
                  <div className="space-y-3">
                    {/* Date and Time */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Calendar size={18} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Login Date & Time</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(login.login_time)}
                        </p>
                      </div>
                    </div>

                    {/* Device */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                        <Smartphone size={18} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Device</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getDeviceType(login.device_info)}
                        </p>
                      </div>
                    </div>

                    {/* IP Address */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                        <MapPin size={18} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">IP Address</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {login.ip_address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainAppShell>
  );
};

export default LoginHistoryPage;
