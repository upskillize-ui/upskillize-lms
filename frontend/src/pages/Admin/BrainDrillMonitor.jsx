/**
 * BrainDrillMonitor.jsx — ANIMATED EDITION
 *
 * Shows:
 *  • Live slot occupancy (how many students are actively taking a test)
 *  • Per-student test history with scores and feedback
 *  • Ingest controls (trigger re-ingestion of a course/lecture)
 *  • Agent health status
 *
 * Add to your Admin Dashboard routes:
 *   import BrainDrillMonitor from "./BrainDrillMonitor";
 *   <Route path="/admin/braindrill" element={<BrainDrillMonitor />} />
 *
 * And add to admin sidebar:
 *   { path: "/admin/braindrill", label: "BrainDrill Monitor", icon: Zap }
 */

import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary: "#1e3a5f",
  blue: "#2563eb",
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
  purple: "#7c3aed",
  teal: "#0d9488",
  orange: "#FF8C00",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f0f4f8",
  card: "#ffffff",
};

// ── CSS Animations (injected once) ────────────────────────────────────────────
const AnimationStyles = () => (
  <style>{`
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px rgba(22,163,74,0.3); }
      50% { box-shadow: 0 0 20px rgba(22,163,74,0.6); }
    }
    @keyframes glowRed {
      0%, 100% { box-shadow: 0 0 5px rgba(220,38,38,0.3); }
      50% { box-shadow: 0 0 20px rgba(220,38,38,0.6); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes progressFill {
      from { width: 0%; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .monitor-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .monitor-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    }
    .monitor-btn {
      transition: all 0.2s ease;
    }
    .monitor-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .monitor-btn:active {
      transform: translateY(0);
    }
    .tab-btn {
      transition: all 0.2s ease;
      position: relative;
    }
    .tab-btn:hover {
      background: #f0f4ff;
    }
    .tab-btn::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      width: 0;
      height: 2px;
      background: ${T.blue};
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }
    .tab-btn:hover::after {
      width: 100%;
    }
    .table-row {
      transition: all 0.2s ease;
    }
    .table-row:hover {
      background: #f0f7ff !important;
      transform: scale(1.005);
    }
    .ingest-input:focus {
      border-color: ${T.blue} !important;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
  `}</style>
);

// ── Animated Counter Hook ─────────────────────────────────────────────────────
function useAnimatedNumber(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (typeof target !== "number" || isNaN(target)) {
      setValue(0);
      return;
    }
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    prevTarget.current = target;
  }, [target, duration]);

  return value;
}

// ── Animated Stat Card ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color = T.blue,
  icon,
  index = 0,
  isLive = false,
}) {
  const numericValue = typeof value === "number" ? value : null;
  const animatedNum = useAnimatedNumber(numericValue || 0);
  const displayValue = numericValue !== null ? animatedNum : value;

  return (
    <div
      className="monitor-card"
      style={{
        background: T.card,
        borderRadius: 16,
        padding: "22px 24px",
        border: `1px solid ${T.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        animation: `slideUp 0.6s ease ${index * 0.1}s both`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative gradient stripe at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
        }}
      />

      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${color}15, ${color}25)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
          animation: isLive ? "pulse 2s infinite" : "none",
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color,
            lineHeight: 1,
            letterSpacing: "-0.5px",
          }}
        >
          {displayValue}
        </div>
        <div
          style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 4 }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 11,
              color: T.muted,
              marginTop: 2,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {isLive && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: color,
                  display: "inline-block",
                  animation: "pulse 1.5s infinite",
                }}
              />
            )}
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Animated Progress Bar ─────────────────────────────────────────────────────
function AnimatedBar({
  value = 0,
  max = 100,
  color = T.green,
  height = 10,
  delay = 0,
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div
      style={{
        height,
        borderRadius: height,
        background: `${T.border}80`,
        overflow: "hidden",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: height,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          width: `${pct}%`,
          animation: `progressFill 1.2s ease ${delay}s both`,
          boxShadow: pct > 0 ? `0 0 8px ${color}40` : "none",
        }}
      />
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ children, color = T.blue }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 12px",
        borderRadius: 20,
        background: `${color}12`,
        color,
        border: `1px solid ${color}25`,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

// ── Live Indicator Dot ────────────────────────────────────────────────────────
function LiveDot({ color = T.green, size = 8 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        animation: "glow 2s infinite",
        boxShadow: `0 0 8px ${color}60`,
      }}
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrainDrillMonitor() {
  const [status, setStatus] = useState(null);
  const [agentHealth, setAgentHealth] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [ingestCourseId, setIngestCourseId] = useState("");
  const [ingestLectureId, setIngestLectureId] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestMsg, setIngestMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [resetting, setResetting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, healthRes] = await Promise.allSettled([
        api.get("/testgen/status"),
        api.get("/testgen/health"),
      ]);
      if (statusRes.status === "fulfilled") setStatus(statusRes.value.data);
      if (healthRes.status === "fulfilled")
        setAgentHealth(healthRes.value.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Monitor fetch error:", err);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get("/admin/test-history");
      setTestHistory(res.data.history || res.data.results || []);
    } catch {
      setTestHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, [fetchStatus, fetchHistory]);

  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(fetchStatus, 15_000);
    return () => clearInterval(iv);
  }, [autoRefresh, fetchStatus]);

  const handleIngest = async (type) => {
    const id = type === "course" ? ingestCourseId : ingestLectureId;
    if (!id || isNaN(Number(id))) {
      setIngestMsg({ ok: false, text: `Enter a valid ${type} ID.` });
      return;
    }
    setIngesting(true);
    setIngestMsg(null);
    try {
      await api.post(
        `/testgen/ingest/${type}`,
        type === "course"
          ? { courseId: Number(id) }
          : { lectureId: Number(id) },
      );
      setIngestMsg({
        ok: true,
        text: `✅ ${type === "course" ? "Course" : "Lecture"} ${id} ingestion started!`,
      });
      type === "course" ? setIngestCourseId("") : setIngestLectureId("");
    } catch (err) {
      setIngestMsg({
        ok: false,
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setIngesting(false);
    }
  };

  const activeTests = status?.activeCount ?? status?.activeTestTakers ?? 0;
  const maxSlots = status?.maxAllowed ?? status?.maxConcurrent ?? 200;
  const availSlots = status?.availableSlots ?? maxSlots;
  const occupancy =
    maxSlots > 0 ? Math.round((activeTests / maxSlots) * 100) : 0;
  const occupancyColor =
    occupancy >= 90 ? T.red : occupancy >= 60 ? T.amber : T.green;
  const agentOk = agentHealth?.agent?.status === "ok" || agentHealth?.success;

  const tabs = [
    { id: "overview", label: "⚡ Live Overview", icon: "⚡" },
    { id: "history", label: "📋 Test History", icon: "📋" },
    { id: "ingest", label: "📥 Content Ingest", icon: "📥" },
  ];

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "inherit",
      }}
    >
      <AnimationStyles />

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
          animation: "fadeIn 0.5s ease",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: T.primary,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 28 }}>⚡</span> TestGen Monitor
            {agentOk && <LiveDot color={T.green} size={10} />}
          </h2>
          <p
            style={{
              color: T.muted,
              fontSize: 13,
              margin: "6px 0 0",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Real-time AI mock test management
            {lastUpdated && (
              <span
                style={{
                  background: `${T.green}10`,
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  color: T.green,
                }}
              >
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: T.muted,
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: 8,
              background: autoRefresh ? `${T.green}08` : "transparent",
              border: `1px solid ${autoRefresh ? T.green + "30" : "transparent"}`,
              transition: "all 0.2s",
            }}
          >
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ accentColor: T.green }}
            />
            Auto-refresh
          </label>
          <button
            className="monitor-btn"
            onClick={fetchStatus}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.card,
              fontSize: 13,
              cursor: "pointer",
              color: T.text,
              fontWeight: 600,
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Stat Cards (animated) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          index={0}
          icon="🎯"
          label="Active Tests"
          value={loadingStatus ? "..." : activeTests}
          isLive={activeTests > 0}
          sub={activeTests > 0 ? "Students testing now" : "No active tests"}
          color={T.purple}
        />
        <StatCard
          index={1}
          icon="🪑"
          label="Available Slots"
          value={loadingStatus ? "..." : availSlots}
          sub={`Max: ${maxSlots}`}
          color={occupancyColor}
        />
        <StatCard
          index={2}
          icon="📊"
          label="Occupancy"
          value={loadingStatus ? "..." : occupancy}
          sub={
            occupancy >= 90
              ? "⚠ Near capacity"
              : occupancy >= 60
                ? "Moderate load"
                : "Low load"
          }
          color={occupancyColor}
        />
        <StatCard
          index={3}
          icon={agentOk ? "✅" : "❌"}
          label="Agent Status"
          value={loadingStatus ? "..." : agentOk ? "Online" : "Offline"}
          isLive={agentOk}
          sub={
            agentHealth?.agent?.version
              ? `v${agentHealth.agent.version}`
              : "HuggingFace"
          }
          color={agentOk ? T.green : T.red}
        />
      </div>

      {/* ── Occupancy Bar (animated) ── */}
      {!loadingStatus && (
        <div
          className="monitor-card"
          style={{
            background: T.card,
            borderRadius: 16,
            padding: "20px 24px",
            border: `1px solid ${T.border}`,
            marginBottom: 28,
            animation: "slideUp 0.6s ease 0.5s both",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: T.text,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Slot Occupancy
              {activeTests > 0 && <LiveDot color={occupancyColor} />}
            </span>
            <span
              style={{ fontSize: 14, color: occupancyColor, fontWeight: 800 }}
            >
              {status?.activeCount ?? 0} / {status?.maxAllowed ?? 200} slots
              used
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: T.border,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${occupancy}%`,
                background: occupancyColor,
                borderRadius: 4,
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <p style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
            {status?.availableSlots ?? 50} slots available · Rate limit:{" "}
            {process.env.TESTGEN_RATE_LIMIT || 3} tests/hour per student
          </p>
        </div>
      )}

      {/* ── Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          borderBottom: `2px solid ${T.border}`,
          animation: "slideRight 0.5s ease 0.3s both",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            className="tab-btn"
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background: activeTab === t.id ? `${T.blue}08` : "none",
              border: "none",
              borderRadius: "10px 10px 0 0",
              borderBottom:
                activeTab === t.id
                  ? `3px solid ${T.blue}`
                  : "3px solid transparent",
              color: activeTab === t.id ? T.blue : T.muted,
              marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Agent Details */}
          <div
            className="monitor-card"
            style={{
              background: T.card,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${T.border}`,
              animation: "slideUp 0.5s ease 0.1s both",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.text,
                marginTop: 0,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              🤖 Agent Details
              {agentOk && <Badge color={T.green}>Connected</Badge>}
              {!agentOk && <Badge color={T.red}>Offline</Badge>}
            </h3>
            {agentHealth ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  [
                    "Status",
                    agentHealth.agent?.status || (agentOk ? "ok" : "offline"),
                    agentOk ? T.green : T.red,
                  ],
                  ["Version", agentHealth.agent?.version || "—", T.blue],
                  [
                    "Embed Model",
                    agentHealth.agent?.embed_model || "all-MiniLM-L6-v2",
                    T.purple,
                  ],
                  [
                    "Agent URL",
                    process.env.REACT_APP_AGENT_URL ||
                      "upskill25-myagent.hf.space",
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="monitor-card"
                    style={{
                      padding: "14px 18px",
                      background: `${c}06`,
                      borderRadius: 12,
                      border: `1px solid ${c}15`,
                      animation: `slideUp 0.4s ease ${0.2 + i * 0.1}s both`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: T.muted,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {k}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c }}>
                      {String(v)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: T.muted, fontSize: 13 }}>
                Could not reach agent.
              </p>
            )}
          </div>

          {/* Rate Limiting */}
          <div
            className="monitor-card"
            style={{
              background: T.card,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${T.border}`,
              animation: "slideUp 0.5s ease 0.3s both",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.text,
                marginTop: 0,
                marginBottom: 4,
              }}
            >
              ⚙️ Rate Limiting Rules
            </h3>
            <p
              style={{
                color: T.muted,
                fontSize: 13,
                marginTop: 0,
                marginBottom: 16,
              }}
            >
              Configured via environment variables on Render
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 14,
              }}
            >
              {[
                ["Max Concurrent", "50", T.blue, "MAX_CONCURRENT_TESTS"],
                ["Per Student/Hour", "3", T.amber, "TESTGEN_RATE_LIMIT"],
                ["Session TTL", "90 min", T.purple, "Hardcoded"],
              ].map(([label, val, color, env], i) => (
                <div
                  key={label}
                  className="monitor-card"
                  style={{
                    padding: "18px 16px",
                    background: `linear-gradient(135deg, ${color}08, ${color}03)`,
                    borderRadius: 14,
                    border: `1px solid ${color}15`,
                    textAlign: "center",
                    animation: `slideUp 0.4s ease ${0.4 + i * 0.1}s both`,
                  }}
                >
                  <div
                    style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color,
                      lineHeight: 1,
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: T.muted,
                      marginTop: 6,
                      fontFamily: "monospace",
                    }}
                  >
                    env: {env}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="monitor-card"
            style={{
              background: `linear-gradient(135deg, ${T.primary}08, ${T.blue}05)`,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${T.primary}15`,
              animation: "slideUp 0.5s ease 0.5s both",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.primary,
                marginTop: 0,
                marginBottom: 12,
              }}
            >
              🚀 Quick Actions
            </h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="monitor-btn"
                onClick={handleResetAll}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: `1px solid ${T.red}30`,
                  background: "#fff",
                  color: T.red,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                🗑️ Clear Stuck Sessions
              </button>
              <button
                className="monitor-btn"
                onClick={() => setActiveTab("ingest")}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: `1px solid ${T.blue}30`,
                  background: "#fff",
                  color: T.blue,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                📥 Ingest Content
              </button>
              <button
                className="monitor-btn"
                onClick={fetchStatus}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: `1px solid ${T.green}30`,
                  background: "#fff",
                  color: T.green,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                🔄 Force Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Test History ── */}
      {activeTab === "history" && (
        <div
          className="monitor-card"
          style={{
            background: T.card,
            borderRadius: 16,
            border: `1px solid ${T.border}`,
            overflow: "hidden",
            animation: "slideUp 0.5s ease both",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: `linear-gradient(135deg, ${T.bg}, ${T.card})`,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.text,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              📋 Student Test History
              {testHistory.length > 0 && (
                <Badge color={T.blue}>{testHistory.length} results</Badge>
              )}
            </h3>
            <button
              className="monitor-btn"
              onClick={fetchHistory}
              style={{
                fontSize: 12,
                color: T.blue,
                background: `${T.blue}08`,
                border: `1px solid ${T.blue}20`,
                padding: "6px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ padding: 60, textAlign: "center", color: T.muted }}>
              <div
                style={{
                  fontSize: 36,
                  marginBottom: 12,
                  animation: "bounce 1s infinite",
                }}
              >
                📊
              </div>
              Loading history...
            </div>
          ) : testHistory.length === 0 ? (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                animation: "fadeIn 0.5s ease",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <p
                style={{
                  color: T.text,
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                No Test History Yet
              </p>
              <p
                style={{
                  color: T.muted,
                  fontSize: 13,
                  maxWidth: 400,
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                Results will appear here once students complete tests. You need
                a
                <code
                  style={{
                    background: T.bg,
                    padding: "2px 6px",
                    borderRadius: 4,
                    margin: "0 4px",
                  }}
                >
                  GET /api/admin/test-history
                </code>
                backend endpoint.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: T.bg }}>
                    {[
                      "Student",
                      "Topic",
                      "Score",
                      "Band",
                      "Time",
                      "Feedback",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: T.muted,
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          borderBottom: `2px solid ${T.border}`,
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {testHistory.map((r, i) => {
                    const pct =
                      r.percentage ??
                      (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0);
                    const band =
                      r.performance_band ||
                      (pct >= 85
                        ? "Excellent"
                        : pct >= 70
                          ? "Good"
                          : pct >= 50
                            ? "Average"
                            : "Needs Improvement");
                    const bandColor =
                      {
                        Excellent: T.green,
                        Good: T.blue,
                        Average: T.amber,
                        "Needs Improvement": T.red,
                      }[band] || T.muted;
                    return (
                      <tr
                        key={i}
                        className="table-row"
                        style={{
                          borderBottom: `1px solid ${T.border}`,
                          animation: `slideRight 0.4s ease ${i * 0.05}s both`,
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 16px",
                            fontWeight: 600,
                            color: T.text,
                          }}
                        >
                          {r.student_name || r.student_id || "—"}
                        </td>
                        <td style={{ padding: "14px 16px", color: T.muted }}>
                          {r.topic || r.course_name || "—"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontWeight: 700, color: T.text }}>
                            {r.score}/{r.total}
                          </span>
                          <span
                            style={{
                              color: T.muted,
                              fontWeight: 400,
                              marginLeft: 4,
                            }}
                          >
                            ({pct}%)
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <Badge color={bandColor}>{band}</Badge>
                        </td>
                        <td style={{ padding: "14px 16px", color: T.muted }}>
                          {r.time_taken_seconds
                            ? `${Math.floor(r.time_taken_seconds / 60)}m ${r.time_taken_seconds % 60}s`
                            : "—"}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            color: T.muted,
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.overall_feedback || "—"}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            color: T.muted,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.created_at
                            ? new Date(r.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Content Ingest ── */}
      {activeTab === "ingest" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            animation: "slideUp 0.5s ease both",
          }}
        >
          {ingestMsg && (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                background: ingestMsg.ok ? "#f0fdf4" : "#fef2f2",
                color: ingestMsg.ok ? T.green : T.red,
                border: `1px solid ${ingestMsg.ok ? "#bbf7d0" : "#fecaca"}`,
                animation: "slideUp 0.3s ease",
              }}
            >
              {ingestMsg.text}
            </div>
          )}

          {/* Course Ingest */}
          <div
            className="monitor-card"
            style={{
              background: T.card,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${T.border}`,
              animation: "slideUp 0.4s ease 0.1s both",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.text,
                marginTop: 0,
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              📚 Ingest Course Content
            </h3>
            <p
              style={{
                color: T.muted,
                fontSize: 13,
                marginTop: 0,
                marginBottom: 16,
              }}
            >
              Re-embed an entire course so students get questions from latest
              content.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="number"
                className="ingest-input"
                placeholder="Course ID (e.g. 1)"
                value={ingestCourseId}
                onChange={(e) => setIngestCourseId(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `2px solid ${T.border}`,
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                }}
              />
              <button
                className="monitor-btn"
                onClick={() => handleIngest("course")}
                disabled={ingesting}
                style={{
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: "none",
                  cursor: ingesting ? "not-allowed" : "pointer",
                  background: `linear-gradient(135deg, ${T.blue}, ${T.blue}dd)`,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  opacity: ingesting ? 0.6 : 1,
                }}
              >
                {ingesting ? "⏳ Starting..." : "🚀 Ingest Course"}
              </button>
            </div>
          </div>

          {/* Lecture Ingest */}
          <div
            className="monitor-card"
            style={{
              background: T.card,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${T.border}`,
              animation: "slideUp 0.4s ease 0.2s both",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.text,
                marginTop: 0,
                marginBottom: 6,
              }}
            >
              📖 Ingest Single Lecture
            </h3>
            <p
              style={{
                color: T.muted,
                fontSize: 13,
                marginTop: 0,
                marginBottom: 16,
              }}
            >
              Faster than full course — use after updating one lesson.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="number"
                className="ingest-input"
                placeholder="Lecture ID (e.g. 12)"
                value={ingestLectureId}
                onChange={(e) => setIngestLectureId(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `2px solid ${T.border}`,
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                }}
              />
              <button
                className="monitor-btn"
                onClick={() => handleIngest("lecture")}
                disabled={ingesting}
                style={{
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: "none",
                  cursor: ingesting ? "not-allowed" : "pointer",
                  background: `linear-gradient(135deg, ${T.purple}, ${T.purple}dd)`,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  opacity: ingesting ? 0.6 : 1,
                }}
              >
                {ingesting ? "⏳ Starting..." : "🚀 Ingest Lecture"}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div
            style={{
              background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
              borderRadius: 14,
              padding: 20,
              border: "1px solid #fcd34d",
              animation: "slideUp 0.4s ease 0.3s both",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#92400e",
                lineHeight: 1.7,
              }}
            >
              <strong>💡 How ingestion works:</strong> The agent downloads all
              lesson text, PDFs, and notes, splits them into chunks, converts
              each into a 384-dimension vector, and stores them in the
              <code
                style={{
                  background: "#fef9c3",
                  padding: "1px 6px",
                  borderRadius: 4,
                  margin: "0 3px",
                }}
              >
                rag_embeddings
              </code>
              MySQL table. Takes ~10–30 seconds per lecture.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
