import { useState, useEffect, useRef } from "react";
import api from "../../services/api";

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onGenerate, loading }) {
  const [enrollments, setEnrollments] = useState([]);
  const [modules, setModules] = useState([]);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [fetchingModules, setFetchingModules] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionTypes, setQuestionTypes] = useState(["mcq"]);

  useEffect(() => {
    api
      .get("/enrollments/my-enrollments")
      .then((r) => setEnrollments(r.data.enrollments || []))
      .catch(() => setEnrollments([]))
      .finally(() => setFetchingCourses(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setModules([]);
      return;
    }
    setFetchingModules(true);
    setSelectedLesson(null);
    setTopic(selectedCourse.name);
    api
      .get(`/modules/course/${selectedCourse.id}`)
      .then((r) => setModules(r.data.modules || []))
      .catch(() => setModules([]))
      .finally(() => setFetchingModules(false));
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedLesson) setTopic(selectedLesson.name);
    else if (selectedCourse) setTopic(selectedCourse.name);
  }, [selectedLesson]);

  const toggleType = (type) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const submit = () => {
    if (!selectedCourse) return alert("Please select a course.");
    if (!topic.trim()) return alert("Please enter a topic.");
    if (questionTypes.length === 0)
      return alert("Select at least one question type.");
    onGenerate({
      courseId: selectedCourse.id,
      lectureId: selectedLesson?.id || null,
      topic,
      numQuestions,
      durationMinutes,
      difficulty,
      questionTypes,
    });
  };

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span style={{ fontSize: 40 }}>🧠</span>
        <div>
          <h2 style={s.cardTitle}>Generate Mock Test</h2>
          <p style={s.cardSub}>
            AI questions crafted from your enrolled course content
          </p>
        </div>
      </div>

      {/* Step 1 - Course */}
      <div style={s.stepSection}>
        <div style={s.stepLabel}>
          <span style={s.stepNum}>1</span> Select Your Course
        </div>
        {fetchingCourses ? (
          <div style={s.infoBox}>⏳ Loading your courses…</div>
        ) : enrollments.length === 0 ? (
          <div style={s.warnBox}>
            ⚠️ You are not enrolled in any courses yet. Please enroll in a
            course first.
          </div>
        ) : (
          <div style={s.courseGrid}>
            {enrollments.map((e) => {
              const c = e.Course;
              const isSelected = selectedCourse?.id === e.course_id;
              return (
                <button
                  key={e.course_id}
                  onClick={() =>
                    setSelectedCourse({
                      id: e.course_id,
                      name: c?.course_name || "Course",
                    })
                  }
                  style={{
                    ...s.courseCard,
                    ...(isSelected ? s.courseCardSel : {}),
                  }}
                >
                  <span style={{ fontSize: 22 }}>🎓</span>
                  <span style={s.courseName}>{c?.course_name || "Course"}</span>
                  {isSelected && (
                    <span
                      style={{
                        color: "#3b82f6",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2 - Lesson */}
      {selectedCourse && (
        <div style={s.stepSection}>
          <div style={s.stepLabel}>
            <span style={s.stepNum}>2</span> Select Lesson{" "}
            <span style={s.optional}>
              — optional, leave blank to test entire course
            </span>
          </div>
          {fetchingModules ? (
            <div style={s.infoBox}>⏳ Loading lessons…</div>
          ) : modules.length === 0 ? (
            <div style={s.infoBox}>
              ℹ️ No lessons found — will test entire course content.
            </div>
          ) : (
            <select
              style={s.select}
              value={selectedLesson?.id || ""}
              onChange={(e) => {
                const allL = modules.flatMap((m) =>
                  (m.Lessons || []).map((l) => ({
                    id: l.id,
                    name: l.lesson_name,
                  })),
                );
                const lesson = allL.find(
                  (l) => String(l.id) === e.target.value,
                );
                setSelectedLesson(lesson || null);
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

      {/* Step 3 - Topic */}
      {selectedCourse && (
        <div style={s.stepSection}>
          <div style={s.stepLabel}>
            <span style={s.stepNum}>3</span> Topic / Focus Area{" "}
            <span style={s.optional}>— auto-filled, you can edit</span>
          </div>
          <input
            style={s.input}
            placeholder="e.g. Payment Systems, Neural Networks…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
      )}

      {/* Step 4 - Settings */}
      {selectedCourse && (
        <div style={s.stepSection}>
          <div style={s.stepLabel}>
            <span style={s.stepNum}>4</span> Test Settings
          </div>
          <div style={s.grid3}>
            <div>
              <label style={s.miniLabel}>Questions</label>
              <select
                style={s.select}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 25, 30].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={s.miniLabel}>Duration (min)</label>
              <select
                style={s.select}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              >
                {[15, 20, 30, 45, 60, 90].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={s.miniLabel}>Difficulty</label>
              <select
                style={s.select}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {["easy", "medium", "hard", "complex"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={s.miniLabel}>Question Types</label>
            <div style={s.typeRow}>
              {[
                ["mcq", "MCQ"],
                ["msq", "Multi-Select"],
                ["true_false", "True / False"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => toggleType(val)}
                  style={{
                    ...s.typeBtn,
                    ...(questionTypes.includes(val) ? s.typeBtnActive : {}),
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !selectedCourse}
        style={{
          ...s.primaryBtn,
          opacity: loading || !selectedCourse ? 0.6 : 1,
          cursor: loading || !selectedCourse ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <span style={s.btnInner}>
            <span style={s.spinner} /> Generating with AI…
          </span>
        ) : (
          <span style={s.btnInner}>⚡ Generate Test</span>
        )}
      </button>
    </div>
  );
}

// ── Test Screen ───────────────────────────────────────────────────────────────
function TestScreen({ testData, onSubmit, submitting }) {
  const total = testData.duration_minutes * 60;
  const [timeLeft, setTimeLeft] = useState(total);
  const [answers, setAnswers] = useState({});
  const startRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const select = (qid, opt) => {
    const q = testData.questions.find((q) => q.id === qid);
    if (q?.type === "msq") {
      setAnswers((prev) => {
        const cur = prev[qid] || [];
        return {
          ...prev,
          [qid]: cur.includes(opt)
            ? cur.filter((o) => o !== opt)
            : [...cur, opt],
        };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [qid]: [opt] }));
    }
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    onSubmit({
      testId: testData.test_id,
      questions: testData.questions,
      answers,
      timeTakenSeconds: Math.floor((Date.now() - startRef.current) / 1000),
    });
  };

  const answered = Object.keys(answers).length;
  const pct = Math.round((timeLeft / total) * 100);
  const timerColor =
    timeLeft < 60 ? "#ef4444" : timeLeft < 300 ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={s.stickyBar}>
        <div style={s.stickyInner}>
          <span
            style={{ fontWeight: 600, color: "#1e293b", fontSize: 15, flex: 1 }}
          >
            📚 {testData.topic}
          </span>
          <div
            style={{
              position: "relative",
              width: 48,
              height: 48,
              flexShrink: 0,
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke={timerColor}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
                style={{
                  transition: "stroke-dashoffset 1s linear, stroke 0.3s",
                }}
              />
            </svg>
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                fontSize: 10,
                fontWeight: 700,
                color: timerColor,
              }}
            >
              {fmt(timeLeft)}
            </span>
          </div>
          <span style={{ fontSize: 13, color: "#64748b" }}>
            {answered}/{testData.questions.length} answered
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={s.submitBtn}
          >
            {submitting ? "Submitting…" : "Submit Test"}
          </button>
        </div>
      </div>

      {testData.questions.map((q, idx) => (
        <div
          key={q.id}
          style={{
            ...s.qCard,
            ...(answers[q.id] ? { borderColor: "#bfdbfe" } : {}),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span style={s.qNum}>Q{idx + 1}</span>
            <span style={s.qTypeBadge}>
              {q.type === "true_false"
                ? "True/False"
                : q.type === "msq"
                  ? "Multi-Select"
                  : "MCQ"}
            </span>
          </div>
          <p
            style={{
              fontSize: 15,
              color: "#1e293b",
              fontWeight: 500,
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          >
            {q.question}
          </p>
          {q.type === "msq" && (
            <p
              style={{
                fontSize: 12,
                color: "#3b82f6",
                marginBottom: 10,
                fontStyle: "italic",
              }}
            >
              Select all that apply
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(q.options || {}).map(([key, val]) => {
              const sel = (answers[q.id] || []).includes(key);
              return (
                <button
                  key={key}
                  onClick={() => select(q.id, key)}
                  style={{ ...s.optBtn, ...(sel ? s.optBtnSel : {}) }}
                >
                  <span
                    style={{
                      ...s.optKey,
                      ...(sel ? { background: "#3b82f6", color: "#fff" } : {}),
                    }}
                  >
                    {key}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      flex: 1,
                      textAlign: "left",
                    }}
                  >
                    {val}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Result Screen ─────────────────────────────────────────────────────────────
function ResultScreen({ result, onRetry }) {
  const band = result.performance_band;
  const bandColor =
    {
      Excellent: "#22c55e",
      Good: "#3b82f6",
      Average: "#f59e0b",
      "Needs Improvement": "#ef4444",
    }[band] || "#6b7280";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          ...s.card,
          background: `linear-gradient(135deg, ${bandColor}18, ${bandColor}08)`,
          border: `2px solid ${bandColor}44`,
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: `4px solid ${bandColor}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 800, color: bandColor }}>
            {result.percentage}%
          </span>
          <span style={{ fontSize: 11, color: "#64748b" }}>Score</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              background: bandColor,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              padding: "4px 14px",
              borderRadius: 20,
              display: "inline-block",
              width: "fit-content",
            }}
          >
            {band}
          </span>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            {result.score} / {result.total} correct
          </p>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            ⏱ {Math.floor(result.time_taken_seconds / 60)}m{" "}
            {result.time_taken_seconds % 60}s
          </p>
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.feedbackTitle}>💬 Overall Feedback</h3>
        <p
          style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}
        >
          {result.overall_feedback}
        </p>
      </div>

      {result.study_recommendations?.length > 0 && (
        <div style={s.card}>
          <h3 style={s.feedbackTitle}>📖 Study Recommendations</h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {result.study_recommendations.map((r, i) => (
              <li
                key={i}
                style={{
                  fontSize: 14,
                  color: "#374151",
                  padding: "6px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                → {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#1e293b",
            marginBottom: 12,
          }}
        >
          📝 Question Review
        </h3>
        {result.results?.map((r, i) => (
          <div
            key={r.id}
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 16,
              marginBottom: 10,
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              borderLeft: `4px solid ${r.is_correct ? "#22c55e" : "#ef4444"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                Q{i + 1}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "2px 10px",
                  borderRadius: 10,
                  background: r.is_correct ? "#dcfce7" : "#fee2e2",
                  color: r.is_correct ? "#15803d" : "#dc2626",
                }}
              >
                {r.is_correct ? "✓ Correct" : "✗ Wrong"}
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.6,
                margin: "0 0 6px",
              }}
            >
              {r.feedback}
            </p>
            {!r.is_correct && (
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                Correct answer: <strong>{r.correct_answer?.join(", ")}</strong>
              </p>
            )}
          </div>
        ))}
      </div>

      <button onClick={onRetry} style={s.primaryBtn}>
        🔄 Take Another Test
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TestGen() {
  const [phase, setPhase] = useState("setup");
  const [testData, setTestData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const generate = async (form) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/testgen/generate", form);
      if (!data.success) throw new Error(data.message);
      setTestData(data);
      setPhase("test");
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const submit = async ({ testId, questions, answers, timeTakenSeconds }) => {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/testgen/submit", {
        testId,
        questions,
        answers,
        timeTakenSeconds,
      });
      if (!data.success) throw new Error(data.message);
      setResult(data);
      setPhase("result");
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", margin: 0 }}
        >
          ⚡ TestGen
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 15 }}>
          AI-powered mock tests from your course content
        </p>
      </div>

      {error && (
        <div style={s.errorBox}>
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#dc2626",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {phase === "setup" && (
        <SetupScreen onGenerate={generate} loading={loading} />
      )}
      {phase === "test" && testData && (
        <TestScreen
          testData={testData}
          onSubmit={submit}
          submitting={submitting}
        />
      )}
      {phase === "result" && result && (
        <ResultScreen
          result={result}
          onRetry={() => {
            setPhase("setup");
            setTestData(null);
            setResult(null);
          }}
        />
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: "24px",
    maxWidth: 860,
    margin: "0 auto",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.06)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 },
  cardSub: { color: "#64748b", fontSize: 13, margin: 0 },
  stepSection: { marginBottom: 22 },
  stepLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: 10,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#1d4ed8",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optional: { fontWeight: 400, color: "#94a3b8", fontSize: 12 },
  infoBox: {
    padding: "10px 14px",
    background: "#f0f9ff",
    borderRadius: 8,
    color: "#0369a1",
    fontSize: 13,
  },
  warnBox: {
    padding: "10px 14px",
    background: "#fef9c3",
    borderRadius: 8,
    color: "#854d0e",
    fontSize: 13,
  },
  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
    gap: 10,
  },
  courseCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 10,
    border: "2px solid #e5e7eb",
    background: "#f9fafb",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
  },
  courseCardSel: { background: "#eff6ff", borderColor: "#3b82f6" },
  courseName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1e293b",
    flex: 1,
    lineHeight: 1.3,
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #e5e7eb",
    fontSize: 14,
    background: "#f9fafb",
    color: "#1e293b",
    outline: "none",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #e5e7eb",
    fontSize: 14,
    background: "#f9fafb",
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
  },
  miniLabel: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 },
  typeRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  typeBtn: {
    padding: "8px 16px",
    borderRadius: 20,
    border: "1.5px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: 13,
    cursor: "pointer",
    color: "#374151",
  },
  typeBtnActive: {
    background: "#eff6ff",
    borderColor: "#3b82f6",
    color: "#1d4ed8",
    fontWeight: 600,
  },
  primaryBtn: {
    width: "100%",
    marginTop: 8,
    padding: "14px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
  },
  btnInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  errorBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 16,
    color: "#dc2626",
    fontSize: 14,
  },
  stickyBar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(8px)",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    padding: "12px 20px",
  },
  stickyInner: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  submitBtn: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: "#1d4ed8",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
  },
  qCard: {
    background: "#fff",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "2px solid transparent",
    transition: "border-color 0.2s",
  },
  qNum: {
    background: "#1d4ed8",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    padding: "3px 10px",
    borderRadius: 20,
  },
  qTypeBadge: {
    fontSize: 11,
    color: "#64748b",
    background: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: 10,
  },
  optBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid #e5e7eb",
    background: "#f9fafb",
    cursor: "pointer",
    transition: "all 0.15s",
    width: "100%",
  },
  optBtnSel: { background: "#eff6ff", borderColor: "#3b82f6" },
  optKey: {
    minWidth: 28,
    height: 28,
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#374151",
    flexShrink: 0,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 8,
    marginTop: 0,
  },
};
