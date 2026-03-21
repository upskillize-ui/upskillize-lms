// src/pages/Student/StudentAssignments.jsx
// Extracted from Dashboard.jsx + AiRev button added

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  Star,
  AlertCircle,
  Eye,
  Upload,
  X,
  Calendar,
  Award,
  ClipboardList,
  Zap,
} from "lucide-react";
import api from "../../services/api";

export default function StudentAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitForm, setSubmitForm] = useState({ notes: "", file: null });
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/student/assignments");
      if (res.data.success) setAssignments(res.data.assignments || []);
    } catch (e) {
      console.error("Error fetching assignments:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSubmitForm({ ...submitForm, file });
  };

  const handleSubmit = async () => {
    if (!submitForm.file && !submitForm.notes.trim()) {
      alert("Please add a file or notes before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("notes", submitForm.notes);
      if (submitForm.file) formData.append("file", submitForm.file);
      const res = await api.post(
        `/student/assignments/${selectedAssignment.id}/submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (res.data.success) {
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === selectedAssignment.id
              ? {
                  ...a,
                  status: "submitted",
                  submitted_at: new Date().toISOString(),
                }
              : a,
          ),
        );
        setShowSubmitModal(false);
        setSubmitForm({ notes: "", file: null });
        setSuccessMsg("Assignment submitted successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (e) {
      alert(
        e.response?.data?.message || "Submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status, dueDate) => {
    const isOverdue = new Date(dueDate) < new Date() && status === "pending";
    if (isOverdue) return { label: "Overdue", cls: "bg-red-100 text-red-800" };
    switch (status) {
      case "graded":
        return { label: "Graded", cls: "bg-purple-100 text-purple-800" };
      case "submitted":
        return { label: "Submitted", cls: "bg-blue-100 text-blue-800" };
      default:
        return { label: "Pending", cls: "bg-yellow-100 text-yellow-800" };
    }
  };

  const getDaysLeft = (dueDate) => {
    const diff = Math.ceil(
      (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24),
    );
    if (diff < 0)
      return { text: `${Math.abs(diff)}d overdue`, cls: "text-red-600" };
    if (diff === 0) return { text: "Due today", cls: "text-orange-600" };
    if (diff <= 3) return { text: `${diff}d left`, cls: "text-orange-500" };
    return { text: `${diff}d left`, cls: "text-green-600" };
  };

  const getMaxMarks = (a) =>
    a.max_marks ||
    (a.rubric?.categories?.length > 0
      ? a.rubric.categories.reduce((s, c) => s + (parseInt(c.points) || 0), 0)
      : a.total_marks);

  const filtered = assignments.filter((a) => {
    if (filter === "all") return true;
    if (filter === "overdue")
      return new Date(a.due_date) < new Date() && a.status === "pending";
    return a.status === filter;
  });

  const counts = {
    pending: assignments.filter(
      (a) => a.status === "pending" && new Date(a.due_date) >= new Date(),
    ).length,
    submitted: assignments.filter((a) => a.status === "submitted").length,
    graded: assignments.filter((a) => a.status === "graded").length,
    overdue: assignments.filter(
      (a) => a.status === "pending" && new Date(a.due_date) < new Date(),
    ).length,
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-3 rounded-xl font-semibold">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Pending",
            count: counts.pending,
            borderCls: "border-yellow-500",
            iconCls: "text-yellow-500",
            icon: Clock,
          },
          {
            label: "Submitted",
            count: counts.submitted,
            borderCls: "border-blue-500",
            iconCls: "text-blue-500",
            icon: CheckCircle,
          },
          {
            label: "Graded",
            count: counts.graded,
            borderCls: "border-purple-500",
            iconCls: "text-purple-500",
            icon: Star,
          },
          {
            label: "Overdue",
            count: counts.overdue,
            borderCls: "border-red-500",
            iconCls: "text-red-500",
            icon: AlertCircle,
          },
        ].map(({ label, count, borderCls, iconCls, icon: Icon }) => (
          <div
            key={label}
            className={`bg-white p-5 rounded-xl shadow-md border-l-4 ${borderCls}`}
          >
            <Icon className={`h-8 w-8 ${iconCls} mb-2`} />
            <p className="text-2xl font-bold text-gray-800">{count}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs + AiRev Button ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "pending", "submitted", "graded", "overdue"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              filter === f
                ? "bg-orange-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {f}
            {f !== "all" && counts[f] !== undefined ? ` (${counts[f]})` : ""}
          </button>
        ))}

        {/* ── AiRev Button ── */}
        <button
          onClick={() => navigate("/student/case-study")}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e3a5f] to-[#2c5aa0] hover:from-[#164266] hover:to-[#1e5a8e] text-white rounded-lg text-sm font-semibold shadow transition-all"
        >
          <Zap size={15} />
          AiRev
        </button>
      </div>

      {/* ── Assignment Cards ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No {filter} assignments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((assignment) => {
            const badge = getStatusBadge(
              assignment.status,
              assignment.due_date,
            );
            const daysLeft = getDaysLeft(assignment.due_date);
            const maxM = getMaxMarks(assignment);
            const scorePercent =
              maxM > 0 && assignment.grade != null
                ? Math.round((assignment.grade / maxM) * 100)
                : null;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        {assignment.course_name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {assignment.description}
                    </p>
                  </div>
                  {assignment.status === "graded" && scorePercent !== null && (
                    <div
                      className={`ml-4 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-4 ${
                        scorePercent >= 80
                          ? "border-green-500 text-green-700 bg-green-50"
                          : scorePercent >= 60
                            ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                            : "border-red-400 text-red-700 bg-red-50"
                      }`}
                    >
                      {scorePercent}%
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Due:{" "}
                    {new Date(assignment.due_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`flex items-center gap-1 font-semibold ${daysLeft.cls}`}
                  >
                    <Clock size={14} /> {daysLeft.text}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} /> {assignment.total_marks} marks
                  </span>
                  {assignment.status === "graded" && (
                    <span className="flex items-center gap-1 font-semibold text-purple-700">
                      <Award size={14} /> Score:{" "}
                      {assignment.grade != null
                        ? `${assignment.grade}/${maxM}`
                        : "Awaiting grade"}
                    </span>
                  )}
                </div>

                {assignment.rubric?.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {assignment.rubric.categories.map((cat, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {cat.name}: {cat.points}pts
                      </span>
                    ))}
                  </div>
                )}

                {assignment.status === "graded" && assignment.feedback && (
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-purple-800 mb-1">
                      Faculty Feedback
                    </p>
                    <p className="text-sm text-gray-700">
                      {assignment.feedback}
                    </p>
                  </div>
                )}

                {assignment.status === "submitted" &&
                  assignment.submitted_at && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg mb-4">
                      <p className="text-xs font-semibold text-blue-800">
                        ✅ Submitted on{" "}
                        {new Date(assignment.submitted_at).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>
                  )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setShowDetailsModal(true);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-1 transition"
                  >
                    <Eye size={15} /> View Details
                  </button>
                  {assignment.status === "pending" && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmitModal(true);
                      }}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition"
                    >
                      <Upload size={15} /> Submit Assignment
                    </button>
                  )}
                  {assignment.status === "submitted" && (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center gap-1">
                      <CheckCircle size={15} /> Submitted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Details Modal ── */}
      {showDetailsModal &&
        selectedAssignment &&
        (() => {
          const modalMaxM = getMaxMarks(selectedAssignment);
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Assignment Details
                  </h3>
                  <button onClick={() => setShowDetailsModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Course
                    </p>
                    <p className="font-semibold text-gray-800">
                      {selectedAssignment.course_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Title
                    </p>
                    <p className="font-bold text-lg text-gray-900">
                      {selectedAssignment.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Description
                    </p>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {selectedAssignment.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Due Date</p>
                      <p className="font-semibold">
                        {new Date(
                          selectedAssignment.due_date,
                        ).toLocaleDateString("en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Total Marks</p>
                      <p className="font-semibold">
                        {selectedAssignment.total_marks}
                      </p>
                    </div>
                  </div>
                  {selectedAssignment.rubric?.categories?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                        Grading Rubric
                      </p>
                      <div className="space-y-2">
                        {selectedAssignment.rubric.categories.map((cat, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-blue-50 p-3 rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {cat.name}
                            </span>
                            <span className="text-sm font-bold text-blue-700">
                              {cat.points} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedAssignment.status === "graded" && (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                        Grade & Feedback
                      </p>
                      {selectedAssignment.grade != null ? (
                        <p className="text-2xl font-bold text-purple-700 mb-2">
                          {selectedAssignment.grade}/{modalMaxM}
                          <span className="text-base ml-2 text-purple-500">
                            (
                            {Math.round(
                              (selectedAssignment.grade / modalMaxM) * 100,
                            )}
                            %)
                          </span>
                        </p>
                      ) : (
                        <p className="text-base font-semibold text-purple-400 mb-2">
                          Grade not yet recorded
                        </p>
                      )}
                      {selectedAssignment.feedback && (
                        <p className="text-sm text-gray-700">
                          {selectedAssignment.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}

      {/* ── Submit Modal ── */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Submit Assignment
              </h3>
              <button onClick={() => setShowSubmitModal(false)}>
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg">
              <strong>{selectedAssignment.title}</strong> – Due:{" "}
              {new Date(selectedAssignment.due_date).toLocaleDateString()}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Upload your assignment file (PDF, DOC, ZIP)
                  </p>
                  <input
                    type="file"
                    id="assign-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.zip,.txt,.ppt,.pptx"
                  />
                  <label
                    htmlFor="assign-upload"
                    className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 text-sm font-semibold transition"
                  >
                    Choose File
                  </label>
                  {submitForm.file && (
                    <p className="text-sm text-green-600 mt-2 font-semibold">
                      ✅ {submitForm.file.name}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes / Comments{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={submitForm.notes}
                  onChange={(e) =>
                    setSubmitForm({ ...submitForm, notes: e.target.value })
                  }
                  rows={4}
                  placeholder="Add any notes for your faculty..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />{" "}
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Submit Assignment
                  </>
                )}
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
