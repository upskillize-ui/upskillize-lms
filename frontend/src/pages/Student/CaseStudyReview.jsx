/**
 * CaseStudyReview.jsx — Student Case Study Submission & AI Feedback
 * Route: /student/case-study
 *
 * Screens:
 * 1. List       — all assigned case studies
 * 2. Detail     — read + submit answer
 * 3. AI Feedback — scores, rubric, recommendations
 * 4. Progress   — all attempts with best scores
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

// ─── Agent config ─────────────────────────────────────────────────────────────
const AGENT_URL = import.meta.env.VITE_AGENT_URL || "http://localhost:7860";
const AGENT_API_KEY = import.meta.env.VITE_AGENT_API_KEY || "";

async function callAgent(endpoint, body) {
  const res = await fetch(`${AGENT_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": AGENT_API_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Agent error ${res.status}`);
  }
  return res.json();
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  darkBlue: "#1e3a5f",
  mediumBlue: "#2c5aa0",
  lightBlue: "#4a7ba7",
  orange: "#FF8C00",
  teal: "#00796B",
  purple: "#7c3aed",
  bgLight: "#f5f7fa",
  bgWhite: "#ffffff",
  textDark: "#1a1a1a",
  textGray: "#666666",
  textMuted: "#999999",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  border: "#e5e7eb",
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
const Badge = ({ children, color = C.mediumBlue, bg }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      padding: "3px 12px",
      borderRadius: 20,
      background: bg || `${color}15`,
      color,
      border: `1px solid ${color}30`,
      display: "inline-block",
    }}
  >
    {children}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: C.bgWhite,
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      border: `1px solid ${C.border}`,
      ...style,
    }}
  >
    {children}
  </div>
);

const Btn = ({
  children,
  onClick,
  variant = "primary",
  disabled,
  style = {},
}) => {
  const v = {
    primary: { background: C.orange, color: "#fff", border: "none" },
    secondary: {
      background: C.bgLight,
      color: C.textDark,
      border: `1px solid ${C.border}`,
    },
    ghost: {
      background: "transparent",
      color: C.mediumBlue,
      border: `1px solid ${C.mediumBlue}`,
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 24px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "all 0.2s",
        fontFamily: "inherit",
        ...v[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const ProgressBar = ({ value, max = 100, color = C.success, height = 8 }) => (
  <div
    style={{
      width: "100%",
      height,
      background: "#e5e7eb",
      borderRadius: height,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${Math.min((value / max) * 100, 100)}%`,
        height: "100%",
        background: color,
        borderRadius: height,
        transition: "width 0.6s ease",
      }}
    />
  </div>
);

const BackBtn = ({ onClick, label = "Back to Case Studies" }) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      color: C.mediumBlue,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      marginBottom: 20,
      padding: 0,
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}
  >
    ← {label}
  </button>
);

// ─── Screen 1: List ───────────────────────────────────────────────────────────
function CaseStudyList({ onSelect, onViewProgress, refreshKey }) {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCaseStudies([]);
    api
      .get("/enrollments/my-enrollments")
      .catch(() => ({ data: { enrollments: [] } }))
      .then((enrollRes) => {
        const courseIds = (enrollRes.data.enrollments || []).map(
          (e) => e.course_id,
        );
        if (!courseIds.length) {
          setLoading(false);
          return;
        }
        Promise.all(
          courseIds.map((id) =>
            api
              .get(`/case-study/course/${id}`)
              .catch(() => ({ data: { caseStudies: [] } })),
          ),
        )
          .then((results) => {
            setCaseStudies(results.flatMap((r) => r.data.caseStudies || []));
          })
          .finally(() => setLoading(false));
      });
  }, [refreshKey]);

  const statusColors = {
    published: C.success,
    draft: C.warning,
    archived: C.textMuted,
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <div
          style={{
            fontSize: 48,
            marginBottom: 16,
            animation: "pulse 2s infinite",
          }}
        >
          ✨
        </div>
        <p style={{ color: C.textGray, fontSize: 15 }}>
          Loading your case studies...
        </p>
      </div>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: C.darkBlue,
              margin: 0,
            }}
          >
            📝 Case Study Assignments
          </h2>
          <p style={{ fontSize: 14, color: C.textGray, margin: "6px 0 0" }}>
            Submit your answers and get personalised AI feedback instantly
          </p>
        </div>
        <Btn variant="ghost" onClick={onViewProgress}>
          📊 My Progress
        </Btn>
      </div>

      {/* AI banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.darkBlue}, ${C.mediumBlue})`,
          borderRadius: 16,
          padding: "20px 28px",
          marginBottom: 22,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 40 }}>🤖</div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>
            AI-Powered Feedback
          </p>
          <p style={{ fontSize: 13, opacity: 0.85, margin: "4px 0 0" }}>
            Submit your answer and receive detailed, personalised feedback
            within seconds. Our AI mentor always suggests ways to improve —
            never discourages.
          </p>
        </div>
      </div>

      {caseStudies.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 56 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
          <h3 style={{ color: C.darkBlue, marginBottom: 8, fontWeight: 700 }}>
            No Case Studies Yet
          </h3>
          <p
            style={{
              color: C.textGray,
              fontSize: 14,
              maxWidth: 360,
              margin: "0 auto",
            }}
          >
            Your instructor hasn't published any case studies yet. Check back
            soon!
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {caseStudies.map((cs, idx) => (
            <Card
              key={cs.id ?? idx}
              style={{
                cursor: "pointer",
                transition: "box-shadow 0.2s",
                borderLeft: `4px solid ${statusColors[cs.status] || C.mediumBlue}`,
              }}
              onClick={() => onSelect(cs)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: C.darkBlue,
                      margin: "0 0 6px",
                    }}
                  >
                    {cs.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: C.textGray,
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {cs.description?.substring(0, 140)}...
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Badge color={statusColors[cs.status]}>{cs.status}</Badge>
                  {cs.deadline && (
                    <Badge
                      color={
                        new Date(cs.deadline) < new Date()
                          ? C.danger
                          : C.warning
                      }
                    >
                      📅{" "}
                      {new Date(cs.deadline).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </Badge>
                  )}
                  <span style={{ fontSize: 18, color: C.mediumBlue }}>→</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Screen 2: Detail + Submit ────────────────────────────────────────────────
function CaseStudyDetail({ caseStudy, onBack, onSubmitted }) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const minWords = caseStudy.word_limit_min || 300;
  const maxWords = caseStudy.word_limit_max || 500;
  const wordColor =
    wordCount < minWords
      ? C.danger
      : wordCount > maxWords
        ? C.warning
        : C.success;

  const questions = useMemo(() => {
    try {
      return JSON.parse(caseStudy.questions);
    } catch {
      return [];
    }
  }, [caseStudy.questions]);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError("Please write your answer before submitting.");
      return;
    }
    if (wordCount < minWords) {
      setError(
        `Your answer needs at least ${minWords} words. You're at ${wordCount} — almost there! 💪`,
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const agentRes = await callAgent("/api/review/submit", {
        caseStudyId: caseStudy.id,
        studentId: user?.id || 0,
        answerText: answer.trim(),
      });
      onSubmitted(agentRes);
    } catch (err) {
      try {
        const lmsRes = await api.post("/case-study/submit", {
          caseStudyId: caseStudy.id,
          answerText: answer.trim(),
        });
        onSubmitted(lmsRes.data);
      } catch (lmsErr) {
        setError(
          lmsErr.response?.data?.error ||
            err.message ||
            "Submission failed. Please try again — your work is safe.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 500,
          padding: 40,
        }}
      >
        <style>{`
        @keyframes floatBot { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes loadingBar { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
        <div
          style={{
            fontSize: 72,
            animation: "floatBot 2s ease-in-out infinite",
            marginBottom: 24,
          }}
        >
          🤖
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: C.darkBlue,
            margin: "0 0 10px",
            textAlign: "center",
          }}
        >
          Reviewing Your Answer...
        </h2>
        <p
          style={{
            fontSize: 14,
            color: C.textGray,
            maxWidth: 380,
            textAlign: "center",
            lineHeight: 1.7,
            margin: "0 0 24px",
          }}
        >
          Our AI mentor is carefully reading your response and preparing
          personalised feedback just for you. ✨
        </p>
        <div
          style={{
            width: 220,
            height: 6,
            background: "#e5e7eb",
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: "65%",
              height: "100%",
              background: C.orange,
              borderRadius: 6,
              animation: "loadingBar 1.8s infinite",
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: C.textMuted }}>
          This usually takes 15–30 seconds
        </p>
      </div>
    );

  return (
    <div>
      <BackBtn onClick={onBack} />

      <Card style={{ marginBottom: 20, borderTop: `4px solid ${C.darkBlue}` }}>
        <h2
          style={{
            fontSize: 21,
            fontWeight: 800,
            color: C.darkBlue,
            margin: "0 0 12px",
          }}
        >
          {caseStudy.title}
        </h2>
        <p
          style={{
            fontSize: 14,
            color: C.textDark,
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
          }}
        >
          {caseStudy.description}
        </p>
        {questions.length > 0 && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              background: "#EFF6FF",
              borderRadius: 12,
              borderLeft: `4px solid ${C.mediumBlue}`,
            }}
          >
            <h4
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.mediumBlue,
                margin: "0 0 10px",
              }}
            >
              Questions to Answer:
            </h4>
            {questions.map((q, i) => (
              <p
                key={i}
                style={{
                  fontSize: 14,
                  color: C.textDark,
                  margin: "8px 0",
                  lineHeight: 1.6,
                }}
              >
                <strong>Q{i + 1}:</strong>{" "}
                {typeof q === "string" ? q : q.question || JSON.stringify(q)}
              </p>
            ))}
          </div>
        )}
        <div
          style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}
        >
          <Badge color={C.teal}>
            📝 {minWords}–{maxWords} words
          </Badge>
          {caseStudy.deadline && (
            <Badge color={C.warning}>
              📅 Due: {new Date(caseStudy.deadline).toLocaleDateString("en-IN")}
            </Badge>
          )}
          <Badge color={C.mediumBlue}>
            💯 Max: {caseStudy.max_score || 100} points
          </Badge>
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.darkBlue,
            margin: "0 0 4px",
          }}
        >
          Your Answer
        </h3>
        <p style={{ fontSize: 13, color: C.textGray, margin: "0 0 14px" }}>
          Write a thorough response. Include real-world examples and structure
          your answer clearly. 💡
        </p>
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Start writing here... Cover the key concepts, include examples from real life, and structure your answer with an introduction, analysis, and conclusion."
          style={{
            width: "100%",
            minHeight: 320,
            padding: 16,
            fontSize: 14,
            lineHeight: 1.8,
            borderRadius: 12,
            border: `2px solid ${focused || answer ? C.mediumBlue : C.border}`,
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
            outline: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <div style={{ flex: 1, marginRight: 14 }}>
            <ProgressBar value={wordCount} max={maxWords} color={wordColor} />
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: wordColor,
              whiteSpace: "nowrap",
            }}
          >
            {wordCount} / {minWords}–{maxWords} words
          </span>
        </div>
        {wordCount > 0 && wordCount < minWords && (
          <p style={{ fontSize: 12, color: C.warning, margin: "6px 0 0" }}>
            💬 {minWords - wordCount} more words to go — you're doing great!
          </p>
        )}
        {wordCount >= minWords && wordCount <= maxWords && (
          <p style={{ fontSize: 12, color: C.success, margin: "6px 0 0" }}>
            ✅ Great length — you're in the ideal range!
          </p>
        )}
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: 14,
              background: "#FEF2F2",
              borderRadius: 10,
              color: C.danger,
              fontSize: 13,
              border: `1px solid #FECACA`,
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </Card>

      <div style={{ display: "flex", gap: 12 }}>
        <Btn variant="secondary" onClick={onBack}>
          Cancel
        </Btn>
        <Btn
          onClick={handleSubmit}
          disabled={submitting || wordCount < minWords}
          style={{ flex: 1, fontSize: 15 }}
        >
          ⚡ Submit for AI Review
        </Btn>
      </div>
    </div>
  );
}

// ─── Screen 3: AI Feedback ────────────────────────────────────────────────────
function AIFeedback({ feedback, submission, onBack, onRetry }) {
  const fb = feedback?.feedback || feedback;
  const score =
    fb?.score != null ? fb.score : fb?.totalScore != null ? fb.totalScore : 0;
  const grade = fb?.grade || "—";
  const pct = score;
  const band =
    pct >= 85
      ? "Excellent 🌟"
      : pct >= 70
        ? "Good 👏"
        : pct >= 50
          ? "Getting There 💪"
          : "Keep Going 📚";
  const bandColor =
    pct >= 85
      ? C.success
      : pct >= 70
        ? C.mediumBlue
        : pct >= 50
          ? C.warning
          : C.danger;

  const Section = ({ title, color, children }) => (
    <Card style={{ marginBottom: 18, borderLeft: `4px solid ${color}` }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color, margin: "0 0 12px" }}>
        {title}
      </h3>
      {children}
    </Card>
  );

  const BulletItem = ({ text, color }) => (
    <div
      style={{
        fontSize: 14,
        color: C.textDark,
        padding: "7px 0 7px 14px",
        borderLeft: `2px solid ${color}40`,
        marginBottom: 6,
        lineHeight: 1.7,
      }}
    >
      {text}
    </div>
  );

  return (
    <div>
      <BackBtn onClick={onBack} />

      {/* Score card */}
      <Card
        style={{
          textAlign: "center",
          marginBottom: 20,
          borderTop: `4px solid ${bandColor}`,
          paddingTop: 32,
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 10 }}>
          {pct >= 70 ? "🎉" : pct >= 50 ? "📊" : "📚"}
        </div>
        <Badge color={bandColor} bg={`${bandColor}15`}>
          {band}
        </Badge>
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            color: bandColor,
            margin: "14px 0 4px",
            lineHeight: 1,
          }}
        >
          {Math.round(score)}
          <span style={{ fontSize: 24, fontWeight: 600 }}>/100</span>
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.darkBlue,
            marginBottom: 6,
          }}
        >
          Grade: {grade}
        </div>
        {submission?.attemptNumber && (
          <p style={{ fontSize: 12, color: C.textMuted }}>
            Attempt #{submission.attemptNumber}
          </p>
        )}
        {fb?.summary && (
          <p
            style={{
              fontSize: 14,
              color: C.textGray,
              maxWidth: 500,
              margin: "12px auto 0",
              lineHeight: 1.7,
            }}
          >
            {fb.summary}
          </p>
        )}
      </Card>

      {/* Partial review notice */}
      {feedback?.partialReview && (
        <Card
          style={{
            marginBottom: 18,
            background: "#FFFBEB",
            border: `1px solid #FCD34D`,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "#92400E",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            ℹ️ {feedback.message}
          </p>
        </Card>
      )}

      {/* Rubric breakdown */}
      {fb?.rubricScores?.length > 0 && (
        <Card style={{ marginBottom: 18 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.darkBlue,
              margin: "0 0 16px",
            }}
          >
            📊 Score Breakdown
          </h3>
          {fb.rubricScores.map((r, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}
                >
                  {r.criteria || r.name}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      r.percentage >= 70
                        ? C.success
                        : r.percentage >= 50
                          ? C.warning
                          : C.danger,
                  }}
                >
                  {r.score}/{r.maxScore} ({r.percentage}%)
                </span>
              </div>
              <ProgressBar
                value={r.percentage}
                color={
                  r.percentage >= 70
                    ? C.success
                    : r.percentage >= 50
                      ? C.warning
                      : C.danger
                }
              />
            </div>
          ))}
        </Card>
      )}

      {fb?.strengths?.length > 0 && (
        <Section title="✅ What You Did Well" color={C.success}>
          {fb.strengths.map((s, i) => (
            <BulletItem key={i} text={s} color={C.success} />
          ))}
        </Section>
      )}

      {fb?.improvements?.length > 0 && (
        <Section title="📈 Areas to Strengthen" color={C.warning}>
          {fb.improvements.map((s, i) => (
            <BulletItem key={i} text={s} color={C.warning} />
          ))}
        </Section>
      )}

      {fb?.coveredConcepts?.length > 0 && (
        <Section title="✓ Concepts You Covered" color={C.teal}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {fb.coveredConcepts.map((c, i) => (
              <Badge key={i} color={C.teal}>
                {c}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {fb?.missingConcepts?.length > 0 && (
        <Section title="💡 Concepts to Add Next Time" color={C.orange}>
          <p style={{ fontSize: 13, color: C.textGray, margin: "0 0 10px" }}>
            Including these in your next attempt will boost your score:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {fb.missingConcepts.map((c, i) => (
              <Badge key={i} color={C.orange}>
                {c}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {fb?.detailedFeedback && (
        <Section title="💬 Personalised Feedback" color={C.mediumBlue}>
          <p
            style={{
              fontSize: 14,
              color: C.textDark,
              lineHeight: 1.9,
              whiteSpace: "pre-wrap",
              margin: 0,
            }}
          >
            {fb.detailedFeedback}
          </p>
        </Section>
      )}

      {fb?.suggestions?.length > 0 && (
        <Section title="📖 Recommended Topics to Explore" color={C.purple}>
          {fb.suggestions.map((s, i) => (
            <BulletItem key={i} text={s} color={C.purple} />
          ))}
        </Section>
      )}

      {fb?.wordCount && (
        <Card style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 14, color: C.textGray }}>Word Count</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: fb.wordCountMessage?.includes("short")
                  ? C.warning
                  : C.success,
              }}
            >
              {fb.wordCount} words{" "}
              {fb.wordCountMessage && `— ${fb.wordCountMessage}`}
            </span>
          </div>
        </Card>
      )}

      {fb?.encouragement && (
        <Card
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)",
            border: `1px solid #FCD34D`,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "#92400E",
              margin: 0,
              lineHeight: 1.8,
              fontWeight: 500,
            }}
          >
            {fb.encouragement}
          </p>
        </Card>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <Btn variant="secondary" onClick={onBack}>
          Back to List
        </Btn>
        <Btn onClick={onRetry} style={{ flex: 1 }}>
          🔄 Try Again
        </Btn>
      </div>
    </div>
  );
}

// ─── Screen 4: Progress ───────────────────────────────────────────────────────
function MyProgress({ onBack }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch(`${AGENT_URL}/api/review/student-progress/${user?.id || 0}`, {
      headers: { "x-api-key": AGENT_API_KEY },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setProgress(data.student))
      .catch(() =>
        api
          .get("/case-study/my-progress")
          .then((r) => setProgress(r.data.student))
          .catch(() => setFetchError(true)),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 56 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <p style={{ color: C.textGray }}>Loading your progress...</p>
      </div>
    );

  if (fetchError)
    return (
      <div>
        <BackBtn onClick={onBack} />
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
          <h3 style={{ color: C.darkBlue, marginBottom: 8 }}>
            Couldn't Load Progress
          </h3>
          <p style={{ color: C.textGray, fontSize: 14 }}>
            We had a small hiccup. Please try again in a moment.
          </p>
          <Btn
            style={{ marginTop: 16 }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Btn>
        </Card>
      </div>
    );

  const stats = progress?.overallStats || {};

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: C.darkBlue,
          margin: "0 0 22px",
        }}
      >
        📊 My Progress
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          ["📝", "Total", stats.totalCaseStudies || 0, C.mediumBlue],
          ["✅", "Completed", stats.completedCount || 0, C.success],
          [
            "📈",
            "Avg Current",
            `${Math.round(stats.averageCurrentScore || 0)}%`,
            C.warning,
          ],
          [
            "⭐",
            "Best Avg",
            `${Math.round(stats.averageBestScore || 0)}%`,
            C.orange,
          ],
          ["🤝", "Need Help", stats.needsHelpCount || 0, C.danger],
        ].map(([icon, label, value, color]) => (
          <Card key={label} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
              {label}
            </div>
          </Card>
        ))}
      </div>

      {!progress?.caseStudies?.length ? (
        <Card style={{ textAlign: "center", padding: 44 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌱</div>
          <p style={{ color: C.textGray, fontSize: 14 }}>
            No submissions yet — submit your first answer to start tracking your
            growth!
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {progress.caseStudies.map((cs, i) => {
            const statusColor =
              cs.status === "completed"
                ? C.success
                : cs.status === "needs_help"
                  ? C.danger
                  : C.warning;
            return (
              <Card key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h4
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.darkBlue,
                        margin: "0 0 6px",
                      }}
                    >
                      {cs.title}
                    </h4>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge color={statusColor}>
                        {cs.status?.replace("_", " ")}
                      </Badge>
                      <Badge color={C.textMuted}>
                        {cs.totalAttempts} attempt
                        {cs.totalAttempts !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 20, alignItems: "center" }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        Current
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: C.mediumBlue,
                        }}
                      >
                        {Math.round(cs.currentScore)}%
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        Best
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: C.success,
                        }}
                      >
                        {Math.round(cs.bestScore)}%
                      </div>
                    </div>
                    {cs.improvement > 0 && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: C.textMuted }}>
                          Growth
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: C.teal,
                          }}
                        >
                          +{Math.round(cs.improvement)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <ProgressBar
                    value={cs.bestScore}
                    color={
                      cs.bestScore >= 70
                        ? C.success
                        : cs.bestScore >= 50
                          ? C.warning
                          : C.danger
                    }
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function CaseStudyReview() {
  const [screen, setScreen] = useState("list");
  const [selectedCS, setSelectedCS] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const goToList = () => {
    setRefreshKey((k) => k + 1);
    setScreen("list");
  };

  return (
    <div
      style={{
        background: C.bgLight,
        minHeight: "100vh",
        padding: "30px 20px",
      }}
    >
      <style>{`
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          animation: "fadeIn 0.3s ease",
        }}
      >
        {screen === "list" && (
          <CaseStudyList
            refreshKey={refreshKey}
            onSelect={(cs) => {
              setSelectedCS(cs);
              setScreen("detail");
            }}
            onViewProgress={() => setScreen("progress")}
          />
        )}
        {screen === "detail" && selectedCS && (
          <CaseStudyDetail
            caseStudy={selectedCS}
            onBack={goToList}
            onSubmitted={(data) => {
              setFeedbackData(data);
              setSubmissionData(data.submission);
              setScreen("feedback");
            }}
          />
        )}
        {screen === "feedback" && feedbackData && (
          <AIFeedback
            feedback={feedbackData}
            submission={submissionData}
            onBack={() => {
              setFeedbackData(null);
              goToList();
            }}
            onRetry={() => {
              setFeedbackData(null);
              setScreen("detail");
            }}
          />
        )}
        {screen === "progress" && <MyProgress onBack={goToList} />}
      </div>
    </div>
  );
}
