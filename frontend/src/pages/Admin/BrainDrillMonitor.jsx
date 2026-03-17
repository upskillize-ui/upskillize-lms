/**
 * BrainDrillMonitor.jsx
 * Admin panel — real-time visibility into AI mock test activity.
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

import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

// ── Design tokens (neutral, works in both light/dark admin themes) ─────────────
const T = {
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
  blue: "#2563eb",
  purple: "#7c3aed",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f9fafb",
  card: "#ffffff",
};

function StatCard({ label, value, sub, color = T.blue, icon }) {
  return (
    <div
      style={{
        background: T.card,
        borderRadius: 12,
        padding: "20px 24px",
        border: `1px solid ${T.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </div>
        <div
          style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 3 }}
        >
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, color = T.blue }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 10px",
        borderRadius: 20,
        background: `${color}15`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {children}
    </span>
  );
}

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

  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, healthRes] = await Promise.allSettled([
        api.get("/testgen/status"),
        api.get("/testgen/health"),
      ]);
      if (statusRes.status === "fulfilled") {
        setStatus(statusRes.value.data);
      }
      if (healthRes.status === "fulfilled") {
        setAgentHealth(healthRes.value.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Monitor fetch error:", err);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      // Fetch test attempt history — uses your existing quiz attempts endpoint
      // which stores similar data. If you have a dedicated test_results table,
      // change this endpoint.
      const res = await api.get("/admin/test-history");
      setTestHistory(res.data.history || res.data.results || []);
    } catch {
      // Endpoint may not exist yet — show empty state gracefully
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
      setIngestMsg({ ok: false, text: `Please enter a valid ${type} ID.` });
      return;
    }
    setIngesting(true);
    setIngestMsg(null);
    try {
      const payload =
        type === "course"
          ? { courseId: Number(id) }
          : { lectureId: Number(id) };
      await api.post(`/testgen/ingest/${type}`, payload);
      setIngestMsg({
        ok: true,
        text: `✅ ${type === "course" ? "Course" : "Lecture"} ${id} ingestion started. Content will be ready in ~30s.`,
      });
      if (type === "course") setIngestCourseId("");
      else setIngestLectureId("");
    } catch (err) {
      setIngestMsg({
        ok: false,
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setIngesting(false);
    }
  };

  const occupancy = status
    ? Math.round(
        ((status.activeCount || status.activeTestTakers || 0) /
          (status.maxAllowed || status.maxConcurrent || 50)) *
          100,
      )
    : 0;

  const occupancyColor =
    occupancy >= 90 ? T.red : occupancy >= 60 ? T.amber : T.green;
  const agentOk = agentHealth?.agent?.status === "ok" || agentHealth?.success;

  const tabs = [
    { id: "overview", label: "Live Overview" },
    { id: "history", label: "Test History" },
    { id: "ingest", label: "Content Ingest" },
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}
          >
            ⚡ BrainDrill Monitor
          </h2>
          <p style={{ color: T.muted, fontSize: 13, margin: "4px 0 0" }}>
            Real-time AI mock test management
            {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: T.muted,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (15s)
          </label>
          <button
            onClick={fetchStatus}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.card,
              fontSize: 13,
              cursor: "pointer",
              color: T.text,
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          icon="🎯"
          label="Active Tests"
          value={
            loadingStatus
              ? "…"
              : (status?.activeCount ?? status?.activeTestTakers ?? 0)
          }
          sub="Students currently testing"
          color={T.purple}
        />
        <StatCard
          icon="🪑"
          label="Available Slots"
          value={loadingStatus ? "…" : (status?.availableSlots ?? "—")}
          sub={`Max: ${status?.maxAllowed ?? status?.maxConcurrent ?? 50}`}
          color={occupancyColor}
        />
        <StatCard
          icon="📊"
          label="Occupancy"
          value={loadingStatus ? "…" : `${occupancy}%`}
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
          icon={agentOk ? "✅" : "❌"}
          label="Agent Status"
          value={loadingStatus ? "…" : agentOk ? "Online" : "Offline"}
          sub={
            agentHealth?.agent?.version
              ? `v${agentHealth.agent.version}`
              : "HuggingFace Spaces"
          }
          color={agentOk ? T.green : T.red}
        />
      </div>

      {/* Occupancy bar */}
      {!loadingStatus && (
        <div
          style={{
            background: T.card,
            borderRadius: 12,
            padding: "16px 20px",
            border: `1px solid ${T.border}`,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
              Slot occupancy
            </span>
            <span
              style={{ fontSize: 13, color: occupancyColor, fontWeight: 700 }}
            >
              {status?.activeCount ?? 0} / {status?.maxAllowed ?? 50} slots used
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

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          borderBottom: `1px solid ${T.border}`,
          paddingBottom: 0,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === t.id
                  ? `2px solid ${T.blue}`
                  : "2px solid transparent",
              color: activeTab === t.id ? T.blue : T.muted,
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === "overview" && (
        <div>
          <div
            style={{
              background: T.card,
              borderRadius: 12,
              padding: 20,
              border: `1px solid ${T.border}`,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: T.text,
                marginTop: 0,
                marginBottom: 16,
              }}
            >
              Agent details
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
                  ],
                  ["Version", agentHealth.agent?.version || "—"],
                  [
                    "Embed model",
                    agentHealth.agent?.embed_model || "all-MiniLM-L6-v2",
                  ],
                  [
                    "Agent URL",
                    process.env.REACT_APP_AGENT_URL ||
                      "upskill25-myagent.hf.space",
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      padding: "10px 14px",
                      background: T.bg,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{ fontSize: 11, color: T.muted, marginBottom: 3 }}
                    >
                      {k}
                    </div>
                    <div
                      style={{ fontSize: 14, fontWeight: 600, color: T.text }}
                    >
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

          <div
            style={{
              background: T.card,
              borderRadius: 12,
              padding: 20,
              border: `1px solid ${T.border}`,
              marginTop: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: T.text,
                marginTop: 0,
                marginBottom: 4,
              }}
            >
              Rate limiting rules
            </h3>
            <p
              style={{
                color: T.muted,
                fontSize: 13,
                marginTop: 0,
                marginBottom: 12,
              }}
            >
              Configured via environment variables on Railway/Render.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              {[
                ["Max concurrent tests", "MAX_CONCURRENT_TESTS", "50"],
                ["Tests per student/hour", "TESTGEN_RATE_LIMIT", "3"],
                ["Session TTL", "Hardcoded", "90 min"],
              ].map(([label, envKey, defaultVal]) => (
                <div
                  key={label}
                  style={{
                    padding: "12px 14px",
                    background: T.bg,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 11, color: T.muted }}>{label}</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: T.blue,
                      marginTop: 4,
                    }}
                  >
                    {defaultVal}
                  </div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                    env: {envKey}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Test History ── */}
      {activeTab === "history" && (
        <div
          style={{
            background: T.card,
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: T.text,
                margin: 0,
              }}
            >
              Student test history
            </h3>
            <button
              onClick={fetchHistory}
              style={{
                fontSize: 12,
                color: T.blue,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ padding: 40, textAlign: "center", color: T.muted }}>
              Loading history…
            </div>
          ) : testHistory.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ color: T.muted, fontSize: 14 }}>
                No test history available yet.
              </p>
              <p style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>
                Results will appear here once students complete tests and you
                add a<br />
                <code
                  style={{
                    background: T.bg,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  GET /api/admin/test-history
                </code>{" "}
                endpoint.
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
                      "Course / Topic",
                      "Score",
                      "Band",
                      "Time",
                      "Feedback",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: T.muted,
                          fontSize: 11,
                          letterSpacing: "0.05em",
                          borderBottom: `1px solid ${T.border}`,
                        }}
                      >
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {testHistory.map((r, i) => {
                    const pct =
                      r.percentage ?? Math.round((r.score / r.total) * 100);
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
                        style={{ borderBottom: `1px solid ${T.border}` }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            fontWeight: 600,
                            color: T.text,
                          }}
                        >
                          {r.student_name || r.student_id || "—"}
                        </td>
                        <td style={{ padding: "12px 16px", color: T.muted }}>
                          {r.topic || r.course_name || "—"}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontWeight: 700,
                            color: T.text,
                          }}
                        >
                          {r.score}/{r.total}{" "}
                          <span style={{ color: T.muted, fontWeight: 400 }}>
                            ({pct}%)
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge color={bandColor}>{band}</Badge>
                        </td>
                        <td style={{ padding: "12px 16px", color: T.muted }}>
                          {r.time_taken_seconds
                            ? `${Math.floor(r.time_taken_seconds / 60)}m ${r.time_taken_seconds % 60}s`
                            : "—"}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
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
                            padding: "12px 16px",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ingestMsg && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                fontSize: 13,
                background: ingestMsg.ok ? "#f0fdf4" : "#fef2f2",
                color: ingestMsg.ok ? T.green : T.red,
                border: `1px solid ${ingestMsg.ok ? "#bbf7d0" : "#fecaca"}`,
              }}
            >
              {ingestMsg.text}
            </div>
          )}

          <div
            style={{
              background: T.card,
              borderRadius: 12,
              padding: 24,
              border: `1px solid ${T.border}`,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: T.text,
                marginTop: 0,
                marginBottom: 6,
              }}
            >
              Ingest course content
            </h3>
            <p
              style={{
                color: T.muted,
                fontSize: 13,
                marginTop: 0,
                marginBottom: 16,
              }}
            >
              Re-embed an entire course so students get questions based on
              latest content. Run this whenever faculty uploads new material.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="number"
                placeholder="Course ID (e.g. 37)"
                value={ingestCourseId}
                onChange={(e) => setIngestCourseId(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `1.5px solid ${T.border}`,
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={() => handleIngest("course")}
                disabled={ingesting}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: ingesting ? "not-allowed" : "pointer",
                  background: T.blue,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: ingesting ? 0.6 : 1,
                }}
              >
                {ingesting ? "Starting…" : "Ingest Course"}
              </button>
            </div>
          </div>

          <div
            style={{
              background: T.card,
              borderRadius: 12,
              padding: 24,
              border: `1px solid ${T.border}`,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: T.text,
                marginTop: 0,
                marginBottom: 6,
              }}
            >
              Ingest single lecture
            </h3>
            <p
              style={{
                color: T.muted,
                fontSize: 13,
                marginTop: 0,
                marginBottom: 16,
              }}
            >
              Re-embed a specific lecture. Faster than full course — use after
              updating one lesson.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="number"
                placeholder="Lecture ID (e.g. 12)"
                value={ingestLectureId}
                onChange={(e) => setIngestLectureId(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `1.5px solid ${T.border}`,
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={() => handleIngest("lecture")}
                disabled={ingesting}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: ingesting ? "not-allowed" : "pointer",
                  background: T.purple,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: ingesting ? 0.6 : 1,
                }}
              >
                {ingesting ? "Starting…" : "Ingest Lecture"}
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#fffbeb",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #fcd34d",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>
              <strong>💡 How ingestion works:</strong> When you click Ingest,
              the agent downloads all lesson text, PDFs, and notes for that
              course/lecture, splits them into chunks, converts each chunk into
              a 384-dimension vector, and stores them in the{" "}
              <code>rag_embeddings</code> MySQL table. Future tests will be
              grounded in this content. Ingestion runs in the background — it
              takes ~10–30 seconds per lecture.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
