/**
 * TestGen.jsx — UPSKILLIZE BRANDED VERSION
 *
 * ✅ Matches https://lms.upskillize.com colors & design
 * ✅ Dark Blue sidebar theme
 * ✅ Orange CTA buttons
 * ✅ Professional spacing & typography
 * ✅ Dynamic N questions (1-100)
 * ✅ Dynamic duration (5-180 minutes)
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

  // ✅ Validate duration (5-180 minutes)
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
    if (num < 5) {
      setErrors((p) => ({
        ...p,
        dur: `Minimum 5 minutes (you entered ${num})`,
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
                    min="5"
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
                    placeholder="5-180"
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
                    5-180 minutes
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
      const response = await api.post("/testgen/generate", config);
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
      const response = await api.post("/testgen/submit", {
        testId,
        questions,
        answers,
        timeTakenSeconds,
      });
      setTestData(null); // clear test after submit
      return response.data;
    } catch (err) {
      console.error("Submit failed:", err.message);
      setTestData(null); // always clear so student isn't stuck
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

  // ── Test Generated — show test (or your own TestTaking component) ────────────
  if (testData) {
    // If you have a separate TestTaking component, render it here.
    // For now we show a placeholder. Replace with your actual component:
    // return <TestTaking testData={testData} onSubmit={onSubmit} />;
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ color: COLORS.darkBlue }}>Test Ready! ✅</h2>
        <p style={{ color: COLORS.textGray }}>
          Test ID: {testData.test_id || testData.testId}
        </p>
        <button
          onClick={() => setTestData(null)}
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

  // ── Setup Screen ─────────────────────────────────────────────────────────────
  return (
    <SetupScreen onGenerate={onGenerate} loading={loading} slots={slots} />
  );
}
