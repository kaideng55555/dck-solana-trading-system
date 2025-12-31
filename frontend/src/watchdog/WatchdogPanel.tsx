/**
 * WatchdogPanel Component (S6 Module)
 * 
 * Full AI Sniper control panel with neon theme
 * Features:
 * - 17 watch conditions
 * - Real-time event stream
 * - Rule builder with action selector
 * - Status indicators with last tick
 * - DCK neon gradient (pink → purple → cyan)
 */

import React, { useState } from "react";
import { useWatchdog } from "./useWatchdog";
import {
  WatchdogRule,
  WatchCondition,
  WatchdogEvent,
  WatchdogStatus,
} from "./watchdogTypes";

// =============================================
// TYPES
// =============================================

interface WatchdogPanelProps {
  /** Optional className for styling */
  className?: string;
}

// =============================================
// COMPONENT
// =============================================

export function WatchdogPanel({ className }: WatchdogPanelProps) {
  const {
    start,
    stop,
    addRule,
    removeRule,
    updateRule,
    toggleRule,
    clearEvents,
    events,
    rules,
    status,
    lastTick,
    getStats,
  } = useWatchdog();

  const [showBuilder, setShowBuilder] = useState(false);
  const [newRule, setNewRule] = useState<Partial<WatchdogRule>>({
    name: "",
    condition: "NEW_POOL",
    tokenMint: "",
    action: "BUY",
    amount: 0.1,
    useSafety: true,
    enabled: true,
    priority: 5,
    cooldown: 60,
  });

  const stats = getStats();

  /**
   * Add new rule
   */
  function handleAddRule() {
    const id = `rule_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const rule: WatchdogRule = {
      id,
      name: newRule.name || `Rule ${rules.length + 1}`,
      condition: newRule.condition as WatchCondition,
      tokenMint: newRule.tokenMint || undefined,
      action: newRule.action || "BUY",
      amount: newRule.amount || 0.1,
      useSafety: newRule.useSafety ?? true,
      enabled: true,
      priority: newRule.priority || 5,
      cooldown: newRule.cooldown || 60,
      lastTriggered: undefined,
      triggerCount: 0,
    };

    addRule(rule);
    setShowBuilder(false);

    // Reset form
    setNewRule({
      name: "",
      condition: "NEW_POOL",
      tokenMint: "",
      action: "BUY",
      amount: 0.1,
      useSafety: true,
      enabled: true,
      priority: 5,
      cooldown: 60,
    });
  }

  /**
   * Get condition display name
   */
  function getConditionLabel(condition: WatchCondition): string {
    const labels: Record<WatchCondition, string> = {
      NEW_POOL: "🆕 New Pool",
      LP_ADDED: "💧 LP Added",
      LP_SURGE: "📈 LP Surge",
      LP_DRAIN: "📉 LP Drain",
      LP_RUG: "🚨 LP Rug",
      MIGRATION: "🔄 Migration",
      BONDING_NEAR_GRAD: "🎓 Near Graduation",
      BONDING_STALL: "⏸️ Bonding Stall",
      MC_SPIKE: "🚀 MC Spike",
      MC_CRASH: "💥 MC Crash",
      VOLUME_SPIKE: "📊 Volume Spike",
      VELOCITY_SPIKE: "⚡ Velocity Spike",
      VELOCITY_DROP: "🐌 Velocity Drop",
      WHALE_BUY: "🐋 Whale Buy",
      WHALE_SELL: "🐳 Whale Sell",
      AUTHORITY_RISK: "⚠️ Authority Risk",
      SAFETY_FAIL: "🛡️ Safety Fail",
    };
    return labels[condition] || condition;
  }

  /**
   * Get action color
   */
  function getActionColor(action: string): string {
    switch (action) {
      case "BUY":
        return "rgba(0,255,140,0.6)";
      case "SELL":
        return "rgba(255,62,62,0.6)";
      case "ALERT":
        return "rgba(255,191,0,0.6)";
      case "FREEZE":
        return "rgba(0,228,255,0.6)";
      default:
        return "rgba(155,0,255,0.6)";
    }
  }

  /**
   * Get status color
   */
  function getStatusColor(status: WatchdogStatus): string {
    switch (status) {
      case "RUNNING":
        return "rgba(0,255,140,0.7)";
      case "IDLE":
        return "rgba(155,0,255,0.7)";
      case "ERROR":
        return "rgba(255,62,62,0.7)";
      default:
        return "rgba(128,128,128,0.7)";
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes pulseWatchdog {
            0%, 100% {
              box-shadow: 0 0 25px rgba(0,228,255,0.3);
            }
            50% {
              box-shadow: 0 0 35px rgba(0,228,255,0.6);
            }
          }

          @keyframes eventSlideIn {
            from {
              transform: translateX(-20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .watchdog-event {
            animation: eventSlideIn 0.3s ease-out;
          }

          .watchdog-scroll::-webkit-scrollbar {
            width: 8px;
          }

          .watchdog-scroll::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
            border-radius: 4px;
          }

          .watchdog-scroll::-webkit-scrollbar-thumb {
            background: rgba(0,228,255,0.5);
            border-radius: 4px;
          }

          .watchdog-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(0,228,255,0.7);
          }
        `}
      </style>

      <div
        className={className}
        style={{
          padding: "20px",
          background:
            "linear-gradient(135deg, rgba(255,62,191,0.15), rgba(155,0,255,0.12), rgba(0,228,255,0.1))",
          border: "1px solid rgba(0,228,255,0.3)",
          borderRadius: "12px",
          animation: status === "RUNNING" ? "pulseWatchdog 3s ease-in-out infinite" : "none",
          color: "#fff",
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* ===== HEADER ===== */}
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 900,
              letterSpacing: "2px",
              background: "linear-gradient(135deg, #FF3EBF, #9B00FF, #00E4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 8px rgba(0,228,255,0.8)",
            }}
          >
            🧠 WATCHDOG MODE
          </h2>
          <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
            Full AI Autonomous Sniper
          </div>
        </div>

        {/* ===== STATUS BAR ===== */}
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            background:
              status === "RUNNING"
                ? "rgba(0,255,140,0.15)"
                : status === "ERROR"
                ? "rgba(255,62,62,0.15)"
                : "rgba(155,0,255,0.15)",
            border: `2px solid ${getStatusColor(status)}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold",
            textShadow: "0 0 8px rgba(255,255,255,0.4)",
          }}
        >
          <div>
            <span style={{ fontSize: "14px" }}>Status: </span>
            <span
              style={{
                fontSize: "16px",
                color: getStatusColor(status),
                textTransform: "uppercase",
              }}
            >
              {status}
            </span>
            {status === "RUNNING" && lastTick > 0 && (
              <span style={{ marginLeft: "12px", fontSize: "12px", opacity: 0.7 }}>
                • Last tick {Math.floor((Date.now() - lastTick) / 1000)}s ago
              </span>
            )}
          </div>

          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            {stats.activeRules}/{stats.totalRules} rules • {stats.totalEvents} events • {stats.monitoredTokens} tokens
          </div>
        </div>

        {/* ===== CONTROL BUTTONS ===== */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={start}
            disabled={status === "RUNNING"}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              background:
                status === "RUNNING"
                  ? "rgba(128,128,128,0.3)"
                  : "linear-gradient(135deg, rgba(0,255,140,0.6), rgba(0,228,255,0.5))",
              color: status === "RUNNING" ? "#666" : "#000",
              fontWeight: 700,
              fontSize: "14px",
              cursor: status === "RUNNING" ? "not-allowed" : "pointer",
              border: "none",
              boxShadow:
                status === "RUNNING"
                  ? "none"
                  : "0 0 15px rgba(0,255,140,0.4)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (status !== "RUNNING") {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 0 25px rgba(0,255,140,0.6)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                status === "RUNNING"
                  ? "none"
                  : "0 0 15px rgba(0,255,140,0.4)";
            }}
          >
            ▶ START WATCHDOG
          </button>

          <button
            onClick={stop}
            disabled={status !== "RUNNING"}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              background:
                status !== "RUNNING"
                  ? "rgba(128,128,128,0.3)"
                  : "linear-gradient(135deg, rgba(255,62,62,0.6), rgba(255,62,191,0.5))",
              color: status !== "RUNNING" ? "#666" : "#000",
              fontWeight: 700,
              fontSize: "14px",
              cursor: status !== "RUNNING" ? "not-allowed" : "pointer",
              border: "none",
              boxShadow:
                status !== "RUNNING"
                  ? "none"
                  : "0 0 15px rgba(255,62,62,0.4)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (status === "RUNNING") {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 0 25px rgba(255,62,62,0.6)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                status !== "RUNNING"
                  ? "none"
                  : "0 0 15px rgba(255,62,62,0.4)";
            }}
          >
            ⏹ STOP WATCHDOG
          </button>

          <button
            onClick={() => setShowBuilder(!showBuilder)}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              background:
                "linear-gradient(135deg, rgba(155,0,255,0.6), rgba(0,228,255,0.5))",
              color: "#000",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              border: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 0 15px rgba(155,0,255,0.4)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(155,0,255,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(155,0,255,0.4)";
            }}
          >
            {showBuilder ? "✖ CLOSE" : "➕ NEW RULE"}
          </button>
        </div>

        {/* ===== RULE BUILDER ===== */}
        {showBuilder && (
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,62,191,0.5)",
              marginBottom: "20px",
              boxShadow: "0 0 20px rgba(255,62,191,0.3)",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "16px",
                fontWeight: 700,
                color: "#FF3EBF",
                textShadow: "0 0 8px rgba(255,62,191,0.6)",
              }}
            >
              🛠️ Create Watchdog Rule
            </h3>

            {/* Rule Name */}
            <input
              placeholder="Rule Name (e.g., Fresh Pool Hunter)"
              value={newRule.name}
              onChange={(e) =>
                setNewRule({ ...newRule, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "12px",
                borderRadius: "6px",
                border: "1px solid rgba(0,228,255,0.3)",
                background: "rgba(0,0,0,0.3)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            />

            {/* Condition */}
            <select
              value={newRule.condition}
              onChange={(e) =>
                setNewRule({
                  ...newRule,
                  condition: e.target.value as WatchCondition,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "12px",
                borderRadius: "6px",
                border: "1px solid rgba(0,228,255,0.3)",
                background: "rgba(0,0,0,0.3)",
                color: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="NEW_POOL">🆕 New Pool</option>
              <option value="LP_ADDED">💧 LP Added</option>
              <option value="LP_SURGE">📈 LP Surge</option>
              <option value="LP_DRAIN">📉 LP Drain</option>
              <option value="LP_RUG">🚨 LP Rug</option>
              <option value="MIGRATION">🔄 Migration</option>
              <option value="BONDING_NEAR_GRAD">🎓 Near Graduation</option>
              <option value="BONDING_STALL">⏸️ Bonding Stall</option>
              <option value="MC_SPIKE">🚀 MC Spike</option>
              <option value="MC_CRASH">💥 MC Crash</option>
              <option value="VOLUME_SPIKE">📊 Volume Spike</option>
              <option value="VELOCITY_SPIKE">⚡ Velocity Spike</option>
              <option value="VELOCITY_DROP">🐌 Velocity Drop</option>
              <option value="WHALE_BUY">🐋 Whale Buy</option>
              <option value="WHALE_SELL">🐳 Whale Sell</option>
              <option value="AUTHORITY_RISK">⚠️ Authority Risk</option>
              <option value="SAFETY_FAIL">🛡️ Safety Fail</option>
            </select>

            {/* Token Mint (Optional) */}
            <input
              placeholder="Token Mint (optional - blank = all tokens)"
              value={newRule.tokenMint}
              onChange={(e) =>
                setNewRule({ ...newRule, tokenMint: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "12px",
                borderRadius: "6px",
                border: "1px solid rgba(0,228,255,0.3)",
                background: "rgba(0,0,0,0.3)",
                color: "#fff",
                fontSize: "12px",
                fontFamily: "monospace",
                outline: "none",
              }}
            />

            {/* Action + Amount */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <select
                value={newRule.action}
                onChange={(e) =>
                  setNewRule({ ...newRule, action: e.target.value as any })
                }
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(0,228,255,0.3)",
                  background: "rgba(0,0,0,0.3)",
                  color: "#fff",
                  fontSize: "14px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="BUY">🟢 BUY</option>
                <option value="SELL">🔴 SELL</option>
                <option value="ALERT">🟡 ALERT</option>
                <option value="FREEZE">🔵 FREEZE</option>
              </select>

              <input
                type="number"
                placeholder="Amount"
                value={newRule.amount}
                onChange={(e) =>
                  setNewRule({ ...newRule, amount: parseFloat(e.target.value) || 0.1 })
                }
                step="0.01"
                min="0"
                style={{
                  width: "120px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(0,228,255,0.3)",
                  background: "rgba(0,0,0,0.3)",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Priority + Cooldown */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", opacity: 0.7, display: "block", marginBottom: "4px" }}>
                  Priority (1-10)
                </label>
                <input
                  type="number"
                  value={newRule.priority}
                  onChange={(e) =>
                    setNewRule({ ...newRule, priority: parseInt(e.target.value) || 5 })
                  }
                  min="1"
                  max="10"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,228,255,0.3)",
                    background: "rgba(0,0,0,0.3)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", opacity: 0.7, display: "block", marginBottom: "4px" }}>
                  Cooldown (seconds)
                </label>
                <input
                  type="number"
                  value={newRule.cooldown}
                  onChange={(e) =>
                    setNewRule({ ...newRule, cooldown: parseInt(e.target.value) || 60 })
                  }
                  min="0"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,228,255,0.3)",
                    background: "rgba(0,0,0,0.3)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Safety Toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              <input
                type="checkbox"
                checked={newRule.useSafety ?? true}
                onChange={(e) =>
                  setNewRule({ ...newRule, useSafety: e.target.checked })
                }
                style={{ cursor: "pointer" }}
              />
              <span>🛡️ Use Safety Checks (LP locked, authority renounced)</span>
            </label>

            {/* Add Button */}
            <button
              onClick={handleAddRule}
              disabled={!newRule.condition}
              style={{
                width: "100%",
                padding: "12px",
                background:
                  !newRule.condition
                    ? "rgba(128,128,128,0.3)"
                    : "linear-gradient(135deg, rgba(0,255,140,0.7), rgba(0,228,255,0.6))",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: !newRule.condition ? "not-allowed" : "pointer",
                border: "none",
                color: !newRule.condition ? "#666" : "#000",
                boxShadow: !newRule.condition ? "none" : "0 0 20px rgba(0,255,140,0.5)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (newRule.condition) {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,140,0.7)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  !newRule.condition ? "none" : "0 0 20px rgba(0,255,140,0.5)";
              }}
            >
              ✅ ADD RULE
            </button>
          </div>
        )}

        {/* ===== ACTIVE RULES ===== */}
        {rules.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  textShadow: "0 0 8px rgba(155,0,255,0.6)",
                }}
              >
                📋 Active Rules ({rules.length})
              </h3>
            </div>

            <div
              className="watchdog-scroll"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                paddingRight: "8px",
              }}
            >
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    marginBottom: "10px",
                    padding: "12px",
                    background: rule.enabled
                      ? "rgba(155,0,255,0.1)"
                      : "rgba(128,128,128,0.1)",
                    borderRadius: "8px",
                    border: `2px solid ${
                      rule.enabled ? getActionColor(rule.action) : "rgba(128,128,128,0.3)"
                    }`,
                    boxShadow: rule.enabled
                      ? `0 0 15px ${getActionColor(rule.action)}`
                      : "none",
                    opacity: rule.enabled ? 1 : 0.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
                        {rule.name || `Rule ${rule.id.slice(0, 8)}`}
                      </div>
                      <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px" }}>
                        {getConditionLabel(rule.condition)} → {rule.action} {rule.amount} SOL
                      </div>
                      {rule.tokenMint && (
                        <div
                          style={{
                            fontSize: "10px",
                            opacity: 0.6,
                            fontFamily: "monospace",
                            marginBottom: "8px",
                          }}
                        >
                          Target: {rule.tokenMint}
                        </div>
                      )}
                      <div style={{ fontSize: "11px", opacity: 0.6 }}>
                        Priority: {rule.priority} • Cooldown: {rule.cooldown}s
                        {rule.useSafety && " • 🛡️ Safety ON"}
                        {rule.triggerCount > 0 && ` • Triggered ${rule.triggerCount}x`}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => toggleRule(rule.id, !rule.enabled)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: rule.enabled
                            ? "rgba(255,191,0,0.6)"
                            : "rgba(0,255,140,0.6)",
                          color: "#000",
                          fontWeight: 700,
                          fontSize: "10px",
                          cursor: "pointer",
                          border: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rule.enabled ? "⏸️ PAUSE" : "▶️ ENABLE"}
                      </button>

                      <button
                        onClick={() => removeRule(rule.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: "rgba(255,62,62,0.6)",
                          color: "#000",
                          fontWeight: 700,
                          fontSize: "10px",
                          cursor: "pointer",
                          border: "none",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== EVENT STREAM ===== */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 700,
                textShadow: "0 0 8px rgba(0,228,255,0.6)",
              }}
            >
              🔥 Live Events ({events.length})
            </h3>

            {events.length > 0 && (
              <button
                onClick={clearEvents}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "rgba(255,62,62,0.4)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "11px",
                  cursor: "pointer",
                  border: "1px solid rgba(255,62,62,0.6)",
                }}
              >
                🗑️ CLEAR
              </button>
            )}
          </div>

          <div
            className="watchdog-scroll"
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            {events.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  fontSize: "14px",
                  opacity: 0.5,
                  border: "1px dashed rgba(128,128,128,0.3)",
                  borderRadius: "8px",
                }}
              >
                No events yet. Start watchdog to begin monitoring.
              </div>
            ) : (
              events.map((ev: WatchdogEvent, i: number) => (
                <div
                  key={i}
                  className="watchdog-event"
                  style={{
                    marginBottom: "10px",
                    padding: "12px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${
                      ev.condition.includes("RUG") || ev.condition.includes("RISK")
                        ? "rgba(255,62,62,0.8)"
                        : ev.condition.includes("SPIKE") || ev.condition.includes("SURGE")
                        ? "rgba(0,255,140,0.8)"
                        : "rgba(0,228,255,0.8)"
                    }`,
                    boxShadow: "0 0 10px rgba(0,228,255,0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>
                      {getConditionLabel(ev.condition)}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: getActionColor(ev.action),
                        color: "#000",
                        fontWeight: 700,
                      }}
                    >
                      {ev.action}
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "6px" }}>
                    {ev.message}
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      opacity: 0.7,
                      fontFamily: "monospace",
                      marginBottom: "6px",
                    }}
                  >
                    {ev.tokenSymbol} • {ev.tokenMint.slice(0, 8)}...{ev.tokenMint.slice(-6)}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", opacity: 0.5 }}>
                    <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    <span
                      style={{
                        color:
                          ev.status === "SUCCESS"
                            ? "rgba(0,255,140,0.8)"
                            : ev.status === "FAILED"
                            ? "rgba(255,62,62,0.8)"
                            : "rgba(255,191,0,0.8)",
                      }}
                    >
                      {ev.status}
                    </span>
                  </div>

                  {ev.error && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "11px",
                        padding: "6px",
                        background: "rgba(255,62,62,0.2)",
                        borderRadius: "4px",
                        color: "rgba(255,62,62,1)",
                      }}
                    >
                      ⚠️ {ev.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================
// EXPORTS
// =============================================

export default WatchdogPanel;
