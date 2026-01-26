import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Play, UploadCloud } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const BPP_URI_WEBHOOK = import.meta.env.VITE_BPP_URI_WEBHOOK;

type ActionLog = {
  action: string;
  messageId?: string;
  timestamp?: string;
  raw: string;
};

const ActionLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isTesting, setIsTesting] = useState<"select" | "init" | "confirm" | "publish" | null>(null);

  useEffect(() => {
    const normalizedBase = API_BASE_URL.replace(/\/$/, "");
    const wsBase = normalizedBase.replace(/^http/i, "ws");
    const socket = new WebSocket(`${wsBase}/ws/redis`);

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const payload = parsed.payload ?? parsed;
        const action =
          (payload?.context?.action || parsed.action || "event").toString();
        const messageId = payload?.context?.message_id;
        const timestamp = payload?.context?.timestamp || parsed.timestamp;

        setLogs((prev) => {
          const next = [{ action, messageId, timestamp, raw: event.data }, ...prev];
          return next.slice(0, 200);
        });
      } catch (error) {
        setLogs((prev) => {
          const next = [{ action: "event", raw: event.data }, ...prev];
          return next.slice(0, 200);
        });
      }
    };

    socket.onerror = (error) => {
      console.error("[Redis WS] Error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of logs) {
      const key = log.action || "event";
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).slice(0, 6);
  }, [logs]);

  const sendTestSelect = async (type: "select" | "init" | "confirm") => {
    if (isTesting) return;
    setIsTesting(type);
    try {
      if (!BPP_URI_WEBHOOK) {
        console.error("VITE_BPP_URI_WEBHOOK is not set. Using ngrok is required.");
        return;
      }

      const payload = {
        context: {
          bpp_uri: BPP_URI_WEBHOOK,
        },
        message: {
          order: {
            "@context":
              "https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/main/schema/core/v2/context.jsonld",
            "@type": "beckn:Order",
            "beckn:orderStatus": "CREATED",
            "beckn:seller": "provider-solar-farm-001",
            "beckn:buyer": {
              "beckn:id": "buyer-placeholder",
              "@context":
                "https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/main/schema/core/v2/context.jsonld",
              "@type": "beckn:Buyer",
            },
            "beckn:orderItems": [
              {
                "beckn:orderedItem": "energy-resource-solar-001-test",
                "beckn:orderItemAttributes": {
                  "@context":
                    "https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/p2p-trading/schema/EnergyOrderItem/v0.1/context.jsonld",
                  "@type": "EnergyOrderItem",
                  providerAttributes: {
                    "@context":
                      "https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/p2p-trading/schema/EnergyCustomer/v0.1/context.jsonld",
                    "@type": "EnergyCustomer",
                    meterId: "der://meter/98765456",
                    utilityCustomerId: "UTIL-CUST-123456",
                  },
                },
                "beckn:quantity": {
                  unitQuantity: 10,
                  unitText: "kWh",
                },
              },
            ],
          },
        },
      };

      await fetch(`${API_BASE_URL}/api/bap/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error(`Test ${type} failed:`, error);
    } finally {
      setIsTesting(null);
    }
  };

  const sendTestPublish = async () => {
    if (isTesting) return;
    setIsTesting("publish");
    try {
      const suffix = Math.floor(Math.random() * 900) + 100;
      const payload = {
        userId: "test-user",
        catalogue: {
          id: `catalogue_test_atria_${suffix}`,
          name: "Test Publish",
          items: [
            {
              id: `item_test_atria_${suffix}`,
              name: `test-${suffix}`,
              price: 0.1,
              unit: "kWh",
              available_quantity: 1,
              start_time: new Date().toISOString(),
              end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            },
          ],
        },
      };

      await fetch(`${API_BASE_URL}/api/bpp/catalogue/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Test publish failed:", error);
    } finally {
      setIsTesting(null);
    }
  };

  return (
    <div className="screen-container !justify-start !pt-4 !pb-0">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/home")}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
            >
              <ArrowLeft size={16} className="text-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground">Live stream</p>
              <h1 className="text-base font-bold text-foreground">Action Logs</h1>
            </div>
          </div>
          <SamaiLogo size="sm" showText={false} />
        </div>

        <div className="bg-card rounded-xl p-3 shadow-card mb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Redis feed</p>
                <p className="text-xs text-muted-foreground">all_action_reaction_logs</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => sendTestSelect("select")}
                disabled={isTesting !== null}
                className="btn-outline-calm text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                <Play size={12} />
                {isTesting === "select" ? "Sending..." : "Test select"}
              </button>
              <button
                onClick={() => sendTestSelect("init")}
                disabled={isTesting !== null}
                className="btn-outline-calm text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                <Play size={12} />
                {isTesting === "init" ? "Sending..." : "Test init"}
              </button>
              <button
                onClick={() => sendTestSelect("confirm")}
                disabled={isTesting !== null}
                className="btn-outline-calm text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                <Play size={12} />
                {isTesting === "confirm" ? "Sending..." : "Test confirm"}
              </button>
              <button
                onClick={sendTestPublish}
                disabled={isTesting !== null}
                className="btn-outline-calm text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                <UploadCloud size={12} />
                {isTesting === "publish" ? "Sending..." : "Test publish"}
              </button>
            </div>
          </div>
          {summary.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.map(([action, count]) => (
                <span
                  key={action}
                  className="text-[10px] bg-muted px-2 py-1 rounded-full text-muted-foreground"
                >
                  {action}: {count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden pb-12">
          {logs.length === 0 ? (
            <div className="bg-card rounded-xl p-3 shadow-card text-xs text-muted-foreground">
              Waiting for events from Redis…
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto space-y-2">
              {logs.map((log, index) => (
                <div key={`${log.raw}-${index}`} className="bg-card rounded-xl p-2 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{log.action || "event"}</span>
                    {log.timestamp && (
                      <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                    )}
                  </div>
                  {log.messageId && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      message_id: {log.messageId}
                    </p>
                  )}
                  <details className="mt-1">
                    <summary className="text-[10px] text-primary cursor-pointer">View raw payload</summary>
                    <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap break-words mt-1">
                      {log.raw}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionLogsPage;
