// /**
//  * CaseStudyReview.jsx — Student Case Study Submission & AI Feedback Page
//  *
//  * Matches Upskillize LMS branding (dark blue + orange + white)
//  * Route: /student/case-study
//  *
//  * Screens:
//  * 1. Case Study List — shows all assigned case studies
//  * 2. Case Study Detail — read case study + submit answer
//  * 3. AI Feedback — detailed review with scores, rubric, recommendations
//  * 4. My Progress — all case studies with current + best scores
//  */

// import { useState, useEffect, useRef } from "react";
// import api from "../../services/api";

// // ============================================================================
// // UPSKILLIZE DESIGN TOKENS
// // ============================================================================
// const C = {
//   darkBlue: "#1e3a5f",
//   mediumBlue: "#2c5aa0",
//   lightBlue: "#4a7ba7",
//   orange: "#FF8C00",
//   orangeLight: "#FF9500",
//   orangeHover: "#e67e00",
//   teal: "#00796B",
//   bgLight: "#f5f7fa",
//   bgWhite: "#ffffff",
//   textDark: "#1a1a1a",
//   textGray: "#666666",
//   textMuted: "#999999",
//   success: "#16a34a",
//   warning: "#d97706",
//   danger: "#dc2626",
//   border: "#e5e7eb",
// };

// // ============================================================================
// // HELPER COMPONENTS
// // ============================================================================

// const Badge = ({ children, color = C.mediumBlue, bg }) => (
//   <span
//     style={{
//       fontSize: 11,
//       fontWeight: 700,
//       padding: "3px 12px",
//       borderRadius: 20,
//       background: bg || `${color}15`,
//       color,
//       border: `1px solid ${color}30`,
//       display: "inline-block",
//     }}
//   >
//     {children}
//   </span>
// );

// const Card = ({ children, style = {} }) => (
//   <div
//     style={{
//       background: C.bgWhite,
//       borderRadius: 14,
//       padding: 24,
//       boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
//       border: `1px solid ${C.border}`,
//       ...style,
//     }}
//   >
//     {children}
//   </div>
// );

// const Button = ({
//   children,
//   onClick,
//   variant = "primary",
//   disabled,
//   style = {},
// }) => {
//   const styles = {
//     primary: { background: C.orange, color: "#fff", border: "none" },
//     secondary: {
//       background: C.bgLight,
//       color: C.textDark,
//       border: `1px solid ${C.border}`,
//     },
//     danger: { background: C.danger, color: "#fff", border: "none" },
//     success: { background: C.success, color: "#fff", border: "none" },
//   };
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       style={{
//         padding: "12px 24px",
//         borderRadius: 8,
//         fontSize: 14,
//         fontWeight: 700,
//         cursor: disabled ? "not-allowed" : "pointer",
//         opacity: disabled ? 0.6 : 1,
//         transition: "all 0.2s",
//         fontFamily: "inherit",
//         ...styles[variant],
//         ...style,
//       }}
//     >
//       {children}
//     </button>
//   );
// };

// const ProgressBar = ({ value, max = 100, color = C.success, height = 8 }) => (
//   <div
//     style={{
//       width: "100%",
//       height,
//       background: "#e5e7eb",
//       borderRadius: height,
//       overflow: "hidden",
//     }}
//   >
//     <div
//       style={{
//         width: `${Math.min((value / max) * 100, 100)}%`,
//         height: "100%",
//         background: color,
//         borderRadius: height,
//         transition: "width 0.6s ease",
//       }}
//     />
//   </div>
// );

// // ============================================================================
// // SCREEN 1: CASE STUDY LIST
// // ============================================================================

// function CaseStudyList({ onSelect, onViewProgress }) {
//   const [caseStudies, setCaseStudies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [enrollments, setEnrollments] = useState([]);

//   useEffect(() => {
//     Promise.all([
//       api
//         .get("/enrollments/my-enrollments")
//         .catch(() => ({ data: { enrollments: [] } })),
//     ]).then(([enrollRes]) => {
//       setEnrollments(enrollRes.data.enrollments || []);
//       // Fetch case studies for enrolled courses
//       const courseIds = (enrollRes.data.enrollments || []).map(
//         (e) => e.course_id,
//       );
//       if (courseIds.length > 0) {
//         Promise.all(
//           courseIds.map((id) =>
//             api
//               .get(`/case-study/course/${id}`)
//               .catch(() => ({ data: { caseStudies: [] } })),
//           ),
//         )
//           .then((results) => {
//             const all = results.flatMap((r) => r.data.caseStudies || []);
//             setCaseStudies(all);
//           })
//           .finally(() => setLoading(false));
//       } else {
//         setLoading(false);
//       }
//     });
//   }, []);

//   const statusColors = {
//     published: C.success,
//     draft: C.warning,
//     archived: C.textMuted,
//   };

//   if (loading)
//     return (
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           minHeight: 400,
//         }}
//       >
//         <div style={{ textAlign: "center" }}>
//           <div
//             style={{
//               fontSize: 48,
//               marginBottom: 16,
//               animation: "pulse 2s infinite",
//             }}
//           >
//             📋
//           </div>
//           <p style={{ color: C.textGray }}>Loading case studies...</p>
//         </div>
//       </div>
//     );

//   return (
//     <div>
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 24,
//           flexWrap: "wrap",
//           gap: 12,
//         }}
//       >
//         <div>
//           <h2
//             style={{
//               fontSize: 24,
//               fontWeight: 800,
//               color: C.darkBlue,
//               margin: 0,
//             }}
//           >
//             📝 Case Study Assignments
//           </h2>
//           <p style={{ fontSize: 14, color: C.textGray, margin: "4px 0 0" }}>
//             Submit answers and get instant AI feedback
//           </p>
//         </div>
//         <Button variant="secondary" onClick={onViewProgress}>
//           📊 My Progress
//         </Button>
//       </div>

//       {caseStudies.length === 0 ? (
//         <Card style={{ textAlign: "center", padding: 48 }}>
//           <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
//           <h3 style={{ color: C.darkBlue, marginBottom: 8 }}>
//             No Case Studies Yet
//           </h3>
//           <p style={{ color: C.textGray }}>
//             Your instructor hasn't published any case studies for your courses
//             yet.
//           </p>
//         </Card>
//       ) : (
//         <div style={{ display: "grid", gap: 16 }}>
//           {caseStudies.map((cs) => (
//             <Card
//               key={cs.id}
//               style={{
//                 cursor: "pointer",
//                 transition: "all 0.2s",
//                 borderLeft: `4px solid ${statusColors[cs.status] || C.mediumBlue}`,
//               }}
//               onClick={() => onSelect(cs)}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "flex-start",
//                   flexWrap: "wrap",
//                   gap: 8,
//                 }}
//               >
//                 <div style={{ flex: 1, minWidth: 200 }}>
//                   <h3
//                     style={{
//                       fontSize: 17,
//                       fontWeight: 700,
//                       color: C.darkBlue,
//                       margin: "0 0 6px",
//                     }}
//                   >
//                     {cs.title}
//                   </h3>
//                   <p
//                     style={{
//                       fontSize: 13,
//                       color: C.textGray,
//                       margin: 0,
//                       lineHeight: 1.5,
//                     }}
//                   >
//                     {cs.description?.substring(0, 150)}...
//                   </p>
//                 </div>
//                 <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                   <Badge color={statusColors[cs.status]}>{cs.status}</Badge>
//                   {cs.deadline && (
//                     <Badge
//                       color={
//                         new Date(cs.deadline) < new Date()
//                           ? C.danger
//                           : C.warning
//                       }
//                     >
//                       {new Date(cs.deadline).toLocaleDateString("en-IN", {
//                         day: "2-digit",
//                         month: "short",
//                       })}
//                     </Badge>
//                   )}
//                   <span
//                     style={{
//                       fontSize: 13,
//                       color: C.mediumBlue,
//                       fontWeight: 600,
//                     }}
//                   >
//                     →
//                   </span>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ============================================================================
// // SCREEN 2: CASE STUDY DETAIL + SUBMISSION
// // ============================================================================

// function CaseStudyDetail({ caseStudy, onBack, onSubmitted }) {
//   const [answer, setAnswer] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const textareaRef = useRef(null);

//   const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
//   const minWords = caseStudy.word_limit_min || 300;
//   const maxWords = caseStudy.word_limit_max || 500;
//   const wordColor =
//     wordCount < minWords
//       ? C.danger
//       : wordCount > maxWords
//         ? C.warning
//         : C.success;

//   const questions = (() => {
//     try {
//       return JSON.parse(caseStudy.questions);
//     } catch {
//       return [];
//     }
//   })();

//   const handleSubmit = async () => {
//     if (!answer.trim()) {
//       setError("Please write your answer before submitting.");
//       return;
//     }
//     if (wordCount < 50) {
//       setError("Your answer is too short. Please write at least 50 words.");
//       return;
//     }

//     setSubmitting(true);
//     setError(null);
//     try {
//       const res = await api.post("/case-study/submit", {
//         caseStudyId: caseStudy.id,
//         answerText: answer.trim(),
//       });
//       onSubmitted(res.data);
//     } catch (err) {
//       setError(
//         err.response?.data?.error ||
//           err.message ||
//           "Submission failed. Please try again.",
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (submitting)
//     return (
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           minHeight: 500,
//           padding: 40,
//         }}
//       >
//         <div
//           style={{
//             fontSize: 72,
//             marginBottom: 24,
//             animation: "bounce 1.5s infinite",
//           }}
//         >
//           🤖
//         </div>
//         <h2
//           style={{
//             fontSize: 24,
//             fontWeight: 800,
//             color: C.darkBlue,
//             marginBottom: 8,
//           }}
//         >
//           AI is Reviewing Your Answer
//         </h2>
//         <p
//           style={{
//             fontSize: 14,
//             color: C.textGray,
//             maxWidth: 400,
//             textAlign: "center",
//             lineHeight: 1.6,
//           }}
//         >
//           Analysing your response against the rubric, checking key concepts, and
//           generating detailed feedback...
//         </p>
//         <div
//           style={{
//             width: 200,
//             height: 6,
//             background: "#e5e7eb",
//             borderRadius: 6,
//             marginTop: 24,
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               width: "70%",
//               height: "100%",
//               background: C.orange,
//               borderRadius: 6,
//               animation: "loading 2s infinite",
//             }}
//           />
//         </div>
//         <p style={{ fontSize: 12, color: C.textMuted, marginTop: 12 }}>
//           This usually takes 15-30 seconds
//         </p>
//         <style>{`
//         @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
//         @keyframes loading { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
//       `}</style>
//       </div>
//     );

//   return (
//     <div>
//       {/* Back button */}
//       <button
//         onClick={onBack}
//         style={{
//           background: "none",
//           border: "none",
//           color: C.mediumBlue,
//           fontSize: 14,
//           fontWeight: 600,
//           cursor: "pointer",
//           marginBottom: 16,
//           padding: 0,
//         }}
//       >
//         ← Back to Case Studies
//       </button>

//       {/* Case Study Content */}
//       <Card style={{ marginBottom: 20, borderTop: `4px solid ${C.darkBlue}` }}>
//         <h2
//           style={{
//             fontSize: 22,
//             fontWeight: 800,
//             color: C.darkBlue,
//             margin: "0 0 12px",
//           }}
//         >
//           {caseStudy.title}
//         </h2>
//         <p
//           style={{
//             fontSize: 14,
//             color: C.textDark,
//             lineHeight: 1.8,
//             whiteSpace: "pre-wrap",
//           }}
//         >
//           {caseStudy.description}
//         </p>

//         {questions.length > 0 && (
//           <div
//             style={{
//               marginTop: 20,
//               padding: 16,
//               background: "#EFF6FF",
//               borderRadius: 10,
//               borderLeft: `4px solid ${C.mediumBlue}`,
//             }}
//           >
//             <h4
//               style={{
//                 fontSize: 14,
//                 fontWeight: 700,
//                 color: C.mediumBlue,
//                 marginTop: 0,
//                 marginBottom: 10,
//               }}
//             >
//               Questions to Answer:
//             </h4>
//             {questions.map((q, i) => (
//               <p
//                 key={i}
//                 style={{
//                   fontSize: 14,
//                   color: C.textDark,
//                   margin: "8px 0",
//                   lineHeight: 1.6,
//                 }}
//               >
//                 <strong>Q{i + 1}:</strong>{" "}
//                 {typeof q === "string" ? q : q.question || JSON.stringify(q)}
//               </p>
//             ))}
//           </div>
//         )}

//         <div
//           style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}
//         >
//           <Badge color={C.teal}>
//             📝 {minWords}-{maxWords} words
//           </Badge>
//           {caseStudy.deadline && (
//             <Badge color={C.warning}>
//               📅 Due: {new Date(caseStudy.deadline).toLocaleDateString("en-IN")}
//             </Badge>
//           )}
//           <Badge color={C.mediumBlue}>
//             💯 Max Score: {caseStudy.max_score || 100}
//           </Badge>
//         </div>
//       </Card>

//       {/* Answer Textarea */}
//       <Card style={{ marginBottom: 20 }}>
//         <h3
//           style={{
//             fontSize: 16,
//             fontWeight: 700,
//             color: C.darkBlue,
//             marginTop: 0,
//             marginBottom: 12,
//           }}
//         >
//           Your Answer
//         </h3>

//         <textarea
//           ref={textareaRef}
//           value={answer}
//           onChange={(e) => setAnswer(e.target.value)}
//           placeholder="Write your case study answer here. Be thorough — cover all the key concepts, provide real-world examples, and structure your answer clearly with an introduction, analysis, and conclusion."
//           style={{
//             width: "100%",
//             minHeight: 300,
//             padding: 16,
//             fontSize: 14,
//             lineHeight: 1.8,
//             borderRadius: 10,
//             border: `2px solid ${answer ? C.mediumBlue : C.border}`,
//             fontFamily: "inherit",
//             resize: "vertical",
//             boxSizing: "border-box",
//             transition: "border-color 0.2s",
//             outline: "none",
//           }}
//           onFocus={(e) => (e.target.style.borderColor = C.mediumBlue)}
//           onBlur={(e) =>
//             (e.target.style.borderColor = answer ? C.mediumBlue : C.border)
//           }
//         />

//         {/* Word count bar */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginTop: 10,
//           }}
//         >
//           <div style={{ flex: 1, marginRight: 16 }}>
//             <ProgressBar value={wordCount} max={maxWords} color={wordColor} />
//           </div>
//           <span
//             style={{
//               fontSize: 13,
//               fontWeight: 700,
//               color: wordColor,
//               whiteSpace: "nowrap",
//             }}
//           >
//             {wordCount} / {minWords}-{maxWords} words
//           </span>
//         </div>

//         {error && (
//           <div
//             style={{
//               marginTop: 12,
//               padding: 12,
//               background: "#FEF2F2",
//               borderRadius: 8,
//               color: C.danger,
//               fontSize: 13,
//               border: `1px solid #FECACA`,
//             }}
//           >
//             ⚠️ {error}
//           </div>
//         )}
//       </Card>

//       {/* Submit Button */}
//       <div style={{ display: "flex", gap: 12 }}>
//         <Button variant="secondary" onClick={onBack}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           disabled={submitting || wordCount < 50}
//           style={{ flex: 1 }}
//         >
//           ⚡ Submit for AI Review
//         </Button>
//       </div>
//     </div>
//   );
// }

// // ============================================================================
// // SCREEN 3: AI FEEDBACK
// // ============================================================================

// function AIFeedback({ feedback, submission, onBack, onRetry }) {
//   const fb = feedback?.feedback || feedback;
//   const score = fb?.score ?? fb?.totalScore ?? 0;
//   const grade = fb?.grade || "—";
//   const pct = score;
//   const band =
//     pct >= 85
//       ? "Excellent"
//       : pct >= 70
//         ? "Good"
//         : pct >= 50
//           ? "Average"
//           : "Needs Improvement";
//   const bandColor =
//     pct >= 85
//       ? C.success
//       : pct >= 70
//         ? "#2563eb"
//         : pct >= 50
//           ? C.warning
//           : C.danger;

//   return (
//     <div>
//       <button
//         onClick={onBack}
//         style={{
//           background: "none",
//           border: "none",
//           color: C.mediumBlue,
//           fontSize: 14,
//           fontWeight: 600,
//           cursor: "pointer",
//           marginBottom: 16,
//           padding: 0,
//         }}
//       >
//         ← Back to Case Studies
//       </button>

//       {/* Score Card */}
//       <Card
//         style={{
//           textAlign: "center",
//           marginBottom: 20,
//           borderTop: `4px solid ${bandColor}`,
//         }}
//       >
//         <div style={{ fontSize: 48, marginBottom: 8 }}>
//           {pct >= 70 ? "🎉" : pct >= 50 ? "📊" : "📚"}
//         </div>
//         <Badge color={bandColor} bg={`${bandColor}15`}>
//           {band}
//         </Badge>
//         <div
//           style={{
//             fontSize: 56,
//             fontWeight: 800,
//             color: bandColor,
//             margin: "12px 0",
//             lineHeight: 1,
//           }}
//         >
//           {Math.round(score)}/100
//         </div>
//         <div style={{ fontSize: 20, fontWeight: 700, color: C.darkBlue }}>
//           Grade: {grade}
//         </div>
//         {submission?.attemptNumber && (
//           <p style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>
//             Attempt #{submission.attemptNumber}
//           </p>
//         )}
//       </Card>

//       {/* Rubric Breakdown */}
//       {fb?.rubricScores?.length > 0 && (
//         <Card style={{ marginBottom: 20 }}>
//           <h3
//             style={{
//               fontSize: 16,
//               fontWeight: 700,
//               color: C.darkBlue,
//               marginTop: 0,
//               marginBottom: 16,
//             }}
//           >
//             📊 Rubric Breakdown
//           </h3>
//           {fb.rubricScores.map((r, i) => (
//             <div key={i} style={{ marginBottom: 14 }}>
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   marginBottom: 4,
//                 }}
//               >
//                 <span
//                   style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}
//                 >
//                   {r.criteria || r.name}
//                 </span>
//                 <span
//                   style={{
//                     fontSize: 13,
//                     fontWeight: 700,
//                     color:
//                       r.percentage >= 70
//                         ? C.success
//                         : r.percentage >= 50
//                           ? C.warning
//                           : C.danger,
//                   }}
//                 >
//                   {r.score}/{r.maxScore} ({r.percentage}%)
//                 </span>
//               </div>
//               <ProgressBar
//                 value={r.percentage}
//                 color={
//                   r.percentage >= 70
//                     ? C.success
//                     : r.percentage >= 50
//                       ? C.warning
//                       : C.danger
//                 }
//               />
//             </div>
//           ))}
//         </Card>
//       )}

//       {/* Strengths */}
//       {fb?.strengths?.length > 0 && (
//         <Card
//           style={{ marginBottom: 20, borderLeft: `4px solid ${C.success}` }}
//         >
//           <h3
//             style={{
//               fontSize: 16,
//               fontWeight: 700,
//               color: C.success,
//               marginTop: 0,
//               marginBottom: 12,
//             }}
//           >
//             ✅ Strengths
//           </h3>
//           {fb.strengths.map((s, i) => (
//             <div
//               key={i}
//               style={{
//                 fontSize: 14,
//                 color: C.textDark,
//                 padding: "6px 0 6px 12px",
//                 borderLeft: `2px solid ${C.success}40`,
//                 marginBottom: 6,
//                 lineHeight: 1.6,
//               }}
//             >
//               {s}
//             </div>
//           ))}
//         </Card>
//       )}

//       {/* Areas for Improvement */}
//       {fb?.improvements?.length > 0 && (
//         <Card
//           style={{ marginBottom: 20, borderLeft: `4px solid ${C.warning}` }}
//         >
//           <h3
//             style={{
//               fontSize: 16,
//               fontWeight: 700,
//               color: C.warning,
//               marginTop: 0,
//               marginBottom: 12,
//             }}
//           >
//             📈 Areas to Improve
//           </h3>
//           {fb.improvements.map((s, i) => (
//             <div
//               key={i}
//               style={{
//                 fontSize: 14,
//                 color: C.textDark,
//                 padding: "6px 0 6px 12px",
//                 borderLeft: `2px solid ${C.warning}40`,
//                 marginBottom: 6,
//                 lineHeight: 1.6,
//               }}
//             >
//               {s}
//             </div>
//           ))}
//         </Card>
//       )}

//       {/* Missing Concepts */}
//       {fb?.missingConcepts?.length > 0 && (
//         <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.danger}` }}>
//           <h3
//             style={{
//               fontSize: 16,
//               fontWeight: 700,
//               color: C.danger,
//               marginTop: 0,
//               marginBottom: 12,
//             }}
//           >
//             ❌ Missing Key Concepts
//           </h3>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//             {fb.missingConcepts.map((c, i) => (
//               <Badge key={i} color={C.danger}>
//                 {c}
//               </Badge>
//             ))}
//           </div>
//         </Card>
//       )}

//       {/* Covered Concepts */}
//       {fb?.coveredConcepts?.length > 0 && (
//         <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.teal}` }}>
//           <h3
//             style={{
//               fontSize: 16,
//               fontWeight: 700,
//               color: C.teal,
//               marginTop: 0,
//               marginBottom: 12,
//             }}
//           >
//             ✓ Concepts You Covered
//           </h3>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//             {fb.coveredConcepts.map((c, i) => (
//               <Badge key={i} color={C.teal}>
//                 {c}
//               </Badge>
//             ))}
//           </div>
//         </Card>
//       )}

//       {/* Detailed Feedback */}
//       {fb?.detailedFeedback && (
//         <Card
//           style={{ marginBottom: 20, borderLeft: `4px solid ${C.mediumBlue}` }}
//         >
//           <h3
//             style={{
//               fontSize: 16,
//               fontWeight: 700,
//               color: C.mediumBlue,
//               marginTop: 0,
//               marginBottom: 12,
//             }}
//           >
//             💡 Detailed Feedback
//           </h3>
//           <p
//             style={{
//               fontSize: 14,
//               color: C.textDark,
//               lineHeight: 1.8,
//               whiteSpace: "pre-wrap",
//               margin: 0,
//             }}
//           >
//             {fb.detailedFeedback}
//           </p>
//         </Card>
//       )}

//       {/* Study Recommendations */}
//       {fb?.suggestions?.length > 0 && (
//         <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.orange}` }}>
//           <h3
//             style={{
//               fontSize: 16,
//               fontWeight: 700,
//               color: C.orange,
//               marginTop: 0,
//               marginBottom: 12,
//             }}
//           >
//             📖 Recommended Topics to Study
//           </h3>
//           {fb.suggestions.map((s, i) => (
//             <div
//               key={i}
//               style={{
//                 fontSize: 14,
//                 color: C.textDark,
//                 padding: "6px 0 6px 12px",
//                 borderLeft: `2px solid ${C.orange}40`,
//                 marginBottom: 6,
//                 lineHeight: 1.6,
//               }}
//             >
//               {s}
//             </div>
//           ))}
//         </Card>
//       )}

//       {/* Word Count */}
//       {fb?.wordCount && (
//         <Card style={{ marginBottom: 20 }}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <span style={{ fontSize: 14, color: C.textGray }}>Word Count</span>
//             <span
//               style={{
//                 fontSize: 14,
//                 fontWeight: 700,
//                 color: fb.wordCountMessage?.includes("short")
//                   ? C.danger
//                   : C.success,
//               }}
//             >
//               {fb.wordCount} words{" "}
//               {fb.wordCountMessage && `— ${fb.wordCountMessage}`}
//             </span>
//           </div>
//         </Card>
//       )}

//       {/* Encouragement */}
//       {fb?.encouragement && (
//         <Card
//           style={{
//             marginBottom: 20,
//             background: "#FFFBEB",
//             border: `1px solid #FCD34D`,
//           }}
//         >
//           <p
//             style={{
//               fontSize: 14,
//               color: "#92400E",
//               margin: 0,
//               lineHeight: 1.6,
//             }}
//           >
//             💪 {fb.encouragement}
//           </p>
//         </Card>
//       )}

//       {/* Action Buttons */}
//       <div style={{ display: "flex", gap: 12 }}>
//         <Button variant="secondary" onClick={onBack}>
//           Back to List
//         </Button>
//         <Button onClick={onRetry} style={{ flex: 1 }}>
//           🔄 Re-attempt This Case Study
//         </Button>
//       </div>
//     </div>
//   );
// }

// // ============================================================================
// // SCREEN 4: MY PROGRESS
// // ============================================================================

// function MyProgress({ onBack }) {
//   const [progress, setProgress] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api
//       .get("/case-study/my-progress")
//       .then((r) => setProgress(r.data.student))
//       .catch(() => setProgress(null))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading)
//     return (
//       <div style={{ textAlign: "center", padding: 48 }}>
//         <p style={{ color: C.textGray }}>Loading progress...</p>
//       </div>
//     );

//   const stats = progress?.overallStats || {};

//   return (
//     <div>
//       <button
//         onClick={onBack}
//         style={{
//           background: "none",
//           border: "none",
//           color: C.mediumBlue,
//           fontSize: 14,
//           fontWeight: 600,
//           cursor: "pointer",
//           marginBottom: 16,
//           padding: 0,
//         }}
//       >
//         ← Back to Case Studies
//       </button>

//       <h2
//         style={{
//           fontSize: 24,
//           fontWeight: 800,
//           color: C.darkBlue,
//           margin: "0 0 20px",
//         }}
//       >
//         📊 My Case Study Progress
//       </h2>

//       {/* Stats Cards */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
//           gap: 12,
//           marginBottom: 24,
//         }}
//       >
//         {[
//           ["📝", "Total", stats.totalCaseStudies || 0, C.mediumBlue],
//           ["✅", "Completed", stats.completedCount || 0, C.success],
//           [
//             "📈",
//             "Avg Current",
//             `${Math.round(stats.averageCurrentScore || 0)}%`,
//             C.warning,
//           ],
//           [
//             "⭐",
//             "Avg Best",
//             `${Math.round(stats.averageBestScore || 0)}%`,
//             C.orange,
//           ],
//           ["🆘", "Needs Help", stats.needsHelpCount || 0, C.danger],
//         ].map(([icon, label, value, color]) => (
//           <Card key={label} style={{ textAlign: "center", padding: 16 }}>
//             <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
//             <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
//             <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
//               {label}
//             </div>
//           </Card>
//         ))}
//       </div>

//       {/* Case Study List */}
//       {(progress?.caseStudies || []).length === 0 ? (
//         <Card style={{ textAlign: "center", padding: 40 }}>
//           <p style={{ color: C.textGray }}>
//             No case study submissions yet. Start by submitting your first
//             answer!
//           </p>
//         </Card>
//       ) : (
//         <div style={{ display: "grid", gap: 12 }}>
//           {progress.caseStudies.map((cs, i) => {
//             const statusColor =
//               cs.status === "completed"
//                 ? C.success
//                 : cs.status === "needs_help"
//                   ? C.danger
//                   : C.warning;
//             return (
//               <Card key={i}>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     flexWrap: "wrap",
//                     gap: 8,
//                   }}
//                 >
//                   <div style={{ flex: 1, minWidth: 200 }}>
//                     <h4
//                       style={{
//                         fontSize: 15,
//                         fontWeight: 700,
//                         color: C.darkBlue,
//                         margin: "0 0 4px",
//                       }}
//                     >
//                       {cs.title}
//                     </h4>
//                     <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                       <Badge color={statusColor}>
//                         {cs.status?.replace("_", " ")}
//                       </Badge>
//                       <Badge color={C.textMuted}>
//                         {cs.totalAttempts} attempt
//                         {cs.totalAttempts !== 1 ? "s" : ""}
//                       </Badge>
//                     </div>
//                   </div>
//                   <div
//                     style={{ display: "flex", gap: 20, alignItems: "center" }}
//                   >
//                     <div style={{ textAlign: "center" }}>
//                       <div style={{ fontSize: 11, color: C.textMuted }}>
//                         Current
//                       </div>
//                       <div
//                         style={{
//                           fontSize: 20,
//                           fontWeight: 800,
//                           color: C.mediumBlue,
//                         }}
//                       >
//                         {Math.round(cs.currentScore)}%
//                       </div>
//                     </div>
//                     <div style={{ textAlign: "center" }}>
//                       <div style={{ fontSize: 11, color: C.textMuted }}>
//                         Best
//                       </div>
//                       <div
//                         style={{
//                           fontSize: 20,
//                           fontWeight: 800,
//                           color: C.success,
//                         }}
//                       >
//                         {Math.round(cs.bestScore)}%
//                       </div>
//                     </div>
//                     {cs.improvement > 0 && (
//                       <div style={{ textAlign: "center" }}>
//                         <div style={{ fontSize: 11, color: C.textMuted }}>
//                           Growth
//                         </div>
//                         <div
//                           style={{
//                             fontSize: 16,
//                             fontWeight: 800,
//                             color: C.teal,
//                           }}
//                         >
//                           +{Math.round(cs.improvement)}%
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div style={{ marginTop: 10 }}>
//                   <ProgressBar
//                     value={cs.bestScore}
//                     color={
//                       cs.bestScore >= 70
//                         ? C.success
//                         : cs.bestScore >= 50
//                           ? C.warning
//                           : C.danger
//                     }
//                   />
//                 </div>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================

// export default function CaseStudyReview() {
//   const [screen, setScreen] = useState("list"); // list | detail | feedback | progress
//   const [selectedCS, setSelectedCS] = useState(null);
//   const [feedbackData, setFeedbackData] = useState(null);
//   const [submissionData, setSubmissionData] = useState(null);

//   return (
//     <div
//       style={{
//         background: C.bgLight,
//         minHeight: "100vh",
//         padding: "30px 20px",
//       }}
//     >
//       <div style={{ maxWidth: 800, margin: "0 auto" }}>
//         {screen === "list" && (
//           <CaseStudyList
//             onSelect={(cs) => {
//               setSelectedCS(cs);
//               setScreen("detail");
//             }}
//             onViewProgress={() => setScreen("progress")}
//           />
//         )}

//         {screen === "detail" && selectedCS && (
//           <CaseStudyDetail
//             caseStudy={selectedCS}
//             onBack={() => setScreen("list")}
//             onSubmitted={(data) => {
//               setFeedbackData(data);
//               setSubmissionData(data.submission);
//               setScreen("feedback");
//             }}
//           />
//         )}

//         {screen === "feedback" && feedbackData && (
//           <AIFeedback
//             feedback={feedbackData}
//             submission={submissionData}
//             onBack={() => {
//               setFeedbackData(null);
//               setScreen("list");
//             }}
//             onRetry={() => {
//               setFeedbackData(null);
//               setScreen("detail");
//             }}
//           />
//         )}

//         {screen === "progress" && (
//           <MyProgress onBack={() => setScreen("list")} />
//         )}
//       </div>
//     </div>
//   );
// }
