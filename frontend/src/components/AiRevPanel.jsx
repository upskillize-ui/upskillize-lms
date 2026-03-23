// src/components/AiRevPanel.jsx
// Self-contained AiRev component with Review + History tabs
import { useState, useEffect } from "react";
import { Bot, ChevronRight, BookOpen, Target, Sparkles, AlertCircle, CheckCircle, Clock, History, TrendingUp, Award, Eye } from "lucide-react";

const T = {
  navy: "#1a2744", navyLight: "#2c3e6b", gold: "#b8960b", goldSoft: "#fdf8ed",
  goldBorder: "#e8d89a", bg: "#f7f8fc", border: "#e8e9f0", text: "#1a1a1a",
  muted: "#72706b", subtle: "#a8a49f", white: "#ffffff",
  red: "#c0392b", redSoft: "#fdf1f0", green: "#2d6a2d", greenSoft: "#edf7ed",
  blue: "#1e3a6b", blueSoft: "#eef2fb",
};

const AIREV_URL = "https://upskill25-airev.hf.space";
const AIREV_KEY = "ede1b07cd490cf784b9a1ca0943e5584ceee431b7fb12472704f3fe899e690f4";

const sc = (s) => s >= 70 ? T.green : s >= 40 ? "#d97706" : T.red;
const sbg = (s) => s >= 70 ? T.greenSoft : s >= 40 ? T.goldSoft : T.redSoft;
const gradeEmoji = (g) => {
  if (!g) return "📝";
  const l = g.charAt(0);
  if (l === "A") return "🏆"; if (l === "B") return "⭐"; if (l === "C") return "📊"; if (l === "D") return "📝";
  return "💪";
};

// ─── HISTORY TAB COMPONENT ───
function HistoryView({ studentId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${AIREV_URL}/api/review/student-progress/${studentId}`, {
          headers: { "x-api-key": AIREV_KEY },
        });
        const data = await res.json();
        if (data.success) {
          setHistory(data.submissions || data.progress?.submissions || []);
        } else {
          setError("Could not load review history.");
        }
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Could not connect to AiRev agent.");
      }
      setLoading(false);
    };
    fetchHistory();
  }, [studentId]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ width: 28, height: 28, border: "2px solid #e8e9f0", borderTopColor: T.navy, borderRadius: "50%", animation: "mba-spin .7s linear infinite", margin: "0 auto 12px" }} />
      <p style={{ fontSize: 13, color: T.muted }}>Loading review history...</p>
    </div>
  );

  if (error) return (
    <div style={{ background: T.redSoft, border: "1px solid #f7c1c1", borderRadius: 12, padding: "20px 24px", textAlign: "center" }}>
      <AlertCircle size={20} style={{ color: T.red, margin: "0 auto 8px", display: "block" }} />
      <p style={{ fontSize: 13, color: T.red }}>{error}</p>
    </div>
  );

  if (history.length === 0) return (
    <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <History size={36} style={{ color: T.border, margin: "0 auto 12px", display: "block" }} />
      <p style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>No Reviews Yet</p>
      <p style={{ fontSize: 13, color: T.muted }}>Click "New Review" to submit your first case study for AI review.</p>
    </div>
  );

  // Stats
  const totalReviews = history.length;
  const avgScore = totalReviews > 0 ? Math.round(history.reduce((sum, h) => sum + (h.ai_score || h.score || 0), 0) / totalReviews) : 0;
  const bestScore = Math.max(...history.map(h => h.ai_score || h.score || 0), 0);
  const latestScore = history[0]?.ai_score || history[0]?.score || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "Total Reviews", value: totalReviews, icon: "📊", color: T.navy },
          { label: "Average Score", value: `${avgScore}%`, icon: "📈", color: sc(avgScore) },
          { label: "Best Score", value: `${bestScore}%`, icon: "🏆", color: sc(bestScore) },
          { label: "Latest Score", value: `${latestScore}%`, icon: "🔄", color: sc(latestScore) },
        ].map((stat, i) => (
          <div key={i} style={{
            background: T.white, border: `1px solid ${T.border}`, borderRadius: 12,
            padding: "14px 16px", textAlign: "center",
            boxShadow: "0 1px 6px rgba(26,39,68,.05)",
          }}>
            <span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>{stat.icon}</span>
            <p style={{ fontSize: 20, fontWeight: 800, color: stat.color, marginBottom: 2 }}>{stat.value}</p>
            <p style={{ fontSize: 11, color: T.subtle, fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* History List */}
      <div style={{
        background: T.white, border: `1px solid ${T.border}`, borderRadius: 14,
        overflow: "hidden", boxShadow: "0 2px 12px rgba(26,39,68,.06)",
      }}>
        <div style={{
          padding: "14px 24px", borderBottom: `1px solid ${T.border}`, background: T.bg,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <History size={15} style={{ color: T.navy }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Review History</span>
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 600, padding: "2px 10px",
            borderRadius: 10, background: T.navy, color: T.white,
          }}>{totalReviews} review{totalReviews !== 1 ? "s" : ""}</span>
        </div>

        {history.map((sub, idx) => {
          const score = sub.ai_score || sub.score || 0;
          const grade = sub.ai_grade || sub.grade || "—";
          const date = sub.submitted_at || sub.created_at;
          const isExpanded = expanded === idx;
          const feedback = sub.ai_feedback || sub.feedback;

          return (
            <div key={sub.id || idx}>
              <div
                onClick={() => setExpanded(isExpanded ? null : idx)}
                style={{
                  padding: "16px 24px", cursor: "pointer",
                  borderBottom: idx < history.length - 1 ? `1px solid ${T.border}` : "none",
                  background: isExpanded ? T.bg : T.white,
                  transition: "background .15s",
                  display: "flex", alignItems: "center", gap: 16,
                }}
              >
                {/* Score circle */}
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                  border: `3px solid ${sc(score)}`, background: sbg(score),
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: sc(score), lineHeight: 1 }}>{score}</span>
                  <span style={{ fontSize: 8, color: T.subtle }}>/ 100</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>
                      Case Study #{sub.case_study_id || sub.caseStudyId || "—"}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: sbg(score), color: sc(score),
                    }}>Grade: {grade}</span>
                    <span style={{ fontSize: 11, color: T.subtle }}>
                      Attempt #{sub.attempt_number || sub.attemptNumber || idx + 1}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: T.subtle }}>
                    {date && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={11} />
                        {new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    {sub.model_used && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Bot size={11} /> {sub.model_used}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand indicator */}
                <ChevronRight size={16} style={{
                  color: T.subtle, flexShrink: 0, transition: "transform .2s",
                  transform: isExpanded ? "rotate(90deg)" : "none",
                }} />
              </div>

              {/* Expanded detail */}
              {isExpanded && feedback && (
                <div style={{
                  padding: "16px 24px 20px", background: T.bg,
                  borderBottom: idx < history.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  {/* Try to parse feedback as JSON for structured view */}
                  {(() => {
                    try {
                      const fb = typeof feedback === "string" ? JSON.parse(feedback) : feedback;
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {fb.summary && (
                            <div style={{
                              background: T.white, borderRadius: 8, padding: "10px 14px",
                              borderLeft: `3px solid ${T.gold}`, fontSize: 13, lineHeight: 1.65, color: T.text,
                            }}>{fb.summary}</div>
                          )}
                          {fb.rubricScores?.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                              {fb.rubricScores.map((r, ri) => (
                                <div key={ri} style={{
                                  background: T.white, borderRadius: 8, padding: "8px 12px",
                                  display: "flex", justifyContent: "space-between", alignItems: "center",
                                }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{r.criteria}</span>
                                  <span style={{ fontSize: 12, fontWeight: 800, color: sc(r.maxScore > 0 ? (r.score / r.maxScore) * 100 : 0) }}>
                                    {r.score}/{r.maxScore}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {fb.strengths?.length > 0 && (
                            <div style={{ fontSize: 12, color: T.muted }}>
                              <strong style={{ color: T.green }}>Strengths:</strong> {fb.strengths.join(" · ")}
                            </div>
                          )}
                          {fb.improvements?.length > 0 && (
                            <div style={{ fontSize: 12, color: T.muted }}>
                              <strong style={{ color: T.red }}>To improve:</strong> {fb.improvements.join(" · ")}
                            </div>
                          )}
                        </div>
                      );
                    } catch {
                      // Plain text feedback
                      return (
                        <div style={{
                          background: T.white, borderRadius: 8, padding: "12px 14px",
                          fontSize: 13, lineHeight: 1.65, color: T.text, whiteSpace: "pre-wrap",
                        }}>{typeof feedback === "string" ? feedback : JSON.stringify(feedback, null, 2)}</div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN AIREV PANEL ───
export default function AiRevPanel({ assignment, submissionNotes, onClose }) {
  const [activeTab, setActiveTab] = useState("review");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const [hasStartedReview, setHasStartedReview] = useState(false);

  const studentId = assignment?.student_id || 1;

  const runReview = async () => {
    setLoading(true);
    setResult(null);
    setActiveTab("review");
    setHasStartedReview(true);
    try {
      const res = await fetch(`${AIREV_URL}/api/review/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": AIREV_KEY },
        body: JSON.stringify({
          caseStudyId: assignment.case_study_id || assignment.id || 1,
          studentId: studentId,
          answerText: submissionNotes || assignment.submission_notes || assignment.description || "No submission text",
        }),
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setResult({ type: "structured", ...data.feedback, time: data.processingTimeMs });
      } else if (data.partialReview) {
        setResult({ type: "text", text: data.message });
      } else {
        setResult({ type: "text", text: "Could not generate review. Please try again." });
      }
    } catch (err) {
      console.error("AiRev error:", err);
      setResult({ type: "text", text: "AI Review is temporarily unavailable. Please try again later." });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 500);
    return () => clearInterval(iv);
  }, [loading]);

  const tabStyle = (id) => ({
    display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px",
    borderRadius: 8, fontSize: 13, fontWeight: activeTab === id ? 700 : 500,
    cursor: "pointer", border: "none",
    background: activeTab === id ? T.navy : "transparent",
    color: activeTab === id ? T.white : T.muted,
    fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .18s",
    boxShadow: activeTab === id ? "0 2px 8px rgba(26,39,68,.18)" : "none",
  });

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 4px" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, flexWrap: "wrap", gap: 10,
      }}>
        <button onClick={onClose} style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
          background: "transparent", border: `1.5px solid ${T.border}`, borderRadius: 8,
          fontSize: 13, fontWeight: 600, color: T.muted, cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}>← Back to Assignments</button>

        <div style={{ display: "flex", gap: 6 }}>
          <button style={tabStyle("review")} onClick={() => setActiveTab("review")}>
            <Bot size={14} /> {hasStartedReview ? "Review" : "New Review"}
          </button>
          <button style={tabStyle("history")} onClick={() => setActiveTab("history")}>
            <History size={14} /> History
          </button>
        </div>
      </div>

      {/* ═══ REVIEW TAB ═══ */}
      {activeTab === "review" && (
        <>
          {/* Not started yet - show start button */}
          {!loading && !result && !hasStartedReview && (
            <div style={{
              background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyLight} 100%)`,
              borderRadius: 16, padding: "48px 32px", textAlign: "center",
              boxShadow: "0 8px 32px rgba(26,39,68,.18)",
            }}>
              <Bot size={40} style={{ color: T.gold, margin: "0 auto 16px", display: "block" }} />
              <p style={{ fontSize: 22, fontWeight: 800, color: T.white, marginBottom: 8 }}>AI Case Study Review</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", marginBottom: 24, maxWidth: 420, margin: "0 auto 24px" }}>
                Submit your case study answer for instant AI-powered feedback with scores, rubric breakdown, and improvement suggestions.
              </p>
              <button onClick={runReview} style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px",
                background: T.gold, border: "none", borderRadius: 10, color: T.white,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: "0 4px 16px rgba(184,150,11,.35)",
              }}>
                <Sparkles size={16} /> Start AI Review
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{
              background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyLight} 100%)`,
              borderRadius: 16, padding: "56px 32px", textAlign: "center",
              boxShadow: "0 8px 32px rgba(26,39,68,.18)",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 18,
                background: "rgba(184,150,11,.15)", border: "2px solid rgba(184,150,11,.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", animation: "mba-spin 2.5s linear infinite",
              }}>
                <Bot size={32} style={{ color: T.gold }} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: T.white, marginBottom: 6 }}>
                AiRev is Analysing{dots}
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)" }}>
                {assignment.title || "Your Assignment"}
              </p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16,
                padding: "6px 14px", borderRadius: 20,
                background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.4)", fontSize: 12,
              }}>
                <Sparkles size={12} /> Powered by DeepSeek R1 · Usually 30-60 seconds
              </div>
            </div>
          )}

          {/* Text fallback */}
          {!loading && result?.type === "text" && (
            <div style={{
              background: T.white, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: "28px 32px", boxShadow: "0 2px 12px rgba(26,39,68,.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <AlertCircle size={18} style={{ color: T.gold }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>Review Status</span>
              </div>
              <p style={{ color: T.muted, lineHeight: 1.75, fontSize: 14 }}>{result.text}</p>
            </div>
          )}

          {/* Structured result */}
          {!loading && result?.type === "structured" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Score Header */}
              <div style={{
                background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyLight} 100%)`,
                borderRadius: 16, padding: "28px 32px",
                display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
                boxShadow: "0 8px 32px rgba(26,39,68,.18)",
              }}>
                <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
                  <svg width={100} height={100} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={50} cy={50} r={42} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={8} />
                    <circle cx={50} cy={50} r={42} fill="none" stroke={sc(result.score)} strokeWidth={8}
                      strokeDasharray={264} strokeDashoffset={264 - (result.score / 100) * 264}
                      strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: T.white }}>{result.score}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>/ 100</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.gold }}>AI Case Study Review</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 10px" }}>
                    <span style={{ fontSize: 20 }}>{gradeEmoji(result.grade)}</span>
                    <span style={{ fontSize: 32, fontWeight: 800, color: T.white }}>{result.grade}</span>
                    <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: sbg(result.score), color: sc(result.score) }}>
                      {result.score >= 70 ? "Well Done" : result.score >= 40 ? "Needs Work" : "Needs Improvement"}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.65,
                    background: "rgba(255,255,255,.06)", padding: "10px 14px", borderRadius: 10,
                    borderLeft: `3px solid ${T.gold}`,
                  }}>{result.summary}</p>
                </div>
              </div>

              {/* Rubric */}
              {result.rubricScores?.length > 0 && (
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 28px", boxShadow: "0 2px 12px rgba(26,39,68,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <Target size={16} style={{ color: T.navy }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Rubric Breakdown</span>
                  </div>
                  {result.rubricScores.map((r, i) => {
                    const pct = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0;
                    return (
                      <div key={i} style={{ marginBottom: i < result.rubricScores.length - 1 ? 14 : 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.criteria}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: sc(pct) }}>{r.score}/{r.maxScore}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: sbg(pct), color: sc(pct) }}>{pct}%</span>
                          </div>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: T.bg, overflow: "hidden" }}>
                          <div style={{ height: 6, borderRadius: 3, width: `${pct}%`, background: `linear-gradient(90deg, ${sc(pct)}, ${sc(pct)}aa)`, transition: "width 1s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* What Went Wrong */}
              {result.missingConcepts?.length > 0 && (
                <div style={{ background: T.white, border: `1px solid #fecaca`, borderLeft: `4px solid ${T.red}`, borderRadius: 14, padding: "22px 28px", boxShadow: "0 2px 12px rgba(26,39,68,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 18 }}>❌</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.red }}>What Went Wrong</span>
                  </div>
                  {(result.improvements || []).slice(0, 4).map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, padding: "10px 14px", background: T.redSoft, borderRadius: 8 }}>
                      <ChevronRight size={14} style={{ color: T.red, flexShrink: 0, marginTop: 3 }} />
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: T.text }}>{s}</p>
                    </div>
                  ))}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", marginRight: 4, alignSelf: "center" }}>Missing:</span>
                    {result.missingConcepts.map((c, i) => (
                      <span key={i} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: T.redSoft, color: T.red, border: "1px solid #fecaca" }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* What Could Be Better */}
              {(result.strengths?.length > 0 || result.coveredConcepts?.length > 0) && (
                <div style={{ background: T.white, border: `1px solid ${T.goldBorder}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 14, padding: "22px 28px", boxShadow: "0 2px 12px rgba(26,39,68,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 18 }}>💡</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>What Could Be Better</span>
                  </div>
                  {(result.strengths || []).map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, padding: "10px 14px", background: T.goldSoft, borderRadius: 8 }}>
                      <CheckCircle size={14} style={{ color: T.gold, flexShrink: 0, marginTop: 3 }} />
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: T.text }}>{s}</p>
                    </div>
                  ))}
                  {result.coveredConcepts?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>You covered well:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                        {result.coveredConcepts.map((c, i) => (
                          <span key={i} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: T.greenSoft, color: T.green, border: "1px solid #b8d9b8" }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Improvement Areas */}
              {result.suggestions?.length > 0 && (
                <div style={{ background: T.white, border: `1px solid #c7d2fe`, borderLeft: `4px solid ${T.blue}`, borderRadius: 14, padding: "22px 28px", boxShadow: "0 2px 12px rgba(26,39,68,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 18 }}>🚀</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.blue }}>Improvement Areas</span>
                  </div>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, padding: "10px 14px", background: T.blueSoft, borderRadius: 8 }}>
                      <BookOpen size={14} style={{ color: T.blue, flexShrink: 0, marginTop: 3 }} />
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: T.text }}>{s}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Encouragement */}
              {result.encouragement && (
                <div style={{
                  background: `linear-gradient(135deg, ${T.goldSoft} 0%, #fff9e6 100%)`,
                  border: `1px solid ${T.goldBorder}`, borderRadius: 14,
                  padding: "22px 28px", display: "flex", gap: 14, alignItems: "flex-start",
                  boxShadow: "0 2px 12px rgba(26,39,68,.06)",
                }}>
                  <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>👏</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>From Your AI Mentor</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, lineHeight: 1.75 }}>{result.encouragement}</p>
                  </div>
                </div>
              )}

              {/* Processing + Actions */}
              {result.time && (
                <div style={{ textAlign: "center", padding: "4px 0" }}>
                  <span style={{ fontSize: 11, color: T.subtle }}>Reviewed in {(result.time / 1000).toFixed(1)}s · Powered by AiRev Agent</span>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingBottom: 8 }}>
                <button onClick={onClose} style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px",
                  background: "transparent", border: `1.5px solid ${T.border}`, borderRadius: 8,
                  fontSize: 13, fontWeight: 600, color: T.muted, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}>← Back</button>
                <button onClick={runReview} style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px",
                  background: T.navy, border: "none", borderRadius: 8, color: T.white,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: "0 2px 8px rgba(26,39,68,.2)",
                }}>
                  <Bot size={14} /> Re-analyse
                </button>
                <button onClick={() => setActiveTab("history")} style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px",
                  background: "transparent", border: `1.5px solid ${T.border}`, borderRadius: 8,
                  fontSize: 13, fontWeight: 600, color: T.navy, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}>
                  <History size={14} /> View History
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ HISTORY TAB ═══ */}
      {activeTab === "history" && (
        <HistoryView studentId={studentId} />
      )}
    </div>
  );
}