import { useState, useEffect, useRef } from "react";

// ─── MOCK QUESTION BANK ──────────────────────────────────────────────────────
const MOCK_QUESTIONS = {
  easy: [
    { question: "What does HTML stand for?", type: "mcq", options: ["HyperText Markup Language", "HighText Machine Language", "HyperText Machine Language", "HyperTool Markup Language"], correct_answer: "HyperText Markup Language", explanation: "HTML stands for HyperText Markup Language, the standard language for web pages." },
    { question: "Which tag is used for the largest heading in HTML?", type: "mcq", options: ["<h6>", "<heading>", "<h1>", "<head>"], correct_answer: "<h1>", explanation: "<h1> defines the most important/largest heading." },
    { question: "CSS stands for Cascading Style Sheets.", type: "true_false", options: ["True", "False"], correct_answer: "True", explanation: "CSS = Cascading Style Sheets, used to style HTML elements." },
    { question: "Which language is used for web page styling?", type: "mcq", options: ["HTML", "CSS", "JavaScript", "Python"], correct_answer: "CSS", explanation: "CSS is used to control the presentation/styling of web pages." },
    { question: "JavaScript is a server-side only language.", type: "true_false", options: ["True", "False"], correct_answer: "False", explanation: "JavaScript runs on both client-side (browser) and server-side (Node.js)." },
    { question: "Which HTML element is used to define internal CSS?", type: "mcq", options: ["<css>", "<script>", "<style>", "<link>"], correct_answer: "<style>", explanation: "The <style> tag is used to embed CSS within an HTML document." },
    { question: "What symbol is used to select an ID in CSS?", type: "mcq", options: [".", "#", "*", "@"], correct_answer: "#", explanation: "The # symbol selects elements by their ID attribute in CSS." },
    { question: "React is a JavaScript library.", type: "true_false", options: ["True", "False"], correct_answer: "True", explanation: "React is a JavaScript library for building user interfaces, developed by Meta." },
    { question: "Which method adds an element to the end of an array in JavaScript?", type: "mcq", options: ["push()", "pop()", "shift()", "unshift()"], correct_answer: "push()", explanation: "push() adds one or more elements to the end of an array." },
    { question: "What does API stand for?", type: "mcq", options: ["Application Programming Interface", "Applied Program Integration", "Automated Programming Interface", "Application Protocol Interface"], correct_answer: "Application Programming Interface", explanation: "API = Application Programming Interface, a set of rules for software communication." },
  ],
  medium: [
    { question: "What is the time complexity of binary search?", type: "mcq", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct_answer: "O(log n)", explanation: "Binary search halves the search space each iteration, giving O(log n) complexity." },
    { question: "In React, the useState hook can only be used in class components.", type: "true_false", options: ["True", "False"], correct_answer: "False", explanation: "useState is a React Hook and can only be used in functional components." },
    { question: "Which HTTP method is idempotent and used to update a resource?", type: "mcq", options: ["POST", "GET", "PUT", "DELETE"], correct_answer: "PUT", explanation: "PUT is idempotent — calling it multiple times produces the same result." },
    { question: "What does the 'virtual DOM' in React help with?", type: "mcq", options: ["Direct database access", "Performance optimization by minimizing real DOM updates", "Server-side rendering only", "CSS styling"], correct_answer: "Performance optimization by minimizing real DOM updates", explanation: "Virtual DOM diffs changes and batches updates to minimize expensive real DOM manipulations." },
    { question: "A REST API must be stateless.", type: "true_false", options: ["True", "False"], correct_answer: "True", explanation: "Statelessness is a core REST constraint — each request must contain all needed info." },
    { question: "Which SQL clause is used to filter records?", type: "mcq", options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], correct_answer: "WHERE", explanation: "WHERE filters rows before grouping; HAVING filters after grouping." },
    { question: "What is the purpose of the useEffect hook in React?", type: "mcq", options: ["Manage component state", "Handle side effects like API calls", "Create new components", "Define CSS styles"], correct_answer: "Handle side effects like API calls", explanation: "useEffect runs after render and handles side effects such as data fetching and subscriptions." },
    { question: "Promises in JavaScript are used to handle synchronous operations.", type: "true_false", options: ["True", "False"], correct_answer: "False", explanation: "Promises handle asynchronous operations, allowing non-blocking code execution." },
    { question: "Which data structure follows LIFO (Last In, First Out)?", type: "mcq", options: ["Queue", "Stack", "Linked List", "Tree"], correct_answer: "Stack", explanation: "A Stack uses LIFO — the last element added is the first to be removed." },
    { question: "What does 'npm' stand for?", type: "mcq", options: ["Node Package Manager", "New Program Module", "Node Program Manager", "Network Package Module"], correct_answer: "Node Package Manager", explanation: "npm is the default package manager for Node.js projects." },
  ],
  hard: [
    { question: "Which design pattern ensures a class has only one instance?", type: "mcq", options: ["Factory", "Observer", "Singleton", "Strategy"], correct_answer: "Singleton", explanation: "The Singleton pattern restricts instantiation to a single object instance." },
    { question: "In distributed systems, CAP theorem states you can achieve all three: Consistency, Availability, and Partition Tolerance simultaneously.", type: "true_false", options: ["True", "False"], correct_answer: "False", explanation: "CAP theorem states you can only guarantee two of the three properties at once." },
    { question: "What is the space complexity of merge sort?", type: "mcq", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correct_answer: "O(n)", explanation: "Merge sort requires O(n) auxiliary space for the temporary arrays during merging." },
    { question: "Which React hook would you use to avoid re-creating a function on every render?", type: "mcq", options: ["useRef", "useCallback", "useMemo", "useReducer"], correct_answer: "useCallback", explanation: "useCallback memoizes a function so it's only re-created when dependencies change." },
    { question: "WebSockets use the HTTP protocol for full-duplex communication.", type: "true_false", options: ["True", "False"], correct_answer: "False", explanation: "WebSockets use the WS/WSS protocol. They start with an HTTP upgrade handshake but switch protocols." },
    { question: "In database indexing, a B-tree index is most efficient for:", type: "mcq", options: ["Full text search", "Range queries", "Hashing operations", "Graph traversal"], correct_answer: "Range queries", explanation: "B-tree indexes maintain sorted order, making them excellent for range queries and sorting." },
    { question: "What problem does the N+1 query problem describe?", type: "mcq", options: ["Database running N+1 servers", "Fetching a list then querying each item individually", "SQL syntax error with N+1 tables", "Connection pooling limit"], correct_answer: "Fetching a list then querying each item individually", explanation: "N+1 occurs when fetching N items requires 1 query for the list + N queries for each item's details." },
    { question: "Event sourcing stores the current state of an entity, not its history.", type: "true_false", options: ["True", "False"], correct_answer: "False", explanation: "Event sourcing stores a sequence of events; current state is derived by replaying them." },
    { question: "Which algorithm is used in Dijkstra's shortest path?", type: "mcq", options: ["Depth First Search", "Breadth First Search", "Greedy with Priority Queue", "Dynamic Programming only"], correct_answer: "Greedy with Priority Queue", explanation: "Dijkstra uses a greedy approach with a min-priority queue to always expand the closest unvisited node." },
    { question: "In OAuth 2.0, the 'Authorization Code' flow is the most secure for web applications.", type: "true_false", options: ["True", "False"], correct_answer: "True", explanation: "Authorization Code flow keeps tokens server-side, making it the most secure OAuth 2.0 flow." },
  ],
};

const COURSES = [
  { id: 1, name: "Web Development Fundamentals", instructor: "Dr. Anita Sharma" },
  { id: 2, name: "Data Structures & Algorithms", instructor: "Prof. Rajesh Kumar" },
  { id: 3, name: "React & Modern Frontend", instructor: "Ms. Priya Nair" },
  { id: 4, name: "Database Management Systems", instructor: "Dr. Suresh Patel" },
  { id: 5, name: "System Design", instructor: "Mr. Vikram Singh" },
];

const DIFFICULTIES = [
  { value: "easy",   label: "Easy",   dot: "bg-green-500",   desc: "Basic concepts & definitions" },
  { value: "medium", label: "Medium", dot: "bg-yellow-500",  desc: "Applied knowledge & analysis" },
  { value: "hard",   label: "Hard",   dot: "bg-red-500",     desc: "Advanced problems & reasoning" },
  { value: "mixed",  label: "Mixed",  dot: "bg-purple-500",  desc: "All levels combined" },
];

const QUESTION_TYPES = [
  { value: "mcq",        label: "Multiple Choice", desc: "4 options, 1 correct" },
  { value: "true_false", label: "True / False",    desc: "Binary choice" },
  { value: "mixed",      label: "Mixed",           desc: "Combination of both" },
];

const DURATIONS = [
  { value: 10, label: "10 min", sub: "Quick" },
  { value: 20, label: "20 min", sub: "Standard" },
  { value: 30, label: "30 min", sub: "Full" },
  { value: 45, label: "45 min", sub: "Deep dive" },
  { value: 60, label: "60 min", sub: "Exam" },
];

const COUNTS = [5, 10, 15, 20, 25, 30];

// ─── ICONS (inline SVG) ──────────────────────────────────────────────────────
const Icon = {
  Brain:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Check:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><polyline points="20 6 9 17 4 12"/></svg>,
  X:          () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevLeft:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevRight:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><polyline points="9 18 15 12 9 6"/></svg>,
  Clock:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Flag:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  Trophy:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 0 1-8 0Z"/><path d="M5 9H3a2 2 0 0 0 2 2"/><path d="M19 9h2a2 2 0 0 1-2 2"/></svg>,
  Rotate:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.87"/></svg>,
  Home:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Sparkles:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  Book:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Target:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Layers:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Arrow:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Bar:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
};

function Ic({ name, size = 16 }) {
  const C = Icon[name];
  if (!C) return null;
  return <span style={{ width: size, height: size, display: "inline-flex", flexShrink: 0 }}><C /></span>;
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ["Topic", "Settings", "Review", "Test"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 32 }}>
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${done || active ? "#f97316" : "#d1d5db"}`,
                background: done ? "#f97316" : active ? "#fff" : "#fff",
                color: done ? "#fff" : active ? "#f97316" : "#9ca3af",
                fontWeight: 700, fontSize: 14, transition: "all 0.3s",
                boxShadow: active ? "0 2px 8px rgba(249,115,22,0.3)" : "none"
              }}>
                {done ? <Ic name="Check" size={16} /> : idx}
              </div>
              <span style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: active ? "#f97316" : done ? "#6b7280" : "#9ca3af" }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 48, height: 2, margin: "0 4px", marginBottom: 16, background: done ? "#f97316" : "#e5e7eb", transition: "background 0.4s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── TIMER ───────────────────────────────────────────────────────────────────
function Timer({ totalSeconds, onTimeUp }) {
  const [rem, setRem] = useState(totalSeconds);
  const ref = useRef();
  useEffect(() => {
    ref.current = setInterval(() => {
      setRem(p => { if (p <= 1) { clearInterval(ref.current); onTimeUp(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);
  const mins = Math.floor(rem / 60), secs = rem % 60;
  const pct = (rem / totalSeconds) * 100;
  const urgent = rem < 60;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12,
      border: `2px solid ${urgent ? "#f87171" : "#fdba74"}`,
      background: urgent ? "#fef2f2" : "#fff7ed",
      color: urgent ? "#dc2626" : "#ea580c",
      fontWeight: 700, fontSize: 16,
      animation: urgent ? "pulse 1s infinite" : "none"
    }}>
      <Ic name="Clock" size={20} />
      <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
      <div style={{ width: 72, height: 6, background: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginLeft: 4 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: urgent ? "#ef4444" : "#f97316", borderRadius: 999, transition: "width 1s" }} />
      </div>
    </div>
  );
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────
function ResultScreen({ questions, answers, elapsed, config, onRetry, onHome }) {
  const score = questions.filter((q, i) => answers[i] === q.correct_answer).length;
  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;
  const grade = pct >= 90 ? { l: "A+", c: "#16a34a", bg: "#f0fdf4" } : pct >= 80 ? { l: "A", c: "#22c55e", bg: "#f0fdf4" } : pct >= 70 ? { l: "B", c: "#2563eb", bg: "#eff6ff" } : pct >= 60 ? { l: "C", c: "#ca8a04", bg: "#fefce8" } : { l: "F", c: "#dc2626", bg: "#fef2f2" };
  const mins = Math.floor(elapsed / 60), secs = elapsed % 60;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ borderRadius: 20, padding: 40, textAlign: "center", marginBottom: 20, border: `2px solid ${passed ? "#bbf7d0" : "#fecaca"}`, background: passed ? "linear-gradient(135deg,#f0fdf4,#fff)" : "linear-gradient(135deg,#fef2f2,#fff)" }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, background: grade.bg, color: grade.c }}>
          {grade.l}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: passed ? "#15803d" : "#dc2626", margin: "0 0 6px" }}>{passed ? "🎉 Test Passed!" : "😓 Keep Practising"}</h2>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 24px" }}>{config.topic} · {config.difficulty} · {config.questionType}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 360, margin: "0 auto" }}>
          {[
            { label: "Score", value: `${score}/${total}`, icon: "Trophy", color: "#f97316" },
            { label: "Accuracy", value: `${pct}%`, icon: "Target", color: "#3b82f6" },
            { label: "Time", value: `${mins}m ${secs}s`, icon: "Clock", color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #f3f4f6", textAlign: "center" }}>
              <span style={{ color: s.color, display: "block", marginBottom: 4 }}><Ic name={s.icon} size={20} /></span>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#1f2937" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Review */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f3f4f6", overflow: "hidden", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, color: "#1f2937", display: "flex", alignItems: "center", gap: 8 }}><Ic name="Bar" size={18} /> Answer Review</span>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>{score} correct · {total - score} wrong</span>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {questions.map((q, i) => {
            const ok = answers[i] === q.correct_answer;
            return (
              <div key={i} style={{ padding: "16px 24px", borderBottom: "1px solid #f9fafb", background: ok ? "rgba(240,253,244,0.5)" : "rgba(254,242,242,0.5)" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: ok ? "#dcfce7" : "#fee2e2", marginTop: 2 }}>
                    <span style={{ color: ok ? "#16a34a" : "#ef4444" }}><Ic name={ok ? "Check" : "X"} size={13} /></span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", margin: "0 0 6px" }}>Q{i + 1}. {q.question}</p>
                    {!ok && <div>
                      <p style={{ fontSize: 11, color: "#ef4444", margin: "0 0 2px" }}>Your answer: <b>{answers[i] ?? "Not answered"}</b></p>
                      <p style={{ fontSize: 11, color: "#16a34a", margin: 0 }}>Correct: <b>{q.correct_answer}</b></p>
                    </div>}
                    {q.explanation && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, fontStyle: "italic" }}>💡 {q.explanation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onHome} style={{ flex: 1, padding: "14px", border: "2px solid #e5e7eb", borderRadius: 14, background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14 }}>
          <Ic name="Home" size={18} /> Back to Home
        </button>
        <button onClick={onRetry} style={{ flex: 1, padding: "14px", border: "none", borderRadius: 14, background: "#f97316", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}>
          <Ic name="Rotate" size={18} /> Try Again
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function TestGen() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({ courseId: null, courseName: "", topic: "", customTopic: false, difficulty: "medium", questionType: "mcq", count: 10, duration: 20 });
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const generateTest = () => {
    setGenerating(true);
    setTimeout(() => {
      const pool = config.difficulty === "mixed"
        ? [...MOCK_QUESTIONS.easy, ...MOCK_QUESTIONS.medium, ...MOCK_QUESTIONS.hard]
        : MOCK_QUESTIONS[config.difficulty] || MOCK_QUESTIONS.medium;

      let filtered = pool;
      if (config.questionType === "mcq") filtered = pool.filter(q => q.type === "mcq");
      else if (config.questionType === "true_false") filtered = pool.filter(q => q.type === "true_false");

      if (filtered.length < config.count) filtered = pool;

      const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, config.count);
      setQuestions(shuffled);
      setAnswers({});
      setFlagged({});
      setCurrentQ(0);
      setStartTime(Date.now());
      setGenerating(false);
      setStep(4);
    }, 1800);
  };

  const finishTest = () => {
    setElapsed(startTime ? Math.floor((Date.now() - startTime) / 1000) : config.duration * 60);
    setStep(5);
  };

  const handleRetry = () => {
    setStep(1);
    setQuestions([]);
    setAnswers({});
    setFlagged({});
    setCurrentQ(0);
    setConfig(c => ({ ...c, topic: "", customTopic: false }));
  };

  const card = { background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6", marginBottom: 16 };
  const btn = (active) => ({ padding: "14px 18px", borderRadius: 14, border: `2px solid ${active ? "#f97316" : "#e5e7eb"}`, background: active ? "#fff7ed" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s" });
  const orangeBtn = (disabled) => ({ width: "100%", padding: 16, borderRadius: 14, border: "none", background: disabled ? "#d1d5db" : "#f97316", color: disabled ? "#9ca3af" : "#fff", fontWeight: 700, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: disabled ? "none" : "0 4px 12px rgba(249,115,22,0.3)", transition: "all 0.2s" });

  // STEP 1 — Topic
  const renderStep1 = () => (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1f2937", margin: "0 0 4px" }}>What do you want to test?</h2>
        <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Pick a course or enter your own topic</p>
      </div>

      {!config.customTopic && (
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Ic name="Book" size={16} /><span style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Select Course</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {COURSES.map(c => (
              <button key={c.id} onClick={() => setConfig(p => ({ ...p, courseId: c.id, courseName: c.name, topic: c.name }))}
                style={{ ...btn(config.courseId === c.id), display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: config.courseId === c.id ? "#f97316" : "#f3f4f6", color: config.courseId === c.id ? "#fff" : "#9ca3af", flexShrink: 0 }}>
                  <Ic name="Book" size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#1f2937" }}>{c.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{c.instructor}</p>
                </div>
                {config.courseId === c.id && <span style={{ color: "#f97316" }}><Ic name="Check" size={16} /></span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#374151", display: "flex", alignItems: "center", gap: 8 }}>
            <Ic name="Sparkles" size={16} />{config.customTopic ? "Custom Topic" : "Specific Subtopic (optional)"}
          </span>
          <button onClick={() => setConfig(p => ({ ...p, customTopic: !p.customTopic, topic: "", courseId: p.customTopic ? p.courseId : null }))}
            style={{ background: "none", border: "none", color: "#f97316", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
            {config.customTopic ? "← Pick from courses" : "Enter custom topic →"}
          </button>
        </div>
        <input type="text" value={config.topic} onChange={e => setConfig(p => ({ ...p, topic: e.target.value }))}
          placeholder={config.customTopic ? "e.g. Machine Learning, Calculus, Indian History..." : "e.g. React Hooks, Binary Trees, SQL Joins..."}
          style={{ width: "100%", padding: "12px 16px", border: `2px solid ${config.topic ? "#f97316" : "#e5e7eb"}`, borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border 0.2s" }} />
      </div>

      <button onClick={() => setStep(2)} disabled={!config.topic.trim()} style={orangeBtn(!config.topic.trim())}>
        Continue <Ic name="Arrow" size={18} />
      </button>
    </div>
  );

  // STEP 2 — Settings
  const renderStep2 = () => (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1f2937", margin: "0 0 4px" }}>Customise Your Test</h2>
        <p style={{ color: "#6b7280", fontSize: 13 }}>Set difficulty, type, questions & duration</p>
      </div>

      {/* Difficulty */}
      <div style={card}>
        <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Ic name="Target" size={16} />Difficulty Level</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {DIFFICULTIES.map(d => (
            <button key={d.value} onClick={() => setConfig(p => ({ ...p, difficulty: d.value }))}
              style={{ ...btn(config.difficulty === d.value), display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: d.dot === "bg-green-500" ? "#22c55e" : d.dot === "bg-yellow-500" ? "#eab308" : d.dot === "bg-red-500" ? "#ef4444" : "#a855f7", flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#1f2937" }}>{d.label}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{d.desc}</p>
              </div>
              {config.difficulty === d.value && <span style={{ color: "#f97316", marginLeft: "auto" }}><Ic name="Check" size={15} /></span>}
            </button>
          ))}
        </div>
      </div>

      {/* Question Type */}
      <div style={card}>
        <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Ic name="Layers" size={16} />Question Type</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {QUESTION_TYPES.map(qt => (
            <button key={qt.value} onClick={() => setConfig(p => ({ ...p, questionType: qt.value }))}
              style={{ ...btn(config.questionType === qt.value), textAlign: "center", padding: "16px 12px" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 12, color: config.questionType === qt.value ? "#f97316" : "#374151" }}>{qt.label}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>{qt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div style={card}>
        <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12 }}>Number of Questions</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {COUNTS.map(n => (
            <button key={n} onClick={() => setConfig(p => ({ ...p, count: n }))}
              style={{ width: 52, height: 52, borderRadius: 12, border: `2px solid ${config.count === n ? "#f97316" : "#e5e7eb"}`, background: config.count === n ? "#f97316" : "#fff", color: config.count === n ? "#fff" : "#374151", fontWeight: 900, fontSize: 17, cursor: "pointer", transition: "all 0.15s" }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div style={card}>
        <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Ic name="Clock" size={16} />Test Duration</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {DURATIONS.map(d => (
            <button key={d.value} onClick={() => setConfig(p => ({ ...p, duration: d.value }))}
              style={{ padding: "10px 16px", borderRadius: 12, border: `2px solid ${config.duration === d.value ? "#f97316" : "#e5e7eb"}`, background: config.duration === d.value ? "#f97316" : "#fff", color: config.duration === d.value ? "#fff" : "#374151", cursor: "pointer", transition: "all 0.15s" }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{d.label}</p>
              <p style={{ margin: 0, fontSize: 10, color: config.duration === d.value ? "rgba(255,255,255,0.8)" : "#9ca3af" }}>{d.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => setStep(1)} style={{ padding: "14px 20px", border: "2px solid #e5e7eb", borderRadius: 14, background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
          <Ic name="ChevLeft" size={18} /> Back
        </button>
        <button onClick={() => setStep(3)} style={{ ...orangeBtn(false), flex: 1 }}>
          Preview Test <Ic name="Arrow" size={18} />
        </button>
      </div>
    </div>
  );

  // STEP 3 — Review
  const renderStep3 = () => {
    const diff = DIFFICULTIES.find(d => d.value === config.difficulty);
    const qtype = QUESTION_TYPES.find(q => q.value === config.questionType);
    return (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1f2937", margin: "0 0 4px" }}>Ready to Generate?</h2>
          <p style={{ color: "#6b7280", fontSize: 13 }}>Review your test configuration</p>
        </div>

        <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
          <div style={{ background: "linear-gradient(135deg,#1e5a8e,#164266)", padding: "24px 28px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <Ic name="Brain" size={26} />
            </div>
            <div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>AI Mock Test</p>
              <p style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: 18 }}>{config.topic}</p>
            </div>
          </div>
          <div style={{ background: "#fff", padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { icon: "Target", label: "Difficulty", value: diff?.label, color: "#f97316" },
              { icon: "Layers", label: "Question Type", value: qtype?.label, color: "#3b82f6" },
              { icon: "Layers", label: "Questions", value: `${config.count} questions`, color: "#8b5cf6" },
              { icon: "Clock", label: "Duration", value: `${config.duration} minutes`, color: "#22c55e" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: "#f9fafb", borderRadius: 12 }}>
                <span style={{ color: item.color }}><Ic name={item.icon} size={18} /></span>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setStep(2)} disabled={generating} style={{ padding: "14px 20px", border: "2px solid #e5e7eb", borderRadius: 14, background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, opacity: generating ? 0.5 : 1 }}>
            <Ic name="ChevLeft" size={18} /> Back
          </button>
          <button onClick={generateTest} disabled={generating} style={{ ...orangeBtn(generating), flex: 1 }}>
            {generating ? (
              <><span style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> Generating your test...</>
            ) : (
              <><Ic name="Sparkles" size={18} /> Generate Test with AI</>
            )}
          </button>
        </div>
      </div>
    );
  };

  // STEP 4 — Take Test
  const renderStep4 = () => {
    const q = questions[currentQ];
    if (!q) return null;
    const answered = Object.keys(answers).length;
    const isFlagged = flagged[currentQ];
    const options = q.options || (q.type === "true_false" ? ["True", "False"] : []);
    const labels = ["A", "B", "C", "D"];

    return (
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Q {currentQ + 1} <span style={{ fontWeight: 400, color: "#9ca3af" }}>/ {questions.length}</span></span>
            <div style={{ width: 120, height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, height: "100%", background: "#f97316", borderRadius: 999, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{answered} answered</span>
          </div>
          <Timer totalSeconds={config.duration * 60} onTimeUp={finishTest} />
        </div>

        {/* Question */}
        <div style={{ ...card, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: "#fff7ed", color: "#f97316", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{currentQ + 1}</span>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1f2937", lineHeight: 1.6 }}>{q.question}</p>
            </div>
            <button onClick={() => setFlagged(p => ({ ...p, [currentQ]: !p[currentQ] }))}
              style={{ padding: 8, borderRadius: 10, border: "none", background: isFlagged ? "#fef9c3" : "#f9fafb", color: isFlagged ? "#ca8a04" : "#9ca3af", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}>
              <Ic name="Flag" size={16} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {options.map((opt, oi) => {
              const sel = answers[currentQ] === opt;
              return (
                <button key={oi} onClick={() => setAnswers(p => ({ ...p, [currentQ]: opt }))}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: `2px solid ${sel ? "#f97316" : "#e5e7eb"}`, background: sel ? "#fff7ed" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: sel ? "#f97316" : "#f3f4f6", color: sel ? "#fff" : "#6b7280", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {labels[oi] || oi + 1}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: sel ? "#ea580c" : "#374151", flex: 1 }}>{opt}</span>
                  {sel && <span style={{ color: "#f97316" }}><Ic name="Check" size={16} /></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigator */}
        <div style={{ ...card, padding: 20 }}>
          <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>Question Navigator</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)}
                style={{ width: 36, height: 36, borderRadius: 10, border: `2px solid ${i === currentQ ? "#f97316" : answers[i] !== undefined ? "#86efac" : flagged[i] ? "#fde68a" : "#e5e7eb"}`, background: i === currentQ ? "#f97316" : answers[i] !== undefined ? "#dcfce7" : flagged[i] ? "#fef9c3" : "#fff", color: i === currentQ ? "#fff" : answers[i] !== undefined ? "#15803d" : flagged[i] ? "#a16207" : "#6b7280", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.15s", boxShadow: i === currentQ ? "0 2px 8px rgba(249,115,22,0.4)" : "none" }}>
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[["#f97316", "#fff", "Current"], ["#dcfce7", "#86efac", "Answered"], ["#fef9c3", "#fde68a", "Flagged"]].map(([bg, border, label]) => (
              <span key={label} style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: bg, border: `1px solid ${border}`, display: "inline-block" }} /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}
            style={{ padding: "14px 20px", border: "2px solid #e5e7eb", borderRadius: 14, background: "#fff", color: "#374151", fontWeight: 600, cursor: currentQ === 0 ? "not-allowed" : "pointer", opacity: currentQ === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <Ic name="ChevLeft" size={18} /> Prev
          </button>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(p => p + 1)}
              style={{ flex: 1, padding: 14, border: "none", borderRadius: 14, background: "#1e5a8e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Next <Ic name="ChevRight" size={18} />
            </button>
          ) : (
            <button onClick={finishTest}
              style={{ flex: 1, padding: 14, border: "none", borderRadius: 14, background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}>
              <Ic name="Trophy" size={18} /> Submit Test
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} } * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1e5a8e,#164266)", padding: "24px 32px", marginBottom: 32 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 50, height: 50, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Ic name="Brain" size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: 24, fontWeight: 900 }}>TestGen</h1>
            <p style={{ margin: 0, color: "rgba(147,197,253,0.9)", fontSize: 13 }}>AI-powered mock test generator · personalised for you</p>
          </div>
          {step <= 3 && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              <span style={{ color: "#fdba74" }}><Ic name="Sparkles" size={16} /></span> Powered by AI
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 48px" }}>
        {step <= 4 && <StepIndicator current={step} />}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && <ResultScreen questions={questions} answers={answers} elapsed={elapsed} config={config} onRetry={handleRetry} onHome={handleRetry} />}
      </div>
    </div>
  );
}