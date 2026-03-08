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
  { value: "easy",   label: "Easy",   dotColor: "#22c55e", desc: "Basic concepts & definitions" },
  { value: "medium", label: "Medium", dotColor: "#eab308", desc: "Applied knowledge & analysis" },
  { value: "hard",   label: "Hard",   dotColor: "#ef4444", desc: "Advanced problems & reasoning" },
  { value: "mixed",  label: "Mixed",  dotColor: "#a855f7", desc: "All levels combined" },
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

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ["Topic", "Settings", "Review", "Test"];
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${done   ? 'bg-orange-500 border-orange-500 text-white'
                : active ? 'bg-white border-orange-500 text-orange-500 shadow-md'
                :          'bg-white border-gray-300 text-gray-400'}`}>
                {done ? '✓' : idx}
              </div>
              <span className={`text-xs mt-1 font-semibold
                ${active ? 'text-orange-500' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 mb-4 transition-all ${done ? 'bg-orange-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── COUNTDOWN TIMER ─────────────────────────────────────────────────────────
function CountdownTimer({ totalSeconds, onTimeUp }) {
  const [rem, setRem] = useState(totalSeconds);
  const ref = useRef();
  useEffect(() => {
    ref.current = setInterval(() => {
      setRem(p => {
        if (p <= 1) { clearInterval(ref.current); onTimeUp(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);
  const mins = Math.floor(rem / 60), secs = rem % 60;
  const pct  = (rem / totalSeconds) * 100;
  const urgent = rem < 60;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-bold text-base transition-all
      ${urgent ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-orange-300 bg-orange-50 text-orange-600'}`}>
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</span>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-red-500' : 'bg-orange-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────
function ResultScreen({ questions, answers, elapsed, config, onRetry, onHome }) {
  const score  = questions.filter((q, i) => answers[i] === q.correct_answer).length;
  const total  = questions.length;
  const pct    = Math.round((score / total) * 100);
  const passed = pct >= 60;
  const grade  = pct >= 90 ? { l:'A+', c:'text-green-600', bg:'bg-green-50' }
               : pct >= 80 ? { l:'A',  c:'text-green-500', bg:'bg-green-50' }
               : pct >= 70 ? { l:'B',  c:'text-blue-600',  bg:'bg-blue-50'  }
               : pct >= 60 ? { l:'C',  c:'text-yellow-600',bg:'bg-yellow-50'}
               :              { l:'F',  c:'text-red-600',   bg:'bg-red-50'   };
  const mins = Math.floor(elapsed / 60), secs = elapsed % 60;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Hero */}
      <div className={`rounded-2xl p-8 text-center border-2 ${passed ? 'border-green-200 bg-gradient-to-br from-green-50 to-white' : 'border-red-200 bg-gradient-to-br from-red-50 to-white'}`}>
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl font-black mb-4 ${grade.bg} ${grade.c}`}>
          {grade.l}
        </div>
        <h2 className={`text-3xl font-black mb-1 ${passed ? 'text-green-700' : 'text-red-600'}`}>
          {passed ? '🎉 Test Passed!' : '😓 Keep Practising'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">{config.topic} · {config.difficulty} · {config.questionType}</p>
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[
            { label:'Score',    value:`${score}/${total}`, color:'text-orange-500' },
            { label:'Accuracy', value:`${pct}%`,           color:'text-blue-500'   },
            { label:'Time',     value:`${mins}m ${secs}s`, color:'text-purple-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer Review */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="font-bold text-gray-800 text-sm">Answer Review</span>
          <span className="text-xs text-gray-400">{score} correct · {total - score} wrong</span>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
          {questions.map((q, i) => {
            const ok = answers[i] === q.correct_answer;
            return (
              <div key={i} className={`px-5 py-3 ${ok ? 'bg-green-50/40' : 'bg-red-50/40'}`}>
                <div className="flex gap-3">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 text-xs font-bold
                    ${ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                    {ok ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Q{i+1}. {q.question}</p>
                    {!ok && (
                      <div>
                        <p className="text-xs text-red-500">Your answer: <b>{answers[i] ?? 'Not answered'}</b></p>
                        <p className="text-xs text-green-600">Correct: <b>{q.correct_answer}</b></p>
                      </div>
                    )}
                    {q.explanation && <p className="text-xs text-gray-400 mt-1 italic">💡 {q.explanation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onHome}
          className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2">
          ← Back to Dashboard
        </button>
        <button onClick={onRetry}
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition shadow-md text-sm flex items-center justify-center gap-2">
          ↺ Try Again
        </button>
      </div>
    </div>
  );
}

// ─── MAIN TESTGEN COMPONENT ───────────────────────────────────────────────────
export default function TestGen() {
  const [step, setStep]         = useState(1);
  const [config, setConfig]     = useState({ courseId: null, courseName: '', topic: '', customTopic: false, difficulty: 'medium', questionType: 'mcq', count: 10, duration: 20 });
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions]   = useState([]);
  const [currentQ, setCurrentQ]     = useState(0);
  const [answers, setAnswers]       = useState({});
  const [flagged, setFlagged]       = useState({});
  const [startTime, setStartTime]   = useState(null);
  const [elapsed, setElapsed]       = useState(0);

  const generateTest = () => {
    setGenerating(true);
    setTimeout(() => {
      const pool = config.difficulty === 'mixed'
        ? [...MOCK_QUESTIONS.easy, ...MOCK_QUESTIONS.medium, ...MOCK_QUESTIONS.hard]
        : MOCK_QUESTIONS[config.difficulty] || MOCK_QUESTIONS.medium;
      let filtered = pool;
      if (config.questionType === 'mcq')        filtered = pool.filter(q => q.type === 'mcq');
      else if (config.questionType === 'true_false') filtered = pool.filter(q => q.type === 'true_false');
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
    setConfig(c => ({ ...c, topic: '', customTopic: false }));
  };

  // shared card style
  const card = "bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4";
  const selBtn = (active) =>
    `p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${active ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/40'}`;

  // ── STEP 1 ── Topic
  const renderStep1 = () => (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-gray-800 mb-1">What do you want to test?</h2>
        <p className="text-gray-500 text-sm">Pick a course or enter your own topic</p>
      </div>

      {!config.customTopic && (
        <div className={card}>
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>📚</span> Select Course
          </p>
          <div className="space-y-2">
            {COURSES.map(c => (
              <button key={c.id} onClick={() => setConfig(p => ({ ...p, courseId: c.id, courseName: c.name, topic: c.name }))}
                className={`w-full flex items-center gap-3 ${selBtn(config.courseId === c.id)}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm
                  ${config.courseId === c.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>📖</div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.instructor}</p>
                </div>
                {config.courseId === c.id && <span className="text-orange-500 font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <span>✨</span>{config.customTopic ? 'Custom Topic' : 'Specific Subtopic (optional)'}
          </span>
          <button onClick={() => setConfig(p => ({ ...p, customTopic: !p.customTopic, topic: '', courseId: null }))}
            className="text-xs text-orange-500 font-bold underline cursor-pointer bg-transparent border-none">
            {config.customTopic ? '← Pick from courses' : 'Enter custom topic →'}
          </button>
        </div>
        <input
          type="text"
          value={config.topic}
          onChange={e => setConfig(p => ({ ...p, topic: e.target.value }))}
          placeholder={config.customTopic ? 'e.g. Machine Learning, Calculus...' : 'e.g. React Hooks, SQL Joins...'}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors"
        />
      </div>

      <button onClick={() => setStep(2)} disabled={!config.topic.trim()}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2">
        Continue →
      </button>
    </div>
  );

  // ── STEP 2 ── Settings
  const renderStep2 = () => (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-gray-800 mb-1">Customise Your Test</h2>
        <p className="text-gray-500 text-sm">Set difficulty, type, questions & duration</p>
      </div>

      {/* Difficulty */}
      <div className={card}>
        <p className="text-sm font-bold text-gray-700 mb-3">🎯 Difficulty Level</p>
        <div className="grid grid-cols-2 gap-3">
          {DIFFICULTIES.map(d => (
            <button key={d.value} onClick={() => setConfig(p => ({ ...p, difficulty: d.value }))}
              className={`flex items-center gap-3 ${selBtn(config.difficulty === d.value)}`}>
              <span style={{ width:12, height:12, borderRadius:'50%', background: d.dotColor, flexShrink:0, display:'inline-block' }} />
              <div className="text-left">
                <p className="font-bold text-sm text-gray-800">{d.label}</p>
                <p className="text-xs text-gray-400">{d.desc}</p>
              </div>
              {config.difficulty === d.value && <span className="ml-auto text-orange-500 font-bold text-sm">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Question Type */}
      <div className={card}>
        <p className="text-sm font-bold text-gray-700 mb-3">📋 Question Type</p>
        <div className="grid grid-cols-3 gap-3">
          {QUESTION_TYPES.map(qt => (
            <button key={qt.value} onClick={() => setConfig(p => ({ ...p, questionType: qt.value }))}
              className={`text-center ${selBtn(config.questionType === qt.value)}`}>
              <p className={`font-bold text-xs mb-1 ${config.questionType === qt.value ? 'text-orange-500' : 'text-gray-800'}`}>{qt.label}</p>
              <p className="text-xs text-gray-400">{qt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className={card}>
        <p className="text-sm font-bold text-gray-700 mb-3">🔢 Number of Questions</p>
        <div className="flex gap-2 flex-wrap">
          {COUNTS.map(n => (
            <button key={n} onClick={() => setConfig(p => ({ ...p, count: n }))}
              className={`w-12 h-12 rounded-xl border-2 font-black text-base transition-all
                ${config.count === n ? 'border-orange-500 bg-orange-500 text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className={card}>
        <p className="text-sm font-bold text-gray-700 mb-3">⏱️ Test Duration</p>
        <div className="flex gap-2 flex-wrap">
          {DURATIONS.map(d => (
            <button key={d.value} onClick={() => setConfig(p => ({ ...p, duration: d.value }))}
              className={`flex flex-col items-center px-4 py-2.5 rounded-xl border-2 transition-all min-w-[72px]
                ${config.duration === d.value ? 'border-orange-500 bg-orange-500 text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
              <span className="font-black text-sm">{d.label}</span>
              <span className={`text-xs mt-0.5 ${config.duration === d.value ? 'text-orange-100' : 'text-gray-400'}`}>{d.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(1)}
          className="px-5 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-sm flex items-center gap-2">
          ← Back
        </button>
        <button onClick={() => setStep(3)}
          className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2">
          Preview Test →
        </button>
      </div>
    </div>
  );

  // ── STEP 3 ── Review
  const renderStep3 = () => {
    const diff  = DIFFICULTIES.find(d => d.value === config.difficulty);
    const qtype = QUESTION_TYPES.find(q => q.value === config.questionType);
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-800 mb-1">Ready to Generate?</h2>
          <p className="text-gray-500 text-sm">Review your test configuration</p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg mb-5">
          <div className="px-6 py-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg,#1e5a8e,#164266)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background:'rgba(255,255,255,0.2)' }}>🧠</div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider">AI Mock Test</p>
              <p className="text-white font-black text-lg">{config.topic}</p>
            </div>
          </div>
          <div className="bg-white p-5 grid grid-cols-2 gap-3">
            {[
              { emoji:'🎯', label:'Difficulty',    value: diff?.label },
              { emoji:'📋', label:'Question Type', value: qtype?.label },
              { emoji:'🔢', label:'Questions',     value: `${config.count} questions` },
              { emoji:'⏱️', label:'Duration',      value: `${config.duration} minutes` },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-bold text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep(2)} disabled={generating}
            className="px-5 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-sm disabled:opacity-50 flex items-center gap-2">
            ← Back
          </button>
          <button onClick={generateTest} disabled={generating}
            className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2">
            {generating ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                Generating your test...
              </>
            ) : '✨ Generate Test with AI'}
          </button>
        </div>
      </div>
    );
  };

  // ── STEP 4 ── Take Test
  const renderStep4 = () => {
    const q = questions[currentQ];
    if (!q) return null;
    const answered  = Object.keys(answers).length;
    const isFlagged = flagged[currentQ];
    const options   = q.options || (q.type === 'true_false' ? ['True', 'False'] : []);
    const labels    = ['A', 'B', 'C', 'D'];

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Top bar */}
        <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">
              Q {currentQ+1} <span className="text-gray-400 font-normal">/ {questions.length}</span>
            </span>
            <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width:`${((currentQ+1)/questions.length)*100}%` }} />
            </div>
            <span className="text-xs text-gray-400">{answered} answered</span>
          </div>
          <CountdownTimer totalSeconds={config.duration * 60} onTimeUp={finishTest} />
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex gap-3 items-start">
              <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                {currentQ+1}
              </span>
              <p className="text-base font-semibold text-gray-800 leading-relaxed">{q.question}</p>
            </div>
            <button onClick={() => setFlagged(p => ({ ...p, [currentQ]: !p[currentQ] }))}
              className={`p-2 rounded-lg border-none transition flex-shrink-0 cursor-pointer
                ${isFlagged ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
              🚩
            </button>
          </div>

          <div className="space-y-3">
            {options.map((opt, oi) => {
              const sel = answers[currentQ] === opt;
              return (
                <button key={oi} onClick={() => setAnswers(p => ({ ...p, [currentQ]: opt }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer
                    ${sel ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/40'}`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0
                    ${sel ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {labels[oi] || oi+1}
                  </span>
                  <span className={`text-sm font-medium flex-1 ${sel ? 'text-orange-700' : 'text-gray-700'}`}>{opt}</span>
                  {sel && <span className="text-orange-500 font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)}
                className={`w-9 h-9 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer
                  ${i === currentQ          ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                  : answers[i] !== undefined ? 'bg-green-100 border-green-300 text-green-700'
                  : flagged[i]              ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                  :                           'border-gray-200 text-gray-500 hover:border-orange-300'}`}>
                {i+1}
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            {[['bg-orange-500','text-white','Current'],['bg-green-100','text-green-700','Answered'],['bg-yellow-100','text-yellow-700','Flagged']].map(([bg,tc,lbl]) => (
              <span key={lbl} className="text-xs text-gray-400 flex items-center gap-1">
                <span className={`w-3 h-3 rounded ${bg} inline-block`} /> {lbl}
              </span>
            ))}
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          <button onClick={() => setCurrentQ(p => Math.max(0, p-1))} disabled={currentQ === 0}
            className="px-5 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition text-sm flex items-center gap-2">
            ← Prev
          </button>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(p => p+1)}
              className="flex-1 py-3 rounded-xl text-white font-bold transition text-sm flex items-center justify-center gap-2"
              style={{ background:'#1e5a8e' }}>
              Next →
            </button>
          ) : (
            <button onClick={finishTest}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition shadow-md text-sm flex items-center justify-center gap-2">
              🏆 Submit Test
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full">
      {/* Page Header — matches dashboard style */}
      <div className="rounded-2xl px-7 py-5 mb-7 shadow-lg flex items-center justify-between"
        style={{ background:'linear-gradient(135deg,#1e5a8e,#164266)' }}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
            style={{ background:'rgba(255,255,255,0.2)' }}>🧠</div>
          <div>
            <h1 className="text-xl font-black text-white">TestGen</h1>
            <p className="text-blue-200 text-xs">AI-powered mock test generator · personalised for you</p>
          </div>
        </div>
        {step <= 3 && (
          <span className="text-white/60 text-xs flex items-center gap-1">✨ Powered by AI</span>
        )}
      </div>

      {/* Step indicator */}
      {step <= 4 && <StepIndicator current={step} />}

      {/* Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && (
        <ResultScreen
          questions={questions}
          answers={answers}
          elapsed={elapsed}
          config={config}
          onRetry={handleRetry}
          onHome={handleRetry}
        />
      )}
    </div>
  );
}