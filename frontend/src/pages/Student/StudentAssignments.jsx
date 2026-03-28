import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Clock, BookOpen, Calendar, Monitor, Activity, Eye, Layers, RefreshCw
} from "lucide-react";

const T = {
  navy: "#1a2744", navyLight: "#2c3e6b", gold: "#b8960b", goldSoft: "#fdf8ed",
  goldBorder: "#e8d89a", white: "#ffffff", bg: "#f7f8fc", border: "#e8e9f0",
  text: "#1a1a1a", muted: "#72706b", subtle: "#a8a49f",
  redSoft: "#fdf1f0", red: "#c0392b", greenSoft: "#edf7ed", green: "#2d6a2d",
  blueSoft: "#eef2fb", blue: "#1e3a6b",
};

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/attendance/my");
      setRecords(data.records || []);
      setSummary(data.summary || []);
      setLogins(data.logins || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-";
  const totalHours = summary.reduce((s, c) => s + (c.total_hours || 0), 0);
  const totalLessons = summary.reduce((s, c) => s + (c.lessons_watched || 0), 0);
  const avgWatch = summary.length > 0 ? Math.round(summary.reduce((s, c) => s + (c.avg_watch_percent || 0), 0) / summary.length) : 0;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: T.muted, fontSize: 14 }}>
      <RefreshCw size={18} style={{ marginRight: 8, animation: "spin 1s linear infinite" }} /> Loading attendance...
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 className="mba-section-title" style={{ margin: 0 }}>Attendance</h2>
          <p className="mba-section-sub">Your lecture activity, watch history & login records</p>
        </div>
        <button className="mba-btn-outline" onClick={load} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyLight} 100%)`, borderRadius: 12, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 14px rgba(26,39,68,.2)" }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Learning Activity</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", margin: "4px 0 0" }}>Track your progress across all courses</p>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {[
            { num: summary.length, lbl: "Courses" },
            { num: totalLessons, lbl: "Lessons" },
            { num: `${totalHours}h`, lbl: "Hours" },
            { num: `${avgWatch}%`, lbl: "Avg Watch" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>{s.num}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.5)", margin: 0 }}>{s.lbl}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `1.5px solid ${T.border}` }}>
        {[
          { key: "overview", label: "Course Overview" },
          { key: "lectures", label: "Lecture History" },
          { key: "logins", label: "Login History" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "10px 20px", fontSize: 13, fontWeight: tab === t.key ? 700 : 500, cursor: "pointer",
            background: "none", border: "none", color: tab === t.key ? T.navy : T.muted,
            borderBottom: tab === t.key ? `2.5px solid ${T.gold}` : "2.5px solid transparent", marginBottom: -1.5,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && (
        summary.length === 0 ? (
          <div className="mba-card mba-empty" style={{ textAlign: "center", padding: 40 }}>
            <BookOpen size={36} style={{ color: T.border, margin: "0 auto 10px" }} />
            <p>No attendance data yet. Start watching lectures!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {summary.map((s, i) => (
              <div key={i} className="mba-card" style={{ overflow: "hidden", padding: 0 }}>
                <div style={{ height: 3, background: i % 3 === 0 ? T.navy : i % 3 === 1 ? T.gold : T.green }} />
                <div style={{ padding: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.navy, margin: "0 0 14px" }}>{s.course_name}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <MetricBox icon={<Calendar size={13} />} label="Days Active" value={s.days_attended || 0} />
                    <MetricBox icon={<Layers size={13} />} label="Lessons" value={s.lessons_watched || 0} />
                    <MetricBox icon={<Clock size={13} />} label="Total Hours" value={`${s.total_hours || 0}h`} />
                    <MetricBox icon={<Eye size={13} />} label="Avg Watch" value={`${s.avg_watch_percent || 0}%`}
                      color={(s.avg_watch_percent || 0) >= 70 ? T.green : (s.avg_watch_percent || 0) >= 40 ? T.gold : T.red} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "lectures" && (
        <div className="mba-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "13px 17px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>All Sessions</span>
            <span style={{ fontSize: 12, color: T.muted }}>{records.length} records</span>
          </div>
          {records.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: T.muted }}>
              <Activity size={32} style={{ color: T.border, marginBottom: 8 }} />
              <p>No lectures watched yet</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: T.bg }}>
                  <th style={th}>Lecture</th><th style={th}>Date</th><th style={th}>Joined</th>
                  <th style={th}>Left</th><th style={th}>Duration</th><th style={th}>Watched</th>
                </tr></thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={td}>
                        <p style={{ fontWeight: 600, color: T.navy, margin: 0 }}>{r.lesson_title || `Lesson ${r.lesson_id}`}</p>
                        {r.course_name && <p style={{ fontSize: 11, color: T.subtle, margin: "2px 0 0" }}>{r.course_name}</p>}
                      </td>
                      <td style={td}>{fmt(r.session_date)}</td>
                      <td style={td}><span style={{ color: T.green, fontWeight: 600 }}>{fmtTime(r.joined_at)}</span></td>
                      <td style={td}><span style={{ color: r.left_at ? T.red : T.subtle, fontWeight: r.left_at ? 600 : 400 }}>{r.left_at ? fmtTime(r.left_at) : "in progress"}</span></td>
                      <td style={td}><span style={{ fontWeight: 600 }}>{r.duration_minutes || 0}</span> <span style={{ color: T.subtle }}>min</span></td>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 55, height: 6, borderRadius: 3, background: T.border, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(r.watch_percent || 0, 100)}%`, height: 6, borderRadius: 3, background: (r.watch_percent || 0) >= 70 ? T.green : (r.watch_percent || 0) >= 40 ? "#d4a017" : T.red }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: (r.watch_percent || 0) >= 70 ? T.green : (r.watch_percent || 0) >= 40 ? "#d4a017" : T.red }}>{r.watch_percent || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "logins" && (
        <div className="mba-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "13px 17px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Login Records</span>
            <span style={{ fontSize: 12, color: T.muted }}>{logins.length} logins</span>
          </div>
          {logins.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: T.muted }}>
              <Monitor size={32} style={{ color: T.border, marginBottom: 8 }} />
              <p>No login records yet</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: T.bg }}>
                  <th style={th}>Date & Time</th><th style={th}>IP Address</th><th style={th}>Device / Browser</th>
                </tr></thead>
                <tbody>
                  {logins.map((l, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.navy}12`, border: `1.5px solid ${T.navy}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Calendar size={14} color={T.navy} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: T.navy, fontSize: 13 }}>{fmt(l.login_at)}</p>
                            <p style={{ margin: 0, fontSize: 11, color: T.subtle }}>{fmtTime(l.login_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td style={td}><code style={{ background: T.bg, padding: "2px 8px", borderRadius: 4, fontSize: 12, color: T.text }}>{l.ip_address || "-"}</code></td>
                      <td style={td}><span style={{ fontSize: 12, color: T.muted }}>{fmtDevice(l.device)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricBox({ icon, label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ color: "#a8a49f" }}>{icon}</div>
      <div>
        <p style={{ fontSize: 10, color: "#a8a49f", margin: 0, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: color || "#1a2744", margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}

function fmtDevice(d) {
  if (!d) return "-";
  if (d.includes("Chrome")) return "Chrome / " + (d.includes("Windows") ? "Windows" : d.includes("Mac") ? "Mac" : d.includes("Android") ? "Android" : "Other");
  if (d.includes("Safari")) return "Safari / " + (d.includes("iPhone") ? "iPhone" : d.includes("Mac") ? "Mac" : "Other");
  if (d.includes("Firefox")) return "Firefox / " + (d.includes("Windows") ? "Windows" : "Other");
  return d.substring(0, 40);
}

const th = { textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#a8a49f", textTransform: "uppercase", letterSpacing: ".08em" };
const td = { padding: "12px 16px" };