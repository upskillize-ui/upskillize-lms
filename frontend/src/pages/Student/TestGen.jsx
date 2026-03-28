/**
 * TestGen.jsx — UPSKILLIZE BRANDED VERSION
 *
 * ✅ Matches https://lms.upskillize.com colors & design
 * ✅ Dark Blue sidebar theme
 * ✅ Orange CTA buttons
 * ✅ Professional spacing & typography
 * ✅ Dynamic N questions (1-100)
 * ✅ Dynamic duration (1-180 minutes)
 * ✅ Beautiful loading spinner
 * ✅ 200+ concurrent support
 */

import { useState, useEffect } from "react";
import api from "../../services/api";

// ============================================================================
// UPSKILLIZE DESIGN TOKENS - Matches your website perfectly
// ============================================================================

const COLORS = {
  // Primary
  darkBlue: "#1e3a5f",
  mediumBlue: "#2c5aa0",
  lightBlue: "#4a7ba7",

  // Accent
  orange: "#FF8C00",
  orangeLight: "#FF9500",
  orangeHover: "#e67e00",

  // Backgrounds
  bgLight: "#f5f7fa",
  bgWhite: "#ffffff",
  bgGray: "#ececf1",

  // Text
  textDark: "#1a1a1a",
  textGray: "#666666",
  textMuted: "#999999",
  textLight: "#f5f7fa",

  // Status
  success: "#4caf50",
  warning: "#ff9800",
  danger: "#f44336",
  info: "#2196f3",

  // Borders
  border: "#e0e0e0",
  borderLight: "#f0f0f0",
};

const DIFFICULTIES = {
  easy: {
    icon: "📘",
    label: "Easy",
    color: "#4caf50",
    desc: "Foundational recall",
  },
  medium: {
    icon: "📙",
    label: "Medium",
    color: "#ff9800",
    desc: "Applied understanding",
  },
  hard: { icon: "📕", label: "Hard", color: "#f44336", desc: "Deep analysis" },
  complex: {
    icon: "🎯",
    label: "Complex",
    color: "#9c27b0",
    desc: "Synthesis & evaluation",
  },
};

// ============================================================================
// LOADING SPINNER - Upskillize Branded
// ============================================================================

const LoadingSpinner = ({ message = "Generating Your Test" }) => {
  const messages = [
    "📖 Analyzing course content...",
    "🤖 Generating questions with AI...",
    "⚡ Creating balanced test...",
    "✨ Finalizing your test...",
    "🎉 Almost ready...",
  ];

  const [displayMessage, setDisplayMessage] = useState(message);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 20, 90));
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "600px",
        padding: "40px 20px",
        background: `linear-gradient(135deg, ${COLORS.bgLight} 0%, #ffffff 100%)`,
      }}
    >
      {/* Animated Logo */}
      <div
        style={{
          fontSize: 80,
          marginBottom: 30,
          animation: "bounce 2s infinite",
        }}
      >
        ⚡
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.darkBlue,
          margin: "0 0 8px",
          textAlign: "center",
        }}
      >
        {message}
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 14,
          color: COLORS.textGray,
          maxWidth: 400,
          marginTop: 8,
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        {displayMessage}
      </p>

      {/* Progress Bar */}
      <div
        style={{
          width: 300,
          height: 8,
          background: COLORS.border,
          borderRadius: 10,
          overflow: "hidden",
          marginTop: 40,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(progress, 10)}%`,
            background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.orangeLight})`,
            transition: "width 0.4s ease",
            borderRadius: 10,
          }}
        />
      </div>

      <p
        style={{
          fontSize: 12,
          color: COLORS.textMuted,
          marginTop: 12,
          fontFamily: "monospace",
        }}
      >
        {Math.round(progress)}% complete
      </p>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-20px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// SETUP SCREEN
// ============================================================================

function SetupScreen({ onGenerate, loading, slots }) {
  const [enrollments, setEnrollments] = useState([]);
  const [modules, setModules] = useState([]);
  const [loadingEnroll, setLoadingEnroll] = useState(true);
  const [loadingMod, setLoadingMod] = useState(false);

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [topic, setTopic] = useState("");

  const [nQInput, setNQInput] = useState("10");
  const [nQ, setNQ] = useState(10);
  const [durInput, setDurInput] = useState("15");
  const [dur, setDur] = useState(15);
  const [diff, setDiff] = useState("medium");
  const [types, setTypes] = useState(["mcq"]);
  const [errors, setErrors] = useState({});

  // Fetch enrollments
  useEffect(() => {
    api
      .get("/enrollments/my-enrollments")
      .then((r) => setEnrollments(r.data.enrollments || []))
      .catch((err) => {
        console.error("Failed to fetch enrollments:", err);
        setEnrollments([]);
      })
      .finally(() => setLoadingEnroll(false));
  }, []);

  // Fetch modules when course selected
  useEffect(() => {
    if (!course) {
      setModules([]);
      return;
    }
    setLoadingMod(true);
    setLesson(null);
    setTopic(course.name);

    api
      .get(`/modules/course/${course.id}`)
      .then((r) => setModules(r.data.modules || []))
      .catch((err) => {
        console.error("Failed to fetch modules:", err);
        setModules([]);
      })
      .finally(() => setLoadingMod(false));
  }, [course]);

  // ✅ Validate questions (1-100)
  const handleNQChange = (e) => {
    const val = e.target.value;
    setNQInput(val);

    if (val === "") {
      setErrors((p) => ({ ...p, nQ: null }));
      return;
    }

    const num = parseInt(val);
    if (isNaN(num)) {
      setErrors((p) => ({ ...p, nQ: "Enter a valid number" }));
      return;
    }
    if (num < 1) {
      setErrors((p) => ({
        ...p,
        nQ: `Minimum 1 question (you entered ${num})`,
      }));
      return;
    }
    if (num > 100) {
      setErrors((p) => ({
        ...p,
        nQ: `Maximum 100 questions (you entered ${num})`,
      }));
      return;
    }

    setErrors((p) => ({ ...p, nQ: null }));
    setNQ(num);
  };

  // ✅ Validate duration (1-180 minutes)
  const handleDurChange = (e) => {
    const val = e.target.value;
    setDurInput(val);

    if (val === "") {
      setErrors((p) => ({ ...p, dur: null }));
      return;
    }

    const num = parseInt(val);
    if (isNaN(num)) {
      setErrors((p) => ({ ...p, dur: "Enter a valid number" }));
      return;
    }
    if (num < 1) {
      setErrors((p) => ({
        ...p,
        dur: `Minimum 1 minute (you entered ${num})`,
      }));
      return;
    }
    if (num > 180) {
      setErrors((p) => ({
        ...p,
        dur: `Maximum 180 minutes (you entered ${num})`,
      }));
      return;
    }

    setErrors((p) => ({ ...p, dur: null }));
    setDur(num);
  };

  const toggleType = (t) => {
    setTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  };

  const handleSubmit = () => {
    if (!course) {
      setErrors((p) => ({ ...p, course: "Select a course" }));
      return;
    }
    if (!topic.trim()) {
      setErrors((p) => ({ ...p, topic: "Enter a topic" }));
      return;
    }
    if (topic.length > 200) {
      setErrors((p) => ({ ...p, topic: "Topic must be under 200 characters" }));
      return;
    }
    if (!types.length) {
      setErrors((p) => ({ ...p, types: "Select at least one question type" }));
      return;
    }
    if (errors.nQ || errors.dur) {
      return;
    }

    onGenerate({
      courseId: course.id,
      lectureId: lesson?.id || null,
      topic,
      numQuestions: nQ,
      durationMinutes: dur,
      difficulty: diff,
      questionTypes: types,
    });
  };

  const availSlots = slots?.availableSlots ?? null;
  const isFull = availSlots === 0;

  return (
    <div
      style={{
        background: COLORS.bgLight,
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: COLORS.darkBlue,
              margin: "0 0 8px",
            }}
          >
            ⚡ Generate AI Test
          </h1>
          <p
            style={{
              fontSize: 15,
              color: COLORS.textGray,
              margin: 0,
            }}
          >
            Create custom question papers powered by Claude AI
          </p>
        </div>

        {/* Status Badge */}
        {availSlots !== null && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: isFull
                ? "rgba(244, 67, 54, 0.1)"
                : "rgba(76, 175, 80, 0.1)",
              border: `1px solid ${isFull ? "rgba(244, 67, 54, 0.3)" : "rgba(76, 175, 80, 0.3)"}`,
              color: isFull ? COLORS.danger : COLORS.success,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {isFull
              ? "🔴 All slots occupied"
              : `🟢 ${availSlots} slots available`}
          </div>
        )}

        {/* Main Form Card */}
        <div
          style={{
            background: COLORS.bgWhite,
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          {/* STEP 1: Course Selection */}
          <div style={{ marginBottom: 32 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.darkBlue,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              📚 Step 1: Select Course
            </label>

            {loadingEnroll ? (
              <div
                style={{
                  color: COLORS.textMuted,
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                Loading your courses...
              </div>
            ) : enrollments.length === 0 ? (
              <div
                style={{
                  background: "rgba(244, 67, 54, 0.1)",
                  border: `1px solid rgba(244, 67, 54, 0.3)`,
                  borderRadius: 8,
                  padding: 16,
                  color: COLORS.danger,
                  fontSize: 14,
                }}
              >
                You are not enrolled in any courses.{" "}
                <a
                  href="/browse-courses"
                  style={{ color: COLORS.orange, fontWeight: 600 }}
                >
                  Enroll now
                </a>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: 12,
                }}
              >
                {enrollments.map((e) => {
                  const c = e.Course;
                  const isSelected = course?.id === e.course_id;
                  return (
                    <button
                      key={e.course_id}
                      onClick={() =>
                        setCourse({
                          id: e.course_id,
                          name: c?.course_name || "Course",
                        })
                      }
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        border: `2px solid ${isSelected ? COLORS.orange : COLORS.border}`,
                        background: isSelected
                          ? "rgba(255, 140, 0, 0.1)"
                          : COLORS.bgWhite,
                        color: isSelected ? COLORS.orange : COLORS.textDark,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all 0.2s",
                        boxShadow: isSelected
                          ? `0 0 0 3px rgba(255, 140, 0, 0.2)`
                          : "none",
                      }}
                    >
                      🎓 {c?.course_name || "Course"}
                      {isSelected && (
                        <div
                          style={{ fontSize: 10, marginTop: 6, opacity: 0.8 }}
                        >
                          ✓ Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2: Lesson Selection (Optional) */}
          {course && (
            <div style={{ marginBottom: 32 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.darkBlue,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                📖 Step 2: Select Lesson (Optional)
              </label>

              {loadingMod ? (
                <div style={{ color: COLORS.textMuted }}>
                  Loading lessons...
                </div>
              ) : modules.length === 0 ? (
                <div style={{ color: COLORS.textMuted, fontSize: 14 }}>
                  No lessons found — will test entire course
                </div>
              ) : (
                <select
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.bgWhite,
                    color: COLORS.textDark,
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                  value={lesson?.id || ""}
                  onChange={(e) => {
                    const flat = modules.flatMap((m) =>
                      (m.Lessons || []).map((l) => ({
                        id: l.id,
                        name: l.lesson_name,
                      })),
                    );
                    setLesson(
                      flat.find((l) => String(l.id) === e.target.value) || null,
                    );
                  }}
                >
                  <option value="">— Entire Course —</option>
                  {modules.map((m) => (
                    <optgroup key={m.id} label={`${m.module_name}`}>
                      {(m.Lessons || []).map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.lesson_name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* STEP 3: Topic */}
          {course && (
            <div style={{ marginBottom: 32 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.darkBlue,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                🎯 Step 3: Topic
              </label>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: `1px solid ${errors.topic ? COLORS.danger : COLORS.border}`,
                  background: COLORS.bgWhite,
                  color: COLORS.textDark,
                  fontSize: 13,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                placeholder="e.g., Payment Systems, Neural Networks, Thermodynamics"
                value={topic}
                maxLength={200}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setErrors((p) => ({ ...p, topic: null }));
                }}
              />
              {errors.topic && (
                <div
                  style={{ color: COLORS.danger, fontSize: 12, marginTop: 6 }}
                >
                  ❌ {errors.topic}
                </div>
              )}
              <div
                style={{
                  fontSize: 11,
                  color: COLORS.textMuted,
                  marginTop: 6,
                }}
              >
                {topic.length}/200 characters
              </div>
            </div>
          )}

          {/* STEP 4: Test Settings */}
          {course && (
            <div style={{ marginBottom: 32 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.darkBlue,
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                ⚙️ Step 4: Test Settings
              </label>

              {/* Settings Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {/* Questions */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: COLORS.textGray,
                      marginBottom: 6,
                    }}
                  >
                    Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: `1px solid ${errors.nQ ? COLORS.danger : COLORS.border}`,
                      background: COLORS.bgWhite,
                      color: COLORS.textDark,
                      fontSize: 13,
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    placeholder="1-100"
                    value={nQInput}
                    onChange={handleNQChange}
                  />
                  {errors.nQ && (
                    <div
                      style={{
                        color: COLORS.danger,
                        fontSize: 11,
                        marginTop: 4,
                      }}
                    >
                      {errors.nQ}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 10,
                      color: COLORS.textMuted,
                      marginTop: 4,
                    }}
                  >
                    1-100 questions
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: COLORS.textGray,
                      marginBottom: 6,
                    }}
                  >
                    Duration
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: `1px solid ${errors.dur ? COLORS.danger : COLORS.border}`,
                      background: COLORS.bgWhite,
                      color: COLORS.textDark,
                      fontSize: 13,
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    placeholder="1-180"
                    value={durInput}
                    onChange={handleDurChange}
                  />
                  {errors.dur && (
                    <div
                      style={{
                        color: COLORS.danger,
                        fontSize: 11,
                        marginTop: 4,
                      }}
                    >
                      {errors.dur}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 10,
                      color: COLORS.textMuted,
                      marginTop: 4,
                    }}
                  >
                    1-180 minutes
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: COLORS.textGray,
                      marginBottom: 6,
                    }}
                  >
                    Difficulty
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.bgWhite,
                      color: COLORS.textDark,
                      fontSize: 13,
                      fontFamily: "inherit",
                    }}
                    value={diff}
                    onChange={(e) => setDiff(e.target.value)}
                  >
                    {Object.entries(DIFFICULTIES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Difficulty Info */}
              {DIFFICULTIES[diff] && (
                <div
                  style={{
                    background: "rgba(255, 140, 0, 0.05)",
                    border: `1px solid rgba(255, 140, 0, 0.2)`,
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 16,
                    fontSize: 13,
                    color: COLORS.textDark,
                  }}
                >
                  <strong style={{ color: COLORS.orange }}>
                    {DIFFICULTIES[diff].icon} {DIFFICULTIES[diff].label}
                  </strong>
                  <br />
                  {DIFFICULTIES[diff].desc}
                  {nQ > 0 && dur > 0 && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: COLORS.textMuted,
                      }}
                    >
                      ≈ {(dur / nQ).toFixed(1)} min per question
                    </div>
                  )}
                </div>
              )}

              {/* Question Types */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.textGray,
                    marginBottom: 10,
                  }}
                >
                  Question Types
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { value: "mcq", label: "MCQ", icon: "✓" },
                    { value: "msq", label: "Multi-Select", icon: "✓✓" },
                    { value: "true_false", label: "True/False", icon: "T/F" },
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => toggleType(value)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        border: `2px solid ${types.includes(value) ? COLORS.orange : COLORS.border}`,
                        background: types.includes(value)
                          ? "rgba(255, 140, 0, 0.1)"
                          : COLORS.bgWhite,
                        color: types.includes(value)
                          ? COLORS.orange
                          : COLORS.textGray,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.types && (
                  <div
                    style={{ color: COLORS.danger, fontSize: 11, marginTop: 8 }}
                  >
                    ❌ {errors.types}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !course ||
              isFull ||
              Object.values(errors).some(Boolean)
            }
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 8,
              border: "none",
              background:
                loading ||
                !course ||
                isFull ||
                Object.values(errors).some(Boolean)
                  ? COLORS.textMuted
                  : COLORS.orange,
              color: COLORS.bgWhite,
              fontSize: 15,
              fontWeight: 700,
              cursor:
                loading ||
                !course ||
                isFull ||
                Object.values(errors).some(Boolean)
                  ? "not-allowed"
                  : "pointer",
              opacity:
                loading ||
                !course ||
                isFull ||
                Object.values(errors).some(Boolean)
                  ? 0.6
                  : 1,
              transition: "all 0.3s",
              boxShadow:
                !loading &&
                !isFull &&
                course &&
                !Object.values(errors).some(Boolean)
                  ? `0 4px 12px rgba(255, 140, 0, 0.3)`
                  : "none",
            }}
            onHover
          >
            {loading
              ? "⚡ Generating Test…"
              : isFull
                ? "⏳ All Slots Occupied"
                : "⚡ Generate Test"}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: COLORS.textMuted,
              marginTop: 16,
            }}
          >
            Powered by Claude AI · Grounded in your course content
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TEST TAKING SCREEN
// ============================================================================

function TestTakingScreen({ testData, onSubmit, onForceExit }) {
  const questions = testData.questions || [];
  const testId = testData.test_id || testData.testId;
  const durationMinutes = testData.duration_minutes || 30;

  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const startTime = useState(Date.now())[0];

  // ── Countdown timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (result) return;
    if (timeLeft <= 0) {
      handleSubmit(true); // auto-submit on timeout
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, result]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const timerColor =
    timeLeft < 60
      ? COLORS.danger
      : timeLeft < 300
        ? COLORS.warning
        : COLORS.success;

  // ── Answer selection ─────────────────────────────────────────────────────────
  const selectAnswer = (qIdx, value, isMulti = false) => {
    setAnswers((prev) => {
      if (isMulti) {
        const current = prev[qIdx] || [];
        return {
          ...prev,
          [qIdx]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        };
      }
      return { ...prev, [qIdx]: value };
    });
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirm(false);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      const res = await onSubmit(testId, questions, answers, timeTaken);
      setResult(res);
    } catch (err) {
      setResult({ error: true, message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const q = questions[currentQ];

  // ── Result Screen ────────────────────────────────────────────────────────────
  if (result) {
    // Map the API response fields correctly
    const totalQ = result.total ?? questions.length;
    const correctCount = result.score ?? 0;
    const wrongCount = totalQ - correctCount;
    const pct = result.percentage ?? (totalQ > 0 ? Math.round((correctCount / totalQ) * 100 * 10) / 10 : 0);
    const band = result.performance_band || (pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Average" : "Needs Improvement");
    const passed = pct >= 50;
    const timeTaken = result.time_taken_seconds || Math.floor((Date.now() - startTime) / 1000);
    const feedback = result.overall_feedback || "";
    const recommendations = result.study_recommendations || [];
    const questionResults = result.results || [];

    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bgLight,
          padding: "30px 20px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          {/* Score Card */}
          <div
            style={{
              background: COLORS.bgWhite,
              borderRadius: 16,
              padding: "40px 32px",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              {result.error ? "❌" : passed ? "🎉" : "📚"}
            </div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: COLORS.darkBlue,
                margin: "0 0 8px",
              }}
            >
              {result.error
                ? "Submission Error"
                : passed ? "Well Done!" : "Keep Practicing!"}
            </h2>

            {result.error ? (
              <p style={{ color: COLORS.danger, marginBottom: 24 }}>
                {result.message}
              </p>
            ) : (
              <>
                {/* Performance Band */}
                <div style={{
                  display: "inline-block",
                  padding: "6px 20px",
                  borderRadius: 20,
                  background: passed ? "#e8f5e9" : "#fff3e0",
                  color: passed ? COLORS.success : COLORS.warning,
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 16,
                }}>
                  {band}
                </div>

                {/* Big Percentage */}
                <div
                  style={{
                    fontSize: 64,
                    fontWeight: 800,
                    color: passed ? COLORS.success : COLORS.warning,
                    margin: "12px 0",
                    lineHeight: 1,
                  }}
                >
                  {Math.round(pct)}%
                </div>

                {/* Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 10,
                    margin: "24px 0",
                    textAlign: "center",
                  }}
                >
                  {[
                    ["✅ Correct", correctCount, COLORS.success],
                    ["❌ Wrong", wrongCount, COLORS.danger],
                    ["📝 Total", totalQ, COLORS.darkBlue],
                    ["⏱ Time", `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`, COLORS.mediumBlue],
                  ].map(([label, val, color]) => (
                    <div
                      key={label}
                      style={{
                        background: COLORS.bgLight,
                        borderRadius: 10,
                        padding: "14px 8px",
                      }}
                    >
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: color,
                          marginTop: 4,
                        }}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Overall Feedback */}
          {feedback && !result.error && (
            <div
              style={{
                background: COLORS.bgWhite,
                borderRadius: 14,
                padding: "24px 28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                marginBottom: 20,
                borderLeft: `4px solid ${COLORS.mediumBlue}`,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.darkBlue, marginBottom: 10, marginTop: 0 }}>
                💡 AI Feedback
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: COLORS.textDark, margin: 0 }}>
                {feedback}
              </p>
            </div>
          )}

          {/* Study Recommendations */}
          {recommendations.length > 0 && !result.error && (
            <div
              style={{
                background: COLORS.bgWhite,
                borderRadius: 14,
                padding: "24px 28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                marginBottom: 20,
                borderLeft: `4px solid ${COLORS.orange}`,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.darkBlue, marginBottom: 12, marginTop: 0 }}>
                📖 Study Recommendations
              </h3>
              {recommendations.map((rec, i) => (
                <div key={i} style={{
                  fontSize: 14,
                  color: COLORS.textDark,
                  padding: "8px 0 8px 16px",
                  borderLeft: `2px solid ${COLORS.orange}40`,
                  marginBottom: 8,
                  lineHeight: 1.6,
                }}>
                  {rec}
                </div>
              ))}
            </div>
          )}

          {/* Question-by-Question Review */}
          {questionResults.length > 0 && !result.error && (
            <div
              style={{
                background: COLORS.bgWhite,
                borderRadius: 14,
                padding: "24px 28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.darkBlue, marginBottom: 16, marginTop: 0 }}>
                📋 Question Review
              </h3>
              {questionResults.map((qr, i) => {
                const matchedQ = questions.find(q => q.id === qr.id) || questions[i] || {};
                const qOptions = matchedQ.options || {};
                const optionEntries = Object.entries(qOptions);

                // Get student answer letters and correct answer letters as arrays
                const studentLetters = (Array.isArray(qr.student_answer) ? qr.student_answer : [qr.student_answer]).map(a => {
                  if (!a) return "";
                  if (/^[A-E]$/.test(String(a).trim())) return a.trim();
                  // Reverse lookup if it's option text
                  for (const [letter, text] of optionEntries) {
                    if (text === a || text.trim() === String(a).trim()) return letter;
                  }
                  return String(a);
                }).filter(Boolean);

                const correctLetters = (Array.isArray(qr.correct_answer) ? qr.correct_answer : [qr.correct_answer]).map(a => String(a || "").trim());

                return (
                <div
                  key={i}
                  style={{
                    padding: "16px",
                    borderRadius: 10,
                    marginBottom: 12,
                    background: qr.is_correct ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${qr.is_correct ? "#bbf7d0" : "#fecaca"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.darkBlue }}>
                      Q{i + 1}
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "3px 12px",
                      borderRadius: 20,
                      background: qr.is_correct ? "#dcfce7" : "#fee2e2",
                      color: qr.is_correct ? "#16a34a" : "#dc2626",
                    }}>
                      {qr.is_correct ? "✓ Correct" : "✗ Wrong"}
                    </span>
                  </div>

                  {/* Question text */}
                  {(matchedQ.question || qr.question) && (
                    <div style={{ fontSize: 13, color: COLORS.textDark, marginBottom: 12, fontWeight: 600, lineHeight: 1.5 }}>
                      {matchedQ.question || qr.question}
                    </div>
                  )}

                  {/* All options with visual indicators */}
                  {optionEntries.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      {optionEntries.map(([letter, text]) => {
                        const isStudentPick = studentLetters.includes(letter);
                        const isCorrect = correctLetters.includes(letter);
                        const isWrongPick = isStudentPick && !isCorrect;

                        let bg = "transparent";
                        let borderColor = "#e0e0e0";
                        let icon = "";
                        let textColor = COLORS.textGray;

                        if (isCorrect && isStudentPick) {
                          bg = "#dcfce7"; borderColor = "#16a34a"; icon = "✅"; textColor = "#16a34a";
                        } else if (isCorrect) {
                          bg = "#dcfce7"; borderColor = "#16a34a"; icon = "✓"; textColor = "#16a34a";
                        } else if (isWrongPick) {
                          bg = "#fee2e2"; borderColor = "#dc2626"; icon = "✗"; textColor = "#dc2626";
                        } else if (isStudentPick) {
                          bg = "#dcfce7"; borderColor = "#16a34a"; icon = "✅"; textColor = "#16a34a";
                        }

                        return (
                          <div key={letter} style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            padding: "6px 10px",
                            marginBottom: 4,
                            borderRadius: 6,
                            background: bg,
                            border: `1px solid ${borderColor}`,
                            fontSize: 13,
                            color: textColor,
                            lineHeight: 1.5,
                          }}>
                            <span style={{ fontWeight: 700, minWidth: 20, flexShrink: 0 }}>
                              {icon || letter})
                            </span>
                            <span>
                              <strong>{letter})</strong> {text}
                              {isStudentPick && !isCorrect && (
                                <span style={{ fontSize: 11, marginLeft: 8, color: "#dc2626", fontWeight: 600 }}>← Your pick</span>
                              )}
                              {isCorrect && !isStudentPick && (
                                <span style={{ fontSize: 11, marginLeft: 8, color: "#16a34a", fontWeight: 600 }}>← Correct answer</span>
                              )}
                              {isCorrect && isStudentPick && (
                                <span style={{ fontSize: 11, marginLeft: 8, color: "#16a34a", fontWeight: 600 }}>← Your pick ✓</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fallback: show text if no options available */}
                  {optionEntries.length === 0 && (
                    <>
                      <div style={{ fontSize: 13, color: qr.is_correct ? COLORS.success : COLORS.danger, marginBottom: 6 }}>
                        <strong>Your answer:</strong> {Array.isArray(qr.student_answer) ? qr.student_answer.join(", ") : qr.student_answer || "—"}
                      </div>
                      {!qr.is_correct && (
                        <div style={{ fontSize: 13, color: COLORS.success, marginBottom: 6 }}>
                          <strong>Correct answer:</strong> {Array.isArray(qr.correct_answer) ? qr.correct_answer.join(", ") : qr.correct_answer || "—"}
                        </div>
                      )}
                    </>
                  )}

                  {qr.feedback && (
                    <div style={{ fontSize: 13, color: COLORS.textGray, lineHeight: 1.6, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${qr.is_correct ? "#bbf7d0" : "#fecaca"}` }}>
                      💡 {qr.feedback}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}

          {/* Take Another Test Button */}
          <button
            onClick={onForceExit}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 10,
              border: "none",
              background: COLORS.orange,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255,140,0,0.3)",
            }}
          >
            ⚡ Take Another Test
          </button>
        </div>
      </div>
    );
  }

  // ── Submitting Screen ────────────────────────────────────────────────────────
  if (submitting) {
    return <LoadingSpinner message="Submitting Your Test" />;
  }

  if (!q) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: COLORS.danger }}>No questions found in this test.</p>
        <button
          onClick={onForceExit}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            background: COLORS.orange,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 16,
          }}
        >
          Back to Setup
        </button>
      </div>
    );
  }

  const isMultiSelect = q.type === "msq" || q.question_type === "msq";
  const currentAnswer = answers[currentQ];
  const isAnswered = isMultiSelect
    ? Array.isArray(currentAnswer) && currentAnswer.length > 0
    : currentAnswer !== undefined;

  // ── Question Screen ──────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bgLight,
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: COLORS.bgWhite,
            borderRadius: 10,
            padding: "12px 20px",
            marginBottom: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{ fontWeight: 700, color: COLORS.darkBlue, fontSize: 14 }}
          >
            ⚡ TestGen
          </div>

          {/* Timer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: `${timerColor}15`,
              border: `2px solid ${timerColor}`,
              borderRadius: 8,
              padding: "6px 14px",
              fontWeight: 800,
              fontSize: 18,
              color: timerColor,
              fontFamily: "monospace",
            }}
          >
            ⏱️ {formatTime(timeLeft)}
          </div>

          <div
            style={{ fontSize: 13, color: COLORS.textGray, fontWeight: 600 }}
          >
            {answeredCount}/{questions.length} answered
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: 6,
            background: COLORS.border,
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((currentQ + 1) / questions.length) * 100}%`,
              background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.orangeLight})`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Question Card */}
        <div
          style={{
            background: COLORS.bgWhite,
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            marginBottom: 20,
          }}
        >
          {/* Question Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                background: COLORS.orange,
                color: "#fff",
                borderRadius: 6,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Q{currentQ + 1} / {questions.length}
            </span>
            <span
              style={{
                background: COLORS.bgLight,
                color: COLORS.textGray,
                borderRadius: 6,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {isMultiSelect
                ? "Multi-Select"
                : q.type === "true_false"
                  ? "True / False"
                  : "MCQ"}
            </span>
          </div>

          {/* Question Text */}
          <p
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: COLORS.textDark,
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            {q.question || q.question_text}
          </p>

          {isMultiSelect && (
            <p style={{ fontSize: 12, color: COLORS.info, marginBottom: 12 }}>
              ℹ️ Select all that apply
            </p>
          )}

          {/* Options — safe rendering for any format from AI agent */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(() => {
              let opts = q.options || q.choices || q.answers || [];
              if (typeof opts === "string")
                opts = opts.split("\n").filter(Boolean);
              if (!Array.isArray(opts) && typeof opts === "object")
                opts = Object.values(opts);
              if (!Array.isArray(opts)) opts = [];

              return opts.map((opt, oIdx) => {
                const optValue =
                  typeof opt === "object"
                    ? opt.value || opt.text || opt.label || String(oIdx)
                    : String(opt);
                const optLabel =
                  typeof opt === "object"
                    ? opt.text || opt.label || opt.value || String(opt)
                    : String(opt);
                const isSelected = isMultiSelect
                  ? Array.isArray(currentAnswer) &&
                    currentAnswer.includes(optValue)
                  : currentAnswer === optValue;

                return (
                  <button
                    key={oIdx}
                    onClick={() =>
                      selectAnswer(currentQ, optValue, isMultiSelect)
                    }
                    style={{
                      padding: "14px 18px",
                      borderRadius: 8,
                      border: `2px solid ${isSelected ? COLORS.orange : COLORS.border}`,
                      background: isSelected
                        ? "rgba(255,140,0,0.08)"
                        : COLORS.bgWhite,
                      color: COLORS.textDark,
                      fontSize: 14,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(255,140,0,0.15)"
                        : "none",
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: isMultiSelect ? 4 : "50%",
                        border: `2px solid ${isSelected ? COLORS.orange : COLORS.border}`,
                        background: isSelected ? COLORS.orange : "transparent",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "#fff",
                      }}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                    {String.fromCharCode(65 + oIdx)}. {optLabel}
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: `2px solid ${COLORS.border}`,
              background: COLORS.bgWhite,
              color: currentQ === 0 ? COLORS.textMuted : COLORS.textDark,
              fontWeight: 700,
              cursor: currentQ === 0 ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            ← Previous
          </button>

          {/* Question dots */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              justifyContent: "center",
              flex: 1,
            }}
          >
            {questions.map((_, idx) => {
              const isAnsweredDot =
                answers[idx] !== undefined &&
                (Array.isArray(answers[idx]) ? answers[idx].length > 0 : true);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQ(idx)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `2px solid ${idx === currentQ ? COLORS.orange : isAnsweredDot ? COLORS.success : COLORS.border}`,
                    background:
                      idx === currentQ
                        ? COLORS.orange
                        : isAnsweredDot
                          ? `${COLORS.success}20`
                          : COLORS.bgWhite,
                    color:
                      idx === currentQ
                        ? "#fff"
                        : isAnsweredDot
                          ? COLORS.success
                          : COLORS.textMuted,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() =>
                setCurrentQ((q) => Math.min(questions.length - 1, q + 1))
              }
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                background: isAnswered ? COLORS.orange : COLORS.textMuted,
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                background: COLORS.success,
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Submit Test ✓
            </button>
          )}
        </div>

        {/* Unanswered warning */}
        {answeredCount < questions.length && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 16px",
              background: "rgba(255,152,0,0.1)",
              border: "1px solid rgba(255,152,0,0.3)",
              borderRadius: 8,
              fontSize: 13,
              color: COLORS.warning,
              textAlign: "center",
            }}
          >
            ⚠️ {questions.length - answeredCount} question(s) unanswered
          </div>
        )}
      </div>

      {/* Confirm Submit Modal */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: COLORS.bgWhite,
              borderRadius: 16,
              padding: 40,
              maxWidth: 420,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.darkBlue,
                marginBottom: 12,
              }}
            >
              Submit Test?
            </h3>
            <p
              style={{
                color: COLORS.textGray,
                marginBottom: 8,
                lineHeight: 1.6,
              }}
            >
              You have answered <strong>{answeredCount}</strong> of{" "}
              <strong>{questions.length}</strong> questions.
            </p>
            {answeredCount < questions.length && (
              <p
                style={{
                  color: COLORS.warning,
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                ⚠️ {questions.length - answeredCount} question(s) will be marked
                unanswered.
              </p>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 8,
                  border: `2px solid ${COLORS.border}`,
                  background: COLORS.bgWhite,
                  color: COLORS.textDark,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Keep Going
              </button>
              <button
                onClick={() => handleSubmit(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 8,
                  border: "none",
                  background: COLORS.success,
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Submit ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TestGen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slots, setSlots] = useState(null);
  const [testData, setTestData] = useState(null); // holds generated test

  // Fetch slot status every 10s
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await api.get("/testgen/status");
        setSlots(response.data);
      } catch (err) {
        console.error("Could not fetch slot status:", err);
      }
    };
    fetchSlots();
    const interval = setInterval(fetchSlots, 10000);
    return () => clearInterval(interval);
  }, []);

  const onGenerate = async (config) => {
    setLoading(true);
    setError(null);
    try {

// NEW (calls agent directly):
const response = await fetch("https://upskill25-myagent.hf.space/api/generate-test", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    topic: config.topic,
    num_questions: config.numQuestions,
    duration_minutes: config.durationMinutes,
    difficulty: config.difficulty,
    question_types: config.questionTypes,
    student_id: String(user?.id || "anonymous"),
    course_id: config.courseId,
    lecture_id: config.lectureId,
  }),
});
const data = await response.json();
if (!response.ok) throw new Error(data.detail || "Failed");
setTestData({ success: true, ...data });
      if (response.data.success) {
        setTestData(response.data);
      } else {
        setError(
          response.data.message ||
            response.data.error ||
            "Failed to generate test",
        );
      }
    } catch (err) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.message || err.response?.data?.error || err.message;

      // 429 = rate limited OR slot taken — show specific message
      if (status === 429) {
        setError(msg || "Too many requests. Please wait before trying again.");
      } else {
        setError(msg || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (testId, questions, answers, timeTakenSeconds) => {
    try {
      const response = await fetch("https://upskill25-myagent.hf.space/api/submit-answers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    test_id: testId,
    student_id: String(user?.id || "anonymous"),
    questions,
    answers,
    time_taken_seconds: timeTakenSeconds,
  }),
});
const data = await response.json();
if (!response.ok) throw new Error(data.detail || "Submit failed");
return data;
      console.log("SUBMIT RESPONSE:", JSON.stringify(response.data, null, 2));
      // ✅ Don't clear testData here — TestTakingScreen handles the result display
      // setTestData(null) is only called via onForceExit after result is shown
      return response.data;
    } catch (err) {
      console.error("Submit failed:", err.message);
      throw err;
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingSpinner message="Generating Your Test" />;
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    const isRateLimit =
      error.toLowerCase().includes("rate") ||
      error.toLowerCase().includes("wait") ||
      error.toLowerCase().includes("active test");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 40,
          background: COLORS.bgLight,
        }}
      >
        <div
          style={{
            background: COLORS.bgWhite,
            borderRadius: 12,
            padding: 40,
            maxWidth: 500,
            width: "100%",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16, textAlign: "center" }}>
            {isRateLimit ? "⏳" : "⚠️"}
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.danger,
              margin: "0 0 12px",
              textAlign: "center",
            }}
          >
            {isRateLimit ? "Please Wait" : "Error"}
          </h2>
          <p
            style={{
              color: COLORS.textGray,
              textAlign: "center",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {error}
          </p>
          <button
            onClick={() => setError(null)} // ✅ BUGFIX: clear error, don't reload page
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: COLORS.orange,
              color: COLORS.bgWhite,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Test Taking Screen ───────────────────────────────────────────────────────
  if (testData) {
    return (
      <TestTakingScreen
        testData={testData}
        onSubmit={onSubmit}
        onForceExit={() => setTestData(null)}
      />
    );
  }

  // ── Setup Screen ─────────────────────────────────────────────────────────────
  return (
    <SetupScreen onGenerate={onGenerate} loading={loading} slots={slots} />
  );
}
