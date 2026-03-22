// src/components/AiRevPanel.jsx
// Self-contained AiRev component — zero dependency on Dashboard.jsx
// Uses mba-card, mba-btn-ghost, mba-btn-gold CSS classes from Dashboard styles
//
// Usage in Dashboard.jsx:
//   import AiRevPanel from "../../components/AiRevPanel";
//   {showAiRev && selected && (
//     <AiRevPanel
//       assignment={selected}
//       submissionNotes={submitForm.notes}
//       onClose={() => { setShowAiRev(false); setAiRevResult(null); }}
//     />
//   )}

import { useState, useEffect } from "react";
import { Bot } from "lucide-react";

const T = {
  navy: "#1a2744", gold: "#b8960b", bg: "#f7f8fc",
  border: "#e8e9f0", text: "#1a1a1a", muted: "#72706b", subtle: "#a8a49f",
};

const AIREV_URL = "https://upskill25-airev.hf.space";
const AIREV_KEY = "ede1b07cd490cf784b9a1ca0943e5584ceee431b7fb12472704f3fe899e690f4";

export default function AiRevPanel({ assignment, submissionNotes, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const sc = (s) => s >= 70 ? "#16a34a" : s >= 40 ? "#d97706" : "#dc2626";
  const sbg = (s) => s >= 70 ? "#f0fdf4" : s >= 40 ? "#fffbeb" : "#fef2f2";

  return (
    <div style={{ marginTop: 20 }}>
      <button className="mba-btn-ghost" onClick={onClose} style={{ marginBottom: 14, fontSize: 13 }}>← Back to Assignments</button>

      {loading && (
        <div className="mba-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "mba-spin 2s linear infinite" }}>
            <Bot size={24} style={{ color: "#fff" }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 800, color: T.navy, marginBottom: 4 }}>AiRev is Reviewing...</p>
          <p style={{ fontSize: 13, color: T.muted }}>{assignment.title}</p>
          <p style={{ fontSize: 12, color: T.subtle, marginTop: 12 }}>This usually takes 30-60 seconds</p>
        </div>
      )}

      {!loading && result?.type === "text" && (
        <div className="mba-card" style={{ padding: 24 }}>
          <p style={{ color: T.muted, lineHeight: 1.7 }}>{result.text}</p>
          <button className="mba-btn-ghost" onClick={onClose} style={{ marginTop: 12 }}>Close</button>
        </div>
      )}

      {!loading && result?.type === "structured" && (
        <div>
          {/* Score + Grade */}
          <div className="mba-card" style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", marginBottom: 14 }}>
            <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
              <svg width={90} height={90} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={45} cy={45} r={37} fill="none" stroke="#e5e7eb" strokeWidth={7} />
                <circle cx={45} cy={45} r={37} fill="none" stroke={sc(result.score)} strokeWidth={7} strokeDasharray={232} strokeDashoffset={232 - (result.score / 100) * 232} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 7, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: sbg(result.score) }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: sc(result.score) }}>{result.score}</span>
                <span style={{ fontSize: 9, color: T.muted }}>/ 100</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>{assignment.title}</p>
              <p style={{ fontSize: 30, fontWeight: 800, color: sc(result.score) }}>{result.grade}</p>
              <p style={{ fontSize: 13, color: T.text, marginTop: 8, lineHeight: 1.65, background: T.bg, padding: "10px 14px", borderRadius: 10 }}>{result.summary}</p>
            </div>
          </div>

          {/* Rubric */}
          {result.rubricScores?.length > 0 && (
            <div className="mba-card" style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>Rubric Breakdown</p>
              {result.rubricScores.map((r, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.criteria}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: sc(r.percentage) }}>{r.score}/{r.maxScore}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "#f1f5f9" }}>
                    <div style={{ height: 5, borderRadius: 3, width: `${r.percentage}%`, background: sc(r.percentage), transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ❌ What Went Wrong */}
          {result.missingConcepts?.length > 0 && (
            <div className="mba-card" style={{ borderLeft: "5px solid #dc2626", marginBottom: 14 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#dc2626", marginBottom: 12 }}>❌ What Went Wrong</p>
              {(result.improvements || []).slice(0, 3).map((s, i) => (
                <p key={i} style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 10, paddingLeft: 14, borderLeft: "3px solid #fee2e2" }}>{s}</p>
              ))}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                {result.missingConcepts.map((c, i) => (
                  <span key={i} style={{ padding: "4px 11px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* 💡 What Could Be Better */}
          <div className="mba-card" style={{ borderLeft: `5px solid ${T.gold}`, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: T.gold, marginBottom: 12 }}>💡 What Could Be Better</p>
            {(result.strengths || []).map((s, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 10, paddingLeft: 14, borderLeft: "3px solid #fef3c7" }}>{s}</p>
            ))}
            {result.coveredConcepts?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>You covered well:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {result.coveredConcepts.map((c, i) => (
                    <span key={i} style={{ padding: "4px 11px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 🚀 Improvement Areas */}
          {result.suggestions?.length > 0 && (
            <div className="mba-card" style={{ borderLeft: "5px solid #2563eb", marginBottom: 14 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#1e40af", marginBottom: 12 }}>🚀 Improvement Areas</p>
              {result.suggestions.map((s, i) => (
                <p key={i} style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 10, paddingLeft: 14, borderLeft: "3px solid #dbeafe" }}>📖 {s}</p>
              ))}
            </div>
          )}

          {/* Encouragement */}
          {result.encouragement && (
            <div className="mba-card" style={{ background: T.bg, border: `1px solid ${T.border}`, marginTop: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.navy, lineHeight: 1.7 }}>{result.encouragement}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="mba-btn-ghost" onClick={onClose}>← Back</button>
            <button className="mba-btn-gold" onClick={runReview} style={{ fontSize: 13 }}>
              <Bot size={13} /> Re-analyse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}