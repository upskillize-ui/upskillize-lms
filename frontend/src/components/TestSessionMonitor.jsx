import { useState, useEffect } from "react";
import api from "../services/api";
import TestSessionMonitor from "../components/TestSessionMonitor"; // ✅ ADD THIS IMPORT

/**
 * TestGen.jsx - Updated with Test Session Management
 *
 * NEW FEATURES:
 * ✅ TestSessionMonitor component - shows real-time test capacity
 * ✅ handleGenerateTest function - manages session slots, rate limits
 * ✅ Proper error handling for slot exhaustion and rate limits
 */

export default function TestGen() {
  const [phase, setPhase] = useState("setup"); // setup | test | result
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState(null); // For displaying available slots

  // Setup form state
  const [enrollments, setEnrollments] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [duration, setDuration] = useState(15);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionTypes, setQuestionTypes] = useState(["mcq"]);

  // Test and result state
  const [testData, setTestData] = useState(null);
  const [result, setResult] = useState(null);

  // Fetch enrollments on mount
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await api.get("/enrollments/my-enrollments");
        setEnrollments(response.data.enrollments || []);
      } catch (error) {
        console.error("Failed to fetch enrollments:", error);
        setError("Failed to load your courses");
      }
    };
    fetchEnrollments();
  }, []);

  // Fetch modules when course is selected
  useEffect(() => {
    if (!selectedCourse) {
      setModules([]);
      return;
    }

    const fetchModules = async () => {
      try {
        const response = await api.get(`/modules/course/${selectedCourse.id}`);
        setModules(response.data.modules || []);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
        setModules([]);
      }
    };

    fetchModules();
  }, [selectedCourse]);

  // Refresh available slots every 30 seconds
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await api.get("/test-sessions/stats");
        if (response.data?.data) {
          setSlots(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
      }
    };

    fetchSlots();
    const interval = setInterval(fetchSlots, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ NEW: handleGenerateTest with session management
  const handleGenerateTest = async () => {
    // Validation
    if (!selectedCourse) {
      setError("Please select a course.");
      return;
    }
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    if (!questionTypes.length) {
      setError("Select at least one question type.");
      return;
    }
    if (topic.length > 200) {
      setError("Topic must be under 200 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Step 1: Check rate limit
      console.log("📊 Checking rate limit...");
      const rateLimitRes = await api.post("/test-sessions/check-rate-limit");

      if (!rateLimitRes.data.success) {
        setError(`⏱️ ${rateLimitRes.data.message}`);
        return;
      }

      // Step 2: Try to acquire a test slot
      console.log("🎟️ Acquiring test slot...");
      const acquireRes = await api.post("/test-sessions/acquire");

      if (!acquireRes.data.success) {
        setError(`❌ ${acquireRes.data.message}`);
        return;
      }

      // Step 3: Record the generation (for rate limiting)
      console.log("📝 Recording generation...");
      await api.post("/test-sessions/record-generation");

      // Step 4: Generate the test
      console.log("⚡ Generating test...");
      const generateRes = await api.post("/testgen/generate", {
        courseId: selectedCourse.id,
        lectureId: selectedLesson?.id || null,
        topic,
        numQuestions,
        durationMinutes: duration,
        difficulty,
        questionTypes,
      });

      if (generateRes.data) {
        setTestData(generateRes.data);
        setPhase("test");
      }
    } catch (error) {
      console.error("❌ Error in test generation:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate test";

      if (error.response?.status === 429) {
        setError(`⏱️ Rate limited: ${errorMessage}`);
      } else if (error.response?.status === 503) {
        setError(`❌ All test slots are full. Please try again later.`);
      } else {
        setError(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit test answers
  const handleSubmitTest = async (answers, timeTaken) => {
    try {
      setSubmitting(true);
      setError("");

      const submitRes = await api.post("/testgen/submit", {
        testId: testData.test_id,
        questions: testData.questions,
        answers,
        timeTakenSeconds: timeTaken,
      });

      if (submitRes.data) {
        setResult(submitRes.data);
        setPhase("result");
      }
    } catch (error) {
      console.error("Failed to submit test:", error);
      setError(error.response?.data?.message || "Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset to setup
  const handleRetry = () => {
    setPhase("setup");
    setTestData(null);
    setResult(null);
    setError("");
    setTopic("");
    setSelectedCourse(null);
    setSelectedLesson(null);
  };

  // Toggle question type
  const toggleQuestionType = (type) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BrainDrill</h1>
          <p className="text-gray-600">
            AI-powered mock tests from your course material
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Setup Phase */}
        {phase === "setup" && (
          <div className="space-y-6">
            {/* ✅ ADD: TestSessionMonitor Component */}
            <TestSessionMonitor />

            {/* Course Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Step 1: Select Your Course
              </h2>
              {enrollments.length === 0 ? (
                <p className="text-gray-600">
                  No courses found. Please enroll in a course first.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrollments.map((enrollment) => (
                    <button
                      key={enrollment.course_id}
                      onClick={() => {
                        setSelectedCourse({
                          id: enrollment.course_id,
                          name: enrollment.Course?.course_name || "Course",
                        });
                        setTopic(enrollment.Course?.course_name || "");
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedCourse?.id === enrollment.course_id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎓</span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {enrollment.Course?.course_name || "Course"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Click to select
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lesson Selection (if course selected) */}
            {selectedCourse && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Step 2: Select a Lesson (Optional)
                </h2>
                {modules.length === 0 ? (
                  <p className="text-gray-600">
                    No lessons available. Will test entire course.
                  </p>
                ) : (
                  <select
                    value={selectedLesson?.id || ""}
                    onChange={(e) => {
                      const lessonId = e.target.value;
                      if (lessonId) {
                        const lesson = modules
                          .flatMap((m) => m.Lessons || [])
                          .find((l) => l.id === parseInt(lessonId));
                        setSelectedLesson(lesson);
                        setTopic(lesson?.lesson_name || "");
                      } else {
                        setSelectedLesson(null);
                        setTopic(selectedCourse.name);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">— Entire Course —</option>
                    {modules.map((module) => (
                      <optgroup key={module.id} label={module.module_name}>
                        {(module.Lessons || []).map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.lesson_name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Topic */}
            {selectedCourse && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Step 3: Topic
                </h2>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter the topic for your test"
                  maxLength={200}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-2">
                  {topic.length}/200 characters
                </p>
              </div>
            )}

            {/* Test Configuration */}
            {selectedCourse && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Step 4: Test Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Number of Questions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <select
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      {[5, 10, 15, 20, 25, 30].map((n) => (
                        <option key={n} value={n}>
                          {n} questions
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      {[5, 10, 15, 20, 30, 45, 60].map((n) => (
                        <option key={n} value={n}>
                          {n} minutes
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="complex">Complex</option>
                    </select>
                  </div>
                </div>

                {/* Question Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Question Types
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: "mcq", label: "Multiple Choice (MCQ)" },
                      { id: "msq", label: "Multi-Select Questions" },
                      { id: "true_false", label: "True/False" },
                    ].map((type) => (
                      <label key={type.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={questionTypes.includes(type.id)}
                          onChange={() => toggleQuestionType(type.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ✅ UPDATED: Generate Test Button with handleGenerateTest */}
            {selectedCourse && (
              <button
                onClick={handleGenerateTest}
                disabled={
                  loading || !selectedCourse || slots?.availableSlots === 0
                }
                className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all ${
                  loading || !selectedCourse || slots?.availableSlots === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Generating with AI...
                  </span>
                ) : slots?.availableSlots === 0 ? (
                  "⏳ All slots full — please wait"
                ) : (
                  "⚡ Generate Test"
                )}
              </button>
            )}
          </div>
        )}

        {/* Test Phase */}
        {phase === "test" && testData && (
          <TestScreen
            testData={testData}
            onSubmit={handleSubmitTest}
            submitting={submitting}
          />
        )}

        {/* Result Phase */}
        {phase === "result" && result && (
          <ResultScreen result={result} onRetry={handleRetry} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TEST SCREEN COMPONENT
// ============================================================================

function TestScreen({ testData, onSubmit, submitting }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(testData.duration_minutes * 60);
  const [startTime] = useState(Date.now());

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    onSubmit(answers, timeTaken);
  };

  const questions = testData.questions || [];
  const currentQ = questions[currentQuestion];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSelectAnswer = (questionId, optionKey) => {
    const question = questions.find((q) => q.id === questionId);
    if (question.type === "msq") {
      // Multi-select: toggle
      const current = answers[questionId] || [];
      setAnswers({
        ...answers,
        [questionId]: current.includes(optionKey)
          ? current.filter((k) => k !== optionKey)
          : [...current, optionKey],
      });
    } else {
      // Single select
      setAnswers({
        ...answers,
        [questionId]: [optionKey],
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Test Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Question {currentQuestion + 1} of {questions.length}
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-600 text-sm">Time Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question */}
      {currentQ && (
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <p className="text-xl text-gray-900 mb-6 leading-relaxed">
            {currentQ.question}
          </p>

          {currentQ.type === "msq" && (
            <p className="text-sm text-blue-600 font-medium mb-4">
              ✓ Select all that apply
            </p>
          )}

          {/* Options */}
          <div className="space-y-3">
            {Object.entries(currentQ.options || {}).map(([key, value]) => {
              const isSelected = (answers[currentQ.id] || []).includes(key);
              return (
                <button
                  key={key}
                  onClick={() => handleSelectAnswer(currentQ.id, key)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-start gap-4 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-white font-bold">✓</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium block mb-1">
                      {key.toUpperCase()}
                    </span>
                    <p className="text-gray-700">{value}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation & Submit */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium disabled:opacity-50"
        >
          ← Previous
        </button>

        <button
          onClick={() =>
            setCurrentQuestion(
              Math.min(questions.length - 1, currentQuestion + 1),
            )
          }
          disabled={currentQuestion === questions.length - 1}
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium disabled:opacity-50"
        >
          Next →
        </button>

        {currentQuestion === questions.length - 1 && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// RESULT SCREEN COMPONENT
// ============================================================================

function ResultScreen({ result, onRetry }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score Card */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Test Complete! 🎉
          </h2>
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {result.score}/{result.total}
          </div>
          <p className="text-2xl text-gray-700">{result.percentage}% Correct</p>
          <p className="text-gray-600 mt-2">
            Performance Band: <strong>{result.performance_band}</strong>
          </p>
        </div>

        {/* Feedback */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">Feedback</h3>
          <p className="text-blue-800">{result.overall_feedback}</p>
        </div>

        {/* Study Recommendations */}
        {result.study_recommendations?.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-green-900 mb-3">
              Study Recommendations
            </h3>
            <ul className="list-disc list-inside space-y-2">
              {result.study_recommendations.map((rec, idx) => (
                <li key={idx} className="text-green-800">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detailed Results */}
      {result.results && result.results.length > 0 && (
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Detailed Results
          </h3>
          <div className="space-y-4">
            {result.results.map((r, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  r.is_correct
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    Question {idx + 1}
                  </h4>
                  <span
                    className={`text-sm font-bold ${
                      r.is_correct ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {r.is_correct ? "✓ Correct" : "✗ Wrong"}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{r.feedback}</p>
                {!r.is_correct && (
                  <p className="text-sm text-gray-600">
                    <strong>Correct Answer:</strong>{" "}
                    {r.correct_answer?.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retry Button */}
      <button
        onClick={onRetry}
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700"
      >
        🔄 Take Another Test
      </button>
    </div>
  );
}
