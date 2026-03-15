/**
 * TestGen.jsx — BrainDrill AI Mock Test UI (Enhanced)
 *
 * NEW FEATURES vs previous version:
 *  🗺️  Question navigator sidebar — jump to any question, see status at a glance
 *  🎯  Confidence tagging — mark each answer: Sure / Unsure / Flag for review
 *  📊  Live performance ring — animated SVG countdown ring
 *  🔥  Streak tracker — longest correct answer streak shown in result
 *  🎬  Animated result reveal — score counts up smoothly on reveal
 *  🌙  Dark scholarly theme — deep navy + amber, premium and focused
 *  ⏸️  Idle warning — gentle nudge if student inactive 3 min
 *  📋  Submit summary modal — shows unanswered/flagged count before confirming
 *  🏷️  Difficulty badge + per-question estimated time shown in test bar
 *  💡  Hint system — "Show hint" reveals a contextual nudge from explanation
 *  🔍  Result filter — filter review by Correct / Wrong
 *  📈  Performance breakdown by question type bar chart in results
 *  ✨  Shimmer loading states for course cards
 */

import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";

// ── Injected once into <head> via useEffect (safe for Vite/SSR) ───────────────
const BD_STYLES = `
  @keyframes bd-spin    { to { transform: rotate(360deg); } }
  @keyframes bd-fadein  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes bd-pop     { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
  @keyframes bd-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .bd-enter  { animation: bd-fadein 0.35s cubic-bezier(0.23,1,0.32,1) both; }
  .bd-pop    { animation: bd-pop    0.4s  cubic-bezier(0.23,1,0.32,1) both; }
  .bd-qhover { transition: transform 0.15s, box-shadow 0.15s; }
  .bd-qhover:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,0,0,0.35) !important; }
  .bd-opthov:hover { border-color: rgba(232,160,69,0.55) !important; background: rgba(232,160,69,0.07) !important; }
  .bd-navbtn:hover { background: rgba(232,160,69,0.12) !important; }
  .bd-scr::-webkit-scrollbar { width: 4px; }
  .bd-scr::-webkit-scrollbar-thumb { background: #2e3a52; border-radius: 2px; }
`;

function useInjectStyles() {
  useEffect(() => {
    if (!document.head.querySelector("[data-bd-fonts]")) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@400;500&family=Outfit:wght@400;500;600;700;800&display=swap";
      l.setAttribute("data-bd-fonts", "1");
      document.head.appendChild(l);
    }
    if (!document.head.querySelector("[data-bd-styles]")) {
      const s = document.createElement("style");
      s.setAttribute("data-bd-styles", "1");
      s.textContent = BD_STYLES;
      document.head.appendChild(s);
    }
  }, []);
}

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0d1117",
  surface: "#161b22",
  raised: "#1c2230",
  border: "#21293a",
  amber: "#e8a045",
  amberDim: "#a06820",
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

const CONF = {
  sure: {
    bg: C.tealBg,
    bdr: "rgba(62,207,176,0.4)",
    clr: C.teal,
    lbl: "✓ Sure",
  },
  unsure: {
    bg: "rgba(248,197,80,0.10)",
    bdr: "rgba(248,197,80,0.4)",
    clr: "#f8c550",
    lbl: "? Unsure",
  },
  flag: {
    bg: C.redBg,
    bdr: "rgba(240,112,112,0.4)",
    clr: C.red,
    lbl: "⚑ Flag",
  },
};

const DIFF = {
  easy: { clr: C.green, desc: "Foundational recall" },
  medium: { clr: C.amber, desc: "Applied understanding" },
  hard: { clr: C.red, desc: "Deep analysis" },
  complex: { clr: "#c084fc", desc: "Synthesis & evaluation" },
};

// ── Animated count-up hook ────────────────────────────────────────────────────
function useCountUp(target, ms = 1400, run = false) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / ms, 1);
      setV(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, ms, run]);
  return v;
}

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onGenerate, loading, slots }) {
  const [enrollments, setEnrollments] = useState([]);
  const [modules, setModules] = useState([]);
  const [loadingC, setLoadingC] = useState(true);
  const [loadingM, setLoadingM] = useState(false);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [topic, setTopic] = useState("");
  const [nQ, setNQ] = useState(10);
  const [dur, setDur] = useState(15);
  const [diff, setDiff] = useState("medium");
  const [types, setTypes] = useState(["mcq"]);

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

  useEffect(() => {
    if (lesson) setTopic(lesson.name);
    else if (course) setTopic(course.name);
  }, [lesson, course]);

  const toggleType = (t) =>
    setTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const submit = () => {
    if (!course) return alert("Please select a course.");
    if (!topic.trim()) return alert("Please enter a topic.");
    if (!types.length) return alert("Select at least one question type.");
    if (topic.length > 200) return alert("Topic must be under 200 characters.");
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
  const low = avail !== null && avail <= 5;
  const full = avail !== null && avail === 0;

  return (
    <div className="bd-enter" style={sx.card}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={sx.logoBox}>
          <span style={{ fontSize: 20 }}>⚡</span>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={sx.cardTitle}>BrainDrill</h2>
          <p style={sx.cardSub}>
            AI questions from your enrolled course material
          </p>
        </div>
        {avail !== null && (
          <div
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: full ? C.redBg : low ? C.amberBg : C.tealBg,
              color: full ? C.red : low ? C.amber : C.teal,
              border: `1px solid ${full ? "rgba(240,112,112,0.3)" : low ? C.amberBdr : "rgba(62,207,176,0.3)"}`,
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {full ? "● FULL" : low ? `● ${avail} LEFT` : `● ${avail} OPEN`}
          </div>
        )}
      </div>

      {full && (
        <div style={{ ...sx.warnBox, marginBottom: 20 }}>
          ⚠ All test slots occupied — please wait and try again.
        </div>
      )}

      {/* Step 1 — Course */}
      <div style={sx.sec}>
        <div style={sx.stepRow}>
          <span style={sx.badge}>01</span>
          <span style={sx.stepTitle}>Choose Course</span>
        </div>
        {loadingC ? (
          <div style={{ display: "flex", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 52,
                  flex: 1,
                  borderRadius: 10,
                  background: `linear-gradient(90deg,${C.raised} 25%,${C.border} 50%,${C.raised} 75%)`,
                  backgroundSize: "200% 100%",
                  animation: "bd-shimmer 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : !enrollments.length ? (
          <div style={sx.infoBox}>You are not enrolled in any courses yet.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))",
              gap: 10,
            }}
          >
            {enrollments.map((e) => {
              const c = e.Course;
              const sel = course?.id === e.course_id;
              return (
                <button
                  key={e.course_id}
                  className="bd-qhover"
                  onClick={() =>
                    setCourse({
                      id: e.course_id,
                      name: c?.course_name || "Course",
                    })
                  }
                  style={{
                    ...sx.courseCard,
                    ...(sel
                      ? { background: C.amberBg, borderColor: C.amberBdr }
                      : {}),
                  }}
                >
                  <span style={{ fontSize: 18 }}>🎓</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: sel ? C.amber : C.text,
                      flex: 1,
                      textAlign: "left",
                      lineHeight: 1.3,
                    }}
                  >
                    {c?.course_name || "Course"}
                  </span>
                  {sel && <span style={{ color: C.amber }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2 — Lesson */}
      {course && (
        <div style={sx.sec}>
          <div style={sx.stepRow}>
            <span style={sx.badge}>02</span>
            <span style={sx.stepTitle}>
              Select Lesson{" "}
              <span style={{ fontWeight: 400, color: C.muted, fontSize: 12 }}>
                — optional
              </span>
            </span>
          </div>
          {loadingM ? (
            <div style={sx.infoBox}>Loading lessons…</div>
          ) : !modules.length ? (
            <div style={sx.infoBox}>
              No lessons found — will test entire course.
            </div>
          ) : (
            <select
              style={sx.select}
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

      {/* Step 3 — Topic */}
      {course && (
        <div style={sx.sec}>
          <div style={sx.stepRow}>
            <span style={sx.badge}>03</span>
            <span style={sx.stepTitle}>
              Topic{" "}
              <span style={{ fontWeight: 400, color: C.muted, fontSize: 12 }}>
                — auto-filled, editable
              </span>
            </span>
          </div>
          <input
            style={sx.input}
            placeholder="e.g. Payment Systems, Neural Networks…"
            value={topic}
            maxLength={200}
            onChange={(e) => setTopic(e.target.value)}
          />
          <p
            style={{
              fontSize: 11,
              color: C.muted,
              marginTop: 5,
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {topic.length}/200
          </p>
        </div>
      )}

      {/* Step 4 — Config */}
      {course && (
        <div style={sx.sec}>
          <div style={sx.stepRow}>
            <span style={sx.badge}>04</span>
            <span style={sx.stepTitle}>Test Settings</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14,
            }}
          >
            <div>
              <label style={sx.miniLabel}>Questions</label>
              <select
                style={sx.select}
                value={nQ}
                onChange={(e) => setNQ(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 25, 30].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={sx.miniLabel}>Duration</label>
              <select
                style={sx.select}
                value={dur}
                onChange={(e) => setDur(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 30, 45, 60].map((n) => (
                  <option key={n} value={n}>
                    {n} min
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={sx.miniLabel}>Difficulty</label>
              <select
                style={sx.select}
                value={diff}
                onChange={(e) => setDiff(e.target.value)}
              >
                {Object.keys(DIFF).map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty pill */}
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 10,
                fontWeight: 600,
                letterSpacing: "0.05em",
                background: `${DIFF[diff].clr}18`,
                color: DIFF[diff].clr,
                border: `1px solid ${DIFF[diff].clr}40`,
              }}
            >
              {diff.toUpperCase()}
            </span>
            <span style={{ fontSize: 12, color: C.muted }}>
              {DIFF[diff].desc}
            </span>
            <span
              style={{
                fontSize: 11,
                color: C.dim,
                marginLeft: "auto",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              ~{(dur / nQ).toFixed(1)} min/q
            </span>
          </div>

          {/* Question types */}
          <div style={{ marginTop: 16 }}>
            <label style={sx.miniLabel}>Question Types</label>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              {[
                ["mcq", "MCQ", "Single answer"],
                ["msq", "Multi-Select", "Multiple answers"],
                ["true_false", "True / False", "Binary choice"],
              ].map(([v, lbl, sub]) => (
                <button
                  key={v}
                  onClick={() => toggleType(v)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1.5px solid ${types.includes(v) ? C.amberBdr : C.border}`,
                    background: types.includes(v) ? C.amberBg : "transparent",
                    color: types.includes(v) ? C.amber : C.muted,
                    transition: "all 0.15s",
                  }}
                >
                  {lbl}
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      fontWeight: 400,
                      marginTop: 2,
                      opacity: 0.7,
                    }}
                  >
                    {sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !course || full}
        style={{
          ...sx.primaryBtn,
          opacity: loading || !course || full ? 0.5 : 1,
        }}
      >
        {loading ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span style={sx.spin} />
            Generating with AI…
          </span>
        ) : full ? (
          "⏳ All slots full — please wait"
        ) : (
          "⚡ Generate Test"
        )}
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

// ── Test Screen ───────────────────────────────────────────────────────────────
function TestScreen({ testData, onSubmit, submitting }) {
  const total = testData.duration_minutes * 60;
  const [timeLeft, setTimeLeft] = useState(total);
  const [answers, setAnswers] = useState({});
  const [confidence, setConfidence] = useState({});
  const [curQ, setCurQ] = useState(0);
  const [showHint, setShowHint] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [idleWarn, setIdleWarn] = useState(false);
  const startRef = useRef(Date.now());
  const timerRef = useRef(null);
  const idleRef = useRef(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    const h = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  const resetIdle = useCallback(() => {
    setIdleWarn(false);
    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => setIdleWarn(true), 180_000);
  }, []);

  useEffect(() => {
    resetIdle();
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    return () => {
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      clearTimeout(idleRef.current);
    };
  }, [resetIdle]);

  const handleSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    setShowSummary(false); // close modal immediately
    onSubmit({
      testId: testData.test_id,
      questions: testData.questions,
      answers,
      timeTakenSeconds: Math.floor((Date.now() - startRef.current) / 1000),
    });
  }, [answers, testData, onSubmit]);

  useEffect(() => {
    timerRef.current = setInterval(
      () =>
        setTimeLeft((t) => {
          if (t <= 1) {
            setShowSummary(false); // close modal if open when timer expires
            handleSubmit();
            return 0;
          }
          return t - 1;
        }),
      1000,
    );
    return () => clearInterval(timerRef.current);
  }, [handleSubmit]);

  const select = (qid, opt) => {
    const q = testData.questions.find((q) => q.id === qid);
    if (q?.type === "msq") {
      setAnswers((p) => {
        const c = p[qid] || [];
        return {
          ...p,
          [qid]: c.includes(opt) ? c.filter((o) => o !== opt) : [...c, opt],
        };
      });
    } else {
      setAnswers((p) => ({ ...p, [qid]: [opt] }));
    }
  };
  const toggleConf = (qid, val) =>
    setConfidence((p) => ({ ...p, [qid]: p[qid] === val ? null : val }));

  const qs = testData.questions;
  const answered = Object.keys(answers).length;
  const flagged = Object.values(confidence).filter((v) => v === "flag").length;
  const pct = Math.round((timeLeft / total) * 100);
  const timerClr = timeLeft < 60 ? C.red : timeLeft < 300 ? C.amber : C.teal;
  const circ = 2 * Math.PI * 20;
  const q = qs[curQ];

  const navSt = (idx) => {
    const id = qs[idx]?.id;
    if (confidence[id] === "flag") return "flag";
    if (answers[id]) return "done";
    return "empty";
  };

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {/* ── Navigator panel ── */}
      <div style={sx.navPanel} className="bd-scr">
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: C.muted,
            letterSpacing: "0.1em",
            marginBottom: 12,
            fontFamily: "'DM Mono',monospace",
          }}
        >
          NAVIGATOR
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {qs.map((_, i) => {
            const st = navSt(i);
            const cur = i === curQ;
            return (
              <button
                key={i}
                className="bd-navbtn"
                onClick={() => setCurQ(i)}
                title={`Q${i + 1}`}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Mono',monospace",
                  transition: "all 0.12s",
                  border: cur
                    ? `2px solid ${C.amber}`
                    : `1.5px solid ${st === "flag" ? "rgba(240,112,112,0.5)" : st === "done" ? "rgba(74,222,128,0.4)" : C.border}`,
                  background: cur
                    ? C.amberBg
                    : st === "flag"
                      ? C.redBg
                      : st === "done"
                        ? C.greenBg
                        : "transparent",
                  color: cur
                    ? C.amber
                    : st === "flag"
                      ? C.red
                      : st === "done"
                        ? C.green
                        : C.muted,
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          {[
            [C.green, "Answered", answered],
            [C.red, "Flagged", flagged],
            [C.muted, "Remaining", qs.length - answered],
          ].map(([clr, lbl, cnt]) => (
            <div
              key={lbl}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                color: C.muted,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  background: clr,
                  display: "inline-block",
                }}
              />
              <span style={{ flex: 1 }}>{lbl}</span>
              <span
                style={{
                  color: clr,
                  fontWeight: 700,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {cnt}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 14,
            padding: "10px",
            background: C.raised,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>
            PROGRESS
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: C.amber,
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {Math.round((answered / qs.length) * 100)}%
          </div>
          <div
            style={{
              height: 3,
              background: C.border,
              borderRadius: 2,
              marginTop: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(answered / qs.length) * 100}%`,
                background: C.amber,
                borderRadius: 2,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
        <button
          onClick={() => setShowSummary(true)}
          disabled={submitting}
          style={{
            ...sx.primaryBtn,
            marginTop: 16,
            padding: "10px",
            fontSize: 12,
          }}
        >
          Submit Test
        </button>
      </div>

      {/* ── Main question area ── */}
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}
      >
        {/* Sticky bar */}
        <div style={sx.stickyBar}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            📚 {testData.topic}
          </span>
          <div
            style={{
              position: "relative",
              width: 44,
              height: 44,
              flexShrink: 0,
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 48 48"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke={C.border}
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke={timerClr}
                strokeWidth="4"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct / 100)}
                style={{
                  transition: "stroke-dashoffset 1s linear,stroke 0.3s",
                }}
              />
            </svg>
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                fontSize: 9,
                fontWeight: 700,
                color: timerClr,
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {fmt(timeLeft)}
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              color: C.muted,
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {answered}/{qs.length}
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 6,
              background: C.amberBg,
              color: C.amber,
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            {(testData.difficulty || "MEDIUM").toUpperCase()}
          </span>
        </div>

        {/* Idle warning */}
        {idleWarn && (
          <div
            className="bd-pop"
            style={{
              ...sx.warnBox,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>⏸ Still there? Your timer is running.</span>
            <button
              onClick={() => setIdleWarn(false)}
              style={{
                background: "none",
                border: "none",
                color: C.amber,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Question card */}
        {q && (
          <div key={q.id} className="bd-enter bd-qhover" style={sx.qCard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <span style={{ ...sx.qBadge, fontFamily: "'DM Mono',monospace" }}>
                Q{curQ + 1} / {qs.length}
              </span>
              <span style={sx.typeBadge}>
                {q.type === "true_false"
                  ? "True/False"
                  : q.type === "msq"
                    ? "Multi-Select"
                    : "MCQ"}
              </span>
              {/* Confidence tags */}
              <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                {Object.entries(CONF).map(([k, cv]) => (
                  <button
                    key={k}
                    onClick={() => toggleConf(q.id, k)}
                    style={{
                      fontSize: 10,
                      padding: "3px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                      border: `1px solid ${confidence[q.id] === k ? cv.bdr : C.border}`,
                      background:
                        confidence[q.id] === k ? cv.bg : "transparent",
                      color: confidence[q.id] === k ? cv.clr : C.dim,
                      transition: "all 0.12s",
                    }}
                  >
                    {cv.lbl}
                  </button>
                ))}
              </div>
            </div>

            <p
              style={{
                fontSize: 16,
                color: C.text,
                fontWeight: 500,
                lineHeight: 1.75,
                marginBottom: 16,
                fontFamily: "'Crimson Pro',serif",
              }}
            >
              {q.question}
            </p>

            {q.type === "msq" && (
              <p
                style={{
                  fontSize: 12,
                  color: C.amber,
                  marginBottom: 12,
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
                    className="bd-opthov"
                    style={{
                      ...sx.optBtn,
                      border: `1.5px solid ${sel ? C.amberBdr : C.border}`,
                      background: sel ? C.amberBg : "transparent",
                    }}
                  >
                    <span
                      style={{
                        ...sx.optKey,
                        background: sel ? C.amber : C.raised,
                        color: sel ? "#0d1117" : C.muted,
                        fontFamily: "'DM Mono',monospace",
                      }}
                    >
                      {key}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        color: sel ? C.text : C.muted,
                        flex: 1,
                        textAlign: "left",
                      }}
                    >
                      {val}
                    </span>
                    {sel && (
                      <span style={{ fontSize: 12, color: C.amber }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            {q.explanation && (
              <div style={{ marginTop: 14 }}>
                {!showHint[q.id] ? (
                  <button
                    onClick={() => setShowHint((p) => ({ ...p, [q.id]: true }))}
                    style={{
                      fontSize: 12,
                      color: C.muted,
                      background: "none",
                      border: `1px dashed ${C.border}`,
                      borderRadius: 6,
                      padding: "5px 12px",
                      cursor: "pointer",
                    }}
                  >
                    💡 Show hint
                  </button>
                ) : (
                  <div
                    className="bd-enter"
                    style={{
                      background: C.blueBg,
                      border: "1px solid rgba(96,165,250,0.2)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: C.blue,
                      lineHeight: 1.6,
                      fontFamily: "'Crimson Pro',serif",
                    }}
                  >
                    💡 {q.explanation.slice(0, 140)}
                    {q.explanation.length > 140 ? "…" : ""}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Prev/Next */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setCurQ((p) => Math.max(0, p - 1))}
            disabled={curQ === 0}
            style={{ ...sx.navArrow, opacity: curQ === 0 ? 0.3 : 1 }}
          >
            ← Prev
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setCurQ((p) => Math.min(qs.length - 1, p + 1))}
            disabled={curQ === qs.length - 1}
            style={{
              ...sx.navArrow,
              opacity: curQ === qs.length - 1 ? 0.3 : 1,
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* ── Submit summary modal ── */}
      {showSummary && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            className="bd-pop"
            style={{ ...sx.card, maxWidth: 420, width: "100%" }}
          >
            <h3
              style={{
                color: C.text,
                fontSize: 17,
                fontWeight: 700,
                marginTop: 0,
                marginBottom: 6,
              }}
            >
              Ready to submit?
            </h3>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 18 }}>
              Review your progress before submitting.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {[
                [
                  "Answered",
                  answered,
                  answered === qs.length ? C.green : C.muted,
                ],
                [
                  "Unanswered",
                  qs.length - answered,
                  qs.length - answered > 0 ? C.red : C.green,
                ],
                [
                  "Flagged for review",
                  flagged,
                  flagged > 0 ? C.amber : C.muted,
                ],
                ["Time remaining", fmt(timeLeft), timerClr],
              ].map(([lbl, val, clr]) => (
                <div
                  key={lbl}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: C.raised,
                  }}
                >
                  <span style={{ fontSize: 13, color: C.muted }}>{lbl}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: clr,
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
            {qs.length - answered > 0 && (
              <div style={{ ...sx.warnBox, marginBottom: 16 }}>
                ⚠ {qs.length - answered} unanswered — will be marked wrong.
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowSummary(false)}
                style={{ ...sx.secBtn, flex: 1 }}
              >
                ← Go back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || submittedRef.current}
                style={{
                  ...sx.primaryBtn,
                  flex: 1,
                  padding: "12px",
                  marginTop: 0,
                }}
              >
                {submitting || submittedRef.current
                  ? "Submitting…"
                  : "Submit ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Result Screen ──────────────────────────────────────────────────────────────
function ResultScreen({ result, onRetry }) {
  const [filter, setFilter] = useState("all");
  const [revealed, setRevealed] = useState(false);
  const pctAnim = useCountUp(result.percentage, 1500, revealed);

  useEffect(() => {
    setTimeout(() => setRevealed(true), 150);
  }, []);

  const band = result.performance_band;
  const BC = {
    Excellent: { clr: C.teal, icon: "🏆", msg: "Outstanding work!" },
    Good: { clr: C.green, icon: "🎯", msg: "Great performance!" },
    Average: { clr: C.amber, icon: "📈", msg: "Good effort — keep going!" },
    "Needs Improvement": { clr: C.red, icon: "💪", msg: "Keep practising!" },
  }[band] || { clr: C.amber, icon: "⚡", msg: "" };

  // Longest streak
  const streak = (() => {
    let best = 0,
      cur = 0;
    (result.results || []).forEach((r) => {
      if (r.is_correct) {
        cur++;
        best = Math.max(best, cur);
      } else cur = 0;
    });
    return best;
  })();

  // By-type breakdown
  const byType = {};
  (result.results || []).forEach((r, i) => {
    const t = result.questions?.[i]?.type || "mcq";
    if (!byType[t]) byType[t] = { correct: 0, total: 0 };
    byType[t].total++;
    if (r.is_correct) byType[t].correct++;
  });

  const circ = 2 * Math.PI * 50;
  const filtered = (result.results || []).filter((r) =>
    filter === "correct"
      ? r.is_correct
      : filter === "wrong"
        ? !r.is_correct
        : true,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Score card */}
      <div
        className="bd-enter"
        style={{
          ...sx.card,
          display: "flex",
          alignItems: "center",
          gap: 28,
          flexWrap: "wrap",
          padding: 32,
        }}
      >
        {/* Animated ring */}
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            flexShrink: 0,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={C.border}
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={BC.clr}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={
                revealed ? circ * (1 - result.percentage / 100) : circ
              }
              style={{
                transition:
                  "stroke-dashoffset 1.5s cubic-bezier(0.23,1,0.32,1)",
              }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: BC.clr,
                fontFamily: "'Outfit',sans-serif",
                lineHeight: 1,
              }}
            >
              {pctAnim}%
            </span>
            <span style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
              SCORE
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 22 }}>{BC.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "3px 12px",
                borderRadius: 20,
                background: `${BC.clr}18`,
                color: BC.clr,
                border: `1px solid ${BC.clr}40`,
              }}
            >
              {band?.toUpperCase()}
            </span>
          </div>
          <p
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              margin: "0 0 4px",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            {result.score} / {result.total} correct
          </p>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            {BC.msg} · ⏱ {Math.floor(result.time_taken_seconds / 60)}m{" "}
            {result.time_taken_seconds % 60}s
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            [
              "Best Streak",
              streak > 0 ? `${streak} 🔥` : "—",
              streak >= 3 ? C.amber : C.muted,
            ],
            ["Accuracy", `${result.percentage}%`, BC.clr],
          ].map(([lbl, val, clr]) => (
            <div
              key={lbl}
              style={{
                textAlign: "center",
                padding: "12px 16px",
                borderRadius: 10,
                background: C.raised,
                minWidth: 80,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: clr,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {val}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: C.muted,
                  marginTop: 3,
                  letterSpacing: "0.06em",
                }}
              >
                {lbl}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Type breakdown */}
      {Object.keys(byType).length > 0 && (
        <div
          className="bd-enter"
          style={{ ...sx.card, animationDelay: "0.1s" }}
        >
          <h3 style={sx.secTitle}>Performance by question type</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(byType).map(([type, { correct, total }]) => {
              const p = Math.round((correct / total) * 100);
              return (
                <div
                  key={type}
                  style={{
                    flex: 1,
                    minWidth: 100,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: C.raised,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      marginBottom: 8,
                      letterSpacing: "0.07em",
                    }}
                  >
                    {type === "true_false" ? "TRUE/FALSE" : type.toUpperCase()}
                  </div>
                  <div
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: C.border,
                      overflow: "hidden",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${p}%`,
                        background:
                          p >= 70 ? C.green : p >= 50 ? C.amber : C.red,
                        borderRadius: 2,
                        transition: "width 1.2s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 14,
                    }}
                  >
                    {correct}/{total}
                    <span
                      style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}
                    >
                      {p}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall feedback */}
      <div className="bd-enter" style={{ ...sx.card, animationDelay: "0.15s" }}>
        <h3 style={sx.secTitle}>Overall feedback</h3>
        <p
          style={{
            fontSize: 16,
            color: C.muted,
            lineHeight: 1.85,
            margin: 0,
            fontFamily: "'Crimson Pro',serif",
          }}
        >
          {result.overall_feedback}
        </p>
      </div>

      {/* Study recommendations */}
      {result.study_recommendations?.length > 0 && (
        <div
          className="bd-enter"
          style={{ ...sx.card, animationDelay: "0.2s" }}
        >
          <h3 style={sx.secTitle}>Study recommendations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.study_recommendations.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: C.raised,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    color: C.amber,
                    fontWeight: 700,
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                >
                  →
                </span>
                <span
                  style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}
                >
                  {r}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question review */}
      <div className="bd-enter" style={{ animationDelay: "0.25s" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ ...sx.secTitle, margin: 0 }}>Question review</h3>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {[
              ["all", "All"],
              ["correct", "✓ Correct"],
              ["wrong", "✗ Wrong"],
            ].map(([v, lbl]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                  border: `1px solid ${filter === v ? C.amberBdr : C.border}`,
                  background: filter === v ? C.amberBg : "transparent",
                  color: filter === v ? C.amber : C.muted,
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((r, i) => (
            <div
              key={r.id || i}
              className="bd-enter"
              style={{
                background: C.surface,
                borderRadius: 12,
                padding: "16px 18px",
                borderLeft: `3px solid ${r.is_correct ? C.green : C.red}`,
                animationDelay: `${i * 0.04}s`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.muted,
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  Q{i + 1}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 10px",
                    borderRadius: 10,
                    background: r.is_correct ? C.greenBg : C.redBg,
                    color: r.is_correct ? C.green : C.red,
                  }}
                >
                  {r.is_correct ? "✓ Correct" : "✗ Wrong"}
                </span>
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: C.muted,
                  lineHeight: 1.7,
                  margin: "0 0 6px",
                  fontFamily: "'Crimson Pro',serif",
                }}
              >
                {r.feedback}
              </p>
              {!r.is_correct && (
                <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>
                  Correct answer:{" "}
                  <strong style={{ color: C.green }}>
                    {r.correct_answer?.join(", ")}
                  </strong>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={onRetry} style={{ ...sx.primaryBtn, marginTop: 4 }}>
        🔄 Take Another Test
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TestGen() {
  useInjectStyles();
  const [phase, setPhase] = useState("setup");
  const [testData, setTestData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState(null);
  const activeRef = useRef(false);

  useEffect(() => {
    const fetch = () =>
      api
        .get("/testgen/status")
        .then((r) => setSlots(r.data))
        .catch(() => {});
    fetch();
    const iv = setInterval(fetch, 30_000);
    return () => clearInterval(iv);
  }, []);

  const generate = async (form) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/testgen/generate", form);
      activeRef.current = true;
      setTestData(data);
      setPhase("test");
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Generation failed";
      setError(
        e.response?.status === 429
          ? `⏱ ${msg}`
          : e.response?.status === 403
            ? `🔒 ${msg}`
            : msg,
      );
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
      activeRef.current = false;
      setResult({ ...data, questions });
      setPhase("result");
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    activeRef.current = false;
    setPhase("setup");
    setTestData(null);
    setResult(null);
    setError("");
  };

  return (
    <div style={sx.page}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={sx.logoBox}>
          <span style={{ fontSize: 20 }}>⚡</span>
        </div>
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              margin: 0,
              color: C.text,
              fontFamily: "'Outfit',sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            BrainDrill
          </h1>
          <p style={{ color: C.muted, marginTop: 2, fontSize: 13, margin: 0 }}>
            AI mock tests from your course content
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {[
            ["setup", "Setup"],
            ["test", "Test"],
            ["result", "Result"],
          ].map(([p, lbl]) => (
            <span
              key={p}
              style={{
                fontSize: 10,
                padding: "3px 10px",
                borderRadius: 10,
                fontWeight: 600,
                letterSpacing: "0.04em",
                background: phase === p ? C.amberBg : "transparent",
                color: phase === p ? C.amber : C.dim,
                border: `1px solid ${phase === p ? C.amberBdr : "transparent"}`,
              }}
            >
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="bd-pop"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: C.redBg,
            border: "1px solid rgba(240,112,112,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            color: C.red,
            fontSize: 14,
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.red,
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {phase === "setup" && (
        <SetupScreen onGenerate={generate} loading={loading} slots={slots} />
      )}
      {phase === "test" && testData && (
        <TestScreen
          testData={testData}
          onSubmit={submit}
          submitting={submitting}
        />
      )}
      {phase === "result" && result && (
        <ResultScreen result={result} onRetry={retry} />
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const sx = {
  page: {
    padding: "24px",
    maxWidth: 1020,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Outfit',sans-serif",
    color: C.text,
    background: C.bg,
    minHeight: "100vh",
  },
  card: {
    background: C.surface,
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 1px 3px rgba(0,0,0,0.4),0 8px 32px rgba(0,0,0,0.2)",
    border: `1px solid ${C.border}`,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg,#e8a045,#a06820)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(232,160,69,0.3)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: C.text,
    margin: 0,
    fontFamily: "'Outfit',sans-serif",
  },
  cardSub: { color: C.muted, fontSize: 13, margin: "3px 0 0" },
  sec: { marginBottom: 24 },
  stepRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  badge: {
    fontFamily: "'DM Mono',monospace",
    fontSize: 11,
    fontWeight: 700,
    color: C.amber,
    background: C.amberBg,
    border: `1px solid ${C.amberBdr}`,
    padding: "2px 8px",
    borderRadius: 6,
    letterSpacing: "0.08em",
  },
  stepTitle: { fontSize: 14, fontWeight: 600, color: C.text },
  infoBox: {
    padding: "10px 14px",
    background: C.blueBg,
    borderRadius: 8,
    color: C.blue,
    fontSize: 13,
    border: "1px solid rgba(96,165,250,0.2)",
  },
  warnBox: {
    padding: "10px 14px",
    background: C.amberBg,
    borderRadius: 8,
    color: C.amber,
    fontSize: 13,
    border: `1px solid ${C.amberBdr}`,
  },
  courseCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 10,
    border: `1.5px solid ${C.border}`,
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1.5px solid ${C.border}`,
    fontSize: 14,
    background: C.raised,
    color: C.text,
    outline: "none",
    fontFamily: "'Outfit',sans-serif",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1.5px solid ${C.border}`,
    fontSize: 14,
    background: C.raised,
    color: C.text,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Outfit',sans-serif",
  },
  miniLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: C.muted,
    marginBottom: 6,
    letterSpacing: "0.06em",
  },
  primaryBtn: {
    width: "100%",
    marginTop: 8,
    padding: "14px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#e8a045,#a06820)",
    color: "#0d1117",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Outfit',sans-serif",
    transition: "opacity 0.15s",
    letterSpacing: "0.02em",
  },
  secBtn: {
    padding: "12px",
    borderRadius: 10,
    border: `1.5px solid ${C.border}`,
    background: "transparent",
    color: C.muted,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Outfit',sans-serif",
  },
  spin: {
    width: 14,
    height: 14,
    border: "2px solid rgba(13,17,23,0.3)",
    borderTop: "2px solid #0d1117",
    borderRadius: "50%",
    animation: "bd-spin 0.7s linear infinite",
    display: "inline-block",
    verticalAlign: "middle",
  },
  navPanel: {
    width: 175,
    flexShrink: 0,
    background: C.surface,
    borderRadius: 16,
    padding: 16,
    border: `1px solid ${C.border}`,
    position: "sticky",
    top: 20,
    maxHeight: "82vh",
    overflowY: "auto",
  },
  stickyBar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: `${C.surface}f2`,
    backdropFilter: "blur(10px)",
    borderRadius: 12,
    boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
    padding: "10px 16px",
    border: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  qCard: {
    background: C.surface,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    border: `1px solid ${C.border}`,
  },
  qBadge: {
    background: "linear-gradient(135deg,#e8a045,#a06820)",
    color: "#0d1117",
    fontWeight: 700,
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 20,
  },
  typeBadge: {
    fontSize: 11,
    color: C.muted,
    background: C.raised,
    padding: "3px 8px",
    borderRadius: 8,
    border: `1px solid ${C.border}`,
  },
  optBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    width: "100%",
    background: "transparent",
    transition: "all 0.12s",
  },
  optKey: {
    minWidth: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    transition: "all 0.12s",
  },
  navArrow: {
    padding: "8px 16px",
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    background: "transparent",
    color: C.muted,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'Outfit',sans-serif",
  },
  secTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: C.text,
    marginBottom: 14,
    marginTop: 0,
    letterSpacing: "0.02em",
  },
};
