/**
 * TestGen.jsx — ENHANCED VERSION WITH STRICT VALIDATION
 *
 * VALIDATION FEATURES:
 * ✅ Questions: 1-100 (rejects 0, 101+)
 * ✅ Duration: 5-180 minutes (rejects 4, 181+) with specific error messages
 * ✅ Real-time feedback
 * ✅ Submit button disabled if ANY error
 */

import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";

// Design tokens
const C = {
  bg: "#0d1117",
  surface: "#161b22",
  raised: "#1c2230",
  border: "#21293a",
  amber: "#e8a045",
  amberBg: "rgba(232,160,69,0.10)",
  amberBdr: "rgba(232,160,69,0.30)",
  teal: "#3ecfb0",
  tealBg: "rgba(62,207,176,0.10)",
  red: "#f07070",
  redBg: "rgba(240,112,112,0.10)",
  green: "#4ade80",
  greenBg: "rgba(74,222,128,0.10)",
  blue: "#60a5fa",
  blueBg: "rgba(96,165,250,0.08)",
  text: "#e8edf4",
  muted: "#7d8fa8",
  dim: "#3d4e63",
};

const DIFF = {
  easy: { clr: C.green, desc: "Foundational recall" },
  medium: { clr: C.amber, desc: "Applied understanding" },
  hard: { clr: C.red, desc: "Deep analysis" },
  complex: { clr: "#c084fc", desc: "Synthesis & evaluation" },
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

const LoadingSpinner = ({ progress = 0, message = "Generating Test" }) => {
  const messages = [
    "Analyzing course content...",
    "Generating questions with AI...",
    "Creating balanced test...",
    "Finalizing your test...",
    "Almost ready...",
  ];

  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px",
        minHeight: "500px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 64,
          marginBottom: 32,
          animation: "pulse-spin 2s ease-in-out infinite",
        }}
      >
        ⚡
      </div>

      <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0 }}>
        {message}
      </h2>

      <p
        style={{
          fontSize: 14,
          color: C.muted,
          maxWidth: 400,
          marginTop: 12,
          lineHeight: 1.5,
        }}
      >
        {displayMessage}
      </p>

      <div
        style={{
          width: 280,
          height: 6,
          background: C.border,
          borderRadius: 3,
          overflow: "hidden",
          marginTop: 32,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(progress, 10)}%`,
            background: C.amber,
            transition: "width 0.4s",
            borderRadius: 3,
          }}
        />
      </div>

      <p
        style={{
          fontSize: 12,
          color: C.dim,
          fontFamily: "monospace",
          marginTop: 12,
        }}
      >
        {progress > 0 ? `${progress}% complete` : "Starting..."}
      </p>

      <style>{`
        @keyframes pulse-spin {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.7; transform: scale(1.05) rotate(180deg); }
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
  const [loadingC, setLoadingC] = useState(true);
  const [loadingM, setLoadingM] = useState(false);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [topic, setTopic] = useState("");

  // ✅ DYNAMIC QUESTION & DURATION INPUTS
  const [nQ, setNQ] = useState(10);
  const [nQInput, setNQInput] = useState("10");
  const [dur, setDur] = useState(15);
  const [durInput, setDurInput] = useState("15");

  const [diff, setDiff] = useState("medium");
  const [types, setTypes] = useState(["mcq"]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api
      .get("/enrollments/my-enrollments")
      .then((r) => setEnrollments(r.data.enrollments || []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoadingC(false));
  }, []);

  useEffect(() => {
    if (!course) {
      setModules([]);
      return;
    }
    setLoadingM(true);
    setLesson(null);
    setTopic(course.name);
    api
      .get(`/modules/course/${course.id}`)
      .then((r) => setModules(r.data.modules || []))
      .catch(() => setModules([]))
      .finally(() => setLoadingM(false));
  }, [course]);

  // ✅ ENHANCED QUESTION COUNT VALIDATION (1-100 STRICT)
  const handleNQChange = (e) => {
    const val = e.target.value;
    setNQInput(val);

    // If empty, clear error
    if (val === "" || val === undefined) {
      setErrors((p) => ({ ...p, nQ: null }));
      return;
    }

    const num = parseInt(val);

    // Not a number
    if (isNaN(num)) {
      setErrors((p) => ({
        ...p,
        nQ: "❌ Enter a valid number (numbers only)",
      }));
      return;
    }

    // Less than 1
    if (num < 1) {
      setErrors((p) => ({
        ...p,
        nQ: `❌ Minimum 1 question (you entered ${num})`,
      }));
      return;
    }

    // More than 100
    if (num > 100) {
      setErrors((p) => ({
        ...p,
        nQ: `❌ Maximum 100 questions (you entered ${num})`,
      }));
      return;
    }

    // Valid
    setErrors((p) => ({ ...p, nQ: null }));
    setNQ(num);
  };

  // ✅ ENHANCED DURATION VALIDATION (5-180 MINUTES STRICT)
  const handleDurChange = (e) => {
    const val = e.target.value;
    setDurInput(val);

    // If empty, clear error
    if (val === "" || val === undefined) {
      setErrors((p) => ({ ...p, dur: null }));
      return;
    }

    const num = parseInt(val);

    // Not a number
    if (isNaN(num)) {
      setErrors((p) => ({
        ...p,
        dur: "❌ Enter a valid number (numbers only)",
      }));
      return;
    }

    // Less than 5 minutes (4, 3, 2, 1, 0, -1, etc.)
    if (num < 5) {
      setErrors((p) => ({
        ...p,
        dur: `❌ Minimum 5 minutes (you entered ${num} min)`,
      }));
      return;
    }

    // More than 180 minutes (181, 200, 500, etc.)
    if (num > 180) {
      setErrors((p) => ({
        ...p,
        dur: `❌ Maximum 180 minutes (you entered ${num} min)`,
      }));
      return;
    }

    // Valid
    setErrors((p) => ({ ...p, dur: null }));
    setDur(num);
  };

  const toggleType = (t) =>
    setTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const submit = () => {
    if (!course) {
      setErrors((p) => ({ ...p, course: "Please select a course" }));
      return;
    }
    if (!topic.trim()) {
      setErrors((p) => ({ ...p, topic: "Please enter a topic" }));
      return;
    }
    if (topic.length > 200) {
      setErrors((p) => ({
        ...p,
        topic: "Topic must be under 200 characters",
      }));
      return;
    }
    if (!types.length) {
      setErrors((p) => ({
        ...p,
        types: "Select at least one question type",
      }));
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

  const avail = slots?.availableSlots ?? null;
  const full = avail !== null && avail === 0;

  return (
    <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: C.text,
            margin: "0 0 4px",
          }}
        >
          ⚡ TestGen
        </h2>
        <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>
          AI questions from your course material
        </p>
      </div>

      {/* Status Badge */}
      {avail !== null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 8,
            background: full ? C.redBg : C.tealBg,
            color: full ? C.red : C.teal,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 16,
            border: `1px solid ${full ? "rgba(240,112,112,0.3)" : "rgba(62,207,176,0.3)"}`,
          }}
        >
          {full ? "● FULL - All slots occupied" : `● ${avail} slots available`}
        </div>
      )}

      {/* Step 1: Course */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.muted,
            display: "block",
            marginBottom: 8,
          }}
        >
          01 - SELECT COURSE
        </label>
        {loadingC ? (
          <div style={{ color: C.muted }}>Loading courses...</div>
        ) : !enrollments.length ? (
          <div style={{ color: C.muted }}>
            You are not enrolled in any courses
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 10,
            }}
          >
            {enrollments.map((e) => {
              const c = e.Course;
              const sel = course?.id === e.course_id;
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
                    padding: "12px",
                    borderRadius: 10,
                    border: `1.5px solid ${sel ? C.amber : C.border}`,
                    background: sel ? C.amberBg : C.raised,
                    color: C.text,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                >
                  🎓 {c?.course_name || "Course"}
                  {sel && (
                    <div style={{ fontSize: 10, marginTop: 4 }}>✓ Selected</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2: Lesson (Optional) */}
      {course && (
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.muted,
              display: "block",
              marginBottom: 8,
            }}
          >
            02 - SELECT LESSON (Optional)
          </label>
          {loadingM ? (
            <div style={{ color: C.muted }}>Loading lessons...</div>
          ) : !modules.length ? (
            <div style={{ color: C.muted }}>
              No lessons - will test entire course
            </div>
          ) : (
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.raised,
                color: C.text,
                fontSize: 13,
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
                <optgroup key={m.id} label={`📂 ${m.module_name}`}>
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

      {/* Step 3: Topic */}
      {course && (
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.muted,
              display: "block",
              marginBottom: 8,
            }}
          >
            03 - TOPIC (Auto-filled, editable)
          </label>
          <input
            type="text"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${errors.topic ? C.red : C.border}`,
              background: C.raised,
              color: C.text,
              fontSize: 13,
              boxSizing: "border-box",
            }}
            placeholder="e.g. Payment Systems, Neural Networks"
            value={topic}
            maxLength={200}
            onChange={(e) => {
              setTopic(e.target.value);
              setErrors((p) => ({ ...p, topic: null }));
            }}
          />
          {errors.topic && (
            <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>
              {errors.topic}
            </div>
          )}
          <p style={{ fontSize: 11, color: C.dim, margin: "6px 0 0" }}>
            {topic.length}/200
          </p>
        </div>
      )}

      {/* Step 4: Test Settings */}
      {course && (
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.muted,
              display: "block",
              marginBottom: 12,
            }}
          >
            04 - TEST SETTINGS
          </label>

          {/* Three Column Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {/* Questions Input */}
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: C.muted,
                  display: "block",
                  marginBottom: 4,
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
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${errors.nQ ? C.red : C.border}`,
                  background: C.raised,
                  color: C.text,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
                placeholder="1-100"
                value={nQInput}
                onChange={handleNQChange}
              />
              {errors.nQ && (
                <span
                  style={{
                    fontSize: 10,
                    color: C.red,
                    marginTop: 3,
                    display: "block",
                  }}
                >
                  {errors.nQ}
                </span>
              )}
              <span
                style={{
                  fontSize: 9,
                  color: C.dim,
                  marginTop: 4,
                  display: "block",
                }}
              >
                Min: 1 | Max: 100
              </span>
            </div>

            {/* Duration Input */}
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: C.muted,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Duration (min)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${errors.dur ? C.red : C.border}`,
                  background: C.raised,
                  color: C.text,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
                placeholder="5-180"
                value={durInput}
                onChange={handleDurChange}
              />
              {errors.dur && (
                <span
                  style={{
                    fontSize: 10,
                    color: C.red,
                    marginTop: 3,
                    display: "block",
                  }}
                >
                  {errors.dur}
                </span>
              )}
              <span
                style={{
                  fontSize: 9,
                  color: C.dim,
                  marginTop: 4,
                  display: "block",
                }}
              >
                Min: 5 | Max: 180
              </span>
            </div>

            {/* Difficulty */}
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: C.muted,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Difficulty
              </label>
              <select
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: C.raised,
                  color: C.text,
                  fontSize: 13,
                }}
                value={diff}
                onChange={(e) => setDiff(e.target.value)}
              >
                {Object.entries(DIFF).map(([d, info]) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metrics */}
          {!errors.nQ && !errors.dur && nQ > 0 && dur > 0 && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: C.blueBg,
                border: `1px solid rgba(96,165,250,0.2)`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 11,
              }}
            >
              <span>
                <span
                  style={{
                    color: DIFF[diff].clr,
                    fontWeight: 600,
                    marginRight: 8,
                  }}
                >
                  {diff.toUpperCase()}
                </span>
                {DIFF[diff].desc}
              </span>
              <span style={{ color: C.muted }}>
                ~{(dur / nQ).toFixed(1)} min/q
              </span>
            </div>
          )}

          {/* Question Types */}
          <div style={{ marginTop: 16 }}>
            <label
              style={{
                fontSize: 11,
                color: C.muted,
                display: "block",
                marginBottom: 8,
              }}
            >
              Question Types
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                ["mcq", "MCQ", "Single answer"],
                ["msq", "Multi-Select", "Multiple answers"],
                ["true_false", "True/False", "Binary choice"],
              ].map(([v, lbl, sub]) => (
                <button
                  key={v}
                  onClick={() => toggleType(v)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    border: `1px solid ${types.includes(v) ? C.amberBdr : C.border}`,
                    background: types.includes(v) ? C.amberBg : "transparent",
                    color: types.includes(v) ? C.amber : C.muted,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
            {errors.types && (
              <span
                style={{
                  fontSize: 10,
                  color: C.red,
                  marginTop: 6,
                  display: "block",
                }}
              >
                {errors.types}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={submit}
        disabled={
          loading || !course || full || Object.values(errors).some(Boolean)
        }
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 8,
          border: "none",
          background:
            loading || !course || full || Object.values(errors).some(Boolean)
              ? C.dim
              : C.amber,
          color:
            loading || !course || full || Object.values(errors).some(Boolean)
              ? C.dim
              : "#0d1117",
          fontSize: 14,
          fontWeight: 700,
          cursor:
            loading || !course || full || Object.values(errors).some(Boolean)
              ? "not-allowed"
              : "pointer",
          opacity:
            loading || !course || full || Object.values(errors).some(Boolean)
              ? 0.5
              : 1,
          transition: "all 0.2s",
        }}
      >
        {loading
          ? "⚡ Generating…"
          : full
            ? "⏳ All Slots Full"
            : "⚡ Generate Test"}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          color: C.dim,
          marginTop: 12,
        }}
      >
        Powered by Claude AI · Grounded in your course content
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TestGen() {
  const [screenIndex, setScreenIndex] = useState(0);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slots, setSlots] = useState(null);

  // Fetch slot status
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await api.get("/testgen/status");
        setSlots(response.data);
      } catch (err) {
        console.log("Could not fetch slot status");
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
      if (response.data.ok || response.data.success) {
        setTestData(response.data);
        setScreenIndex(1);
      } else {
        setError(
          response.data.error ||
            response.data.message ||
            "Failed to generate test",
        );
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.response?.data?.error || err.message;
      setError(errMsg || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner progress={0} message="Generating Your Test" />;
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.red }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>{error}</p>
        <button
          onClick={() => setScreenIndex(0)}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: C.amber,
            color: "#0d1117",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <SetupScreen onGenerate={onGenerate} loading={loading} slots={slots} />
  );
}
