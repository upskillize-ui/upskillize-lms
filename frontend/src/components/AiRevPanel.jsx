// src/components/AiRevPanel.jsx
// Self-contained AiRev component — zero dependency on Dashboard.jsx
import { useState, useEffect } from "react";
import { Bot, ChevronRight, BookOpen, Target, TrendingUp, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

const T = {
  navy: "#1a2744", navyLight: "#2c3e6b", gold: "#b8960b", goldSoft: "#fdf8ed",
  goldBorder: "#e8d89a", bg: "#f7f8fc", border: "#e8e9f0", text: "#1a1a1a",
  muted: "#72706b", subtle: "#a8a49f", white: "#ffffff",
  red: "#c0392b", redSoft: "#fdf1f0", green: "#2d6a2d", greenSoft: "#edf7ed",
  blue: "#1e3a6b", blueSoft: "#eef2fb",
};

const AIREV_URL = "https://upskill25-airev.hf.space";
const AIREV_KEY = "ede1b07cd490cf784b9a1ca0943e5584ceee431b7fb12472704f3fe899e690f4";

export default function AiRevPanel({ assignment, submissionNotes, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState("");

  const runReview = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${AIREV_URL}/api/review/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": AIREV_KEY },
        body: JSON.stringify({
          caseStudyId: assignment.case_study_id || assignment.id || 1,
          studentId: assignment.student_id || 1,
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

  useEffect(() => { runReview(); }, []);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 500);
    return () => clearInterval(iv);
  }, [loading]);

  const sc = (s) => s >= 70 ? T.green : s >= 40 ? "#d97706" : T.red;
  const sbg = (s) => s >= 70 ? T.greenSoft : s >= 40 ? T.goldSoft : T.redSoft;
  const gradeEmoji = (g) => {
    if (!g) return "📝";
    const l = g.charAt(0);
    if (l === "A") return "🏆";
    if (l === "B") return "⭐";
    if (l === "C") return "📊";
    if (l === "D") return "📝";
    return "💪";
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 4px" }}>

      <button onClick={onClose} style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
        background: "transparent", border: `1.5px solid ${T.border}`, borderRadius: 8,
        fontSize: 13, fontWeight: 600, color: T.muted, cursor: "pointer", marginBottom: 16,
        fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .18s",
      }}>← Back to Assignments</button>

      {/* ═══ LOADING ═══ */}
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
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", marginBottom: 4 }}>
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

      {/* ═══ TEXT FALLBACK ═══ */}
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
          <button className="mba-btn-ghost" onClick={onClose} style={{ marginTop: 16 }}>Close</button>
        </div>
      )}

      {/* ═══ STRUCTURED RESULT ═══ */}
      {!loading && result?.type === "structured" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header: Score + Grade */}
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
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.gold }}>
                AI Case Study Review
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 10px" }}>
                <span style={{ fontSize: 20 }}>{gradeEmoji(result.grade)}</span>
                <span style={{ fontSize: 32, fontWeight: 800, color: T.white }}>{result.grade}</span>
                <span style={{
                  padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: sbg(result.score), color: sc(result.score),
                }}>{result.score >= 70 ? "Well Done" : result.score >= 40 ? "Needs Work" : "Needs Improvement"}</span>
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
            <div style={{
              background: T.white, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: "22px 28px", boxShadow: "0 2px 12px rgba(26,39,68,.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <Target size={16} style={{ color: T.navy }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Rubric Breakdown</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.rubricScores.map((r, i) => {
                  const pct = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0;
                  return (
                    <div key={i}>
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
            </div>
          )}

          {/* What Went Wrong */}
          {result.missingConcepts?.length > 0 && (
            <div style={{
              background: T.white, border: `1px solid #fecaca`, borderLeft: `4px solid ${T.red}`,
              borderRadius: 14, padding: "22px 28px", boxShadow: "0 2px 12px rgba(26,39,68,.06)",
            }}>
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
            <div style={{
              background: T.white, border: `1px solid ${T.goldBorder}`, borderLeft: `4px solid ${T.gold}`,
              borderRadius: 14, padding: "22px 28px", boxShadow: "0 2px 12px rgba(26,39,68,.06)",
            }}>
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
            <div style={{
              background: T.white, border: `1px solid #c7d2fe`, borderLeft: `4px solid ${T.blue}`,
              borderRadius: 14, padding: "22px 28px", boxShadow: "0 2px 12px rgba(26,39,68,.06)",
            }}>
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
              padding: "22px 28px", boxShadow: "0 2px 12px rgba(26,39,68,.06)",
              display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>👏</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                  From Your AI Mentor
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, lineHeight: 1.75 }}>
                  {result.encouragement}
                </p>
              </div>
            </div>
          )}

          {/* Processing Info */}
          {result.time && (
            <div style={{ textAlign: "center", padding: "4px 0" }}>
              <span style={{ fontSize: 11, color: T.subtle }}>
                Reviewed in {(result.time / 1000).toFixed(1)}s · Powered by AiRev Agent
              </span>
            </div>
          )}

          {/* Buttons */}
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
          </div>
        </div>
      )}
    </div>
  );
}