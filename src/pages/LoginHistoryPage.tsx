import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
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
      <div className="screen-container !justify-start !pt-3">
        <div className="w-full max-w-xl flex flex-col h-full px-3 lg:max-w-3xl lg:px-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 pb-2 animate-fade-in">
            <button
              onClick={() => navigate("/profile")}
              className="p-1 -ml-1 hover:bg-muted rounded-md transition-colors"
            >
              <ArrowLeft size={16} className="text-foreground" />
            </button>
            <h1 className="text-sm font-semibold text-foreground">Login History</h1>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto space-y-2 pb-3">
            {loading ? (
              <div className="text-xs text-muted-foreground">Loading login history...</div>
            ) : logins.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Calendar size={18} className="text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground mb-1">No login history</p>
                <p className="text-[11px] text-muted-foreground">Your login activity will appear here</p>
              </div>
            ) : (
              logins.map((login) => (
                <div
                  key={login.login_id}
                  className="w-full bg-card rounded-xl p-4 shadow-card animate-slide-up border border-border/40"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Date and Time */}
                    <div className="rounded-lg bg-muted/20 p-2.5">
                      <p className="text-xs font-medium text-foreground">Login Date & Time</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(login.login_time)}
                      </p>
                    </div>

                    {/* Device */}
                    <div className="rounded-lg bg-muted/20 p-2.5">
                      <p className="text-xs font-medium text-foreground">Device</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getDeviceType(login.device_info)}
                      </p>
                    </div>

                    {/* IP Address */}
                    <div className="rounded-lg bg-muted/20 p-2.5">
                      <p className="text-xs font-medium text-foreground">IP Address</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {login.ip_address}
                      </p>
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
