import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Clock, Users, AlertTriangle, ArrowLeft, Eye, Activity, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";

const T = {
  navy: "#1a2744", navyLight: "#2c3e6b", gold: "#b8960b", goldSoft: "#fdf8ed",
  white: "#ffffff", bg: "#f7f8fc", border: "#e8e9f0", text: "#1a1a1a",
  muted: "#72706b", green: "#2d6a2d", greenSoft: "#edf7ed", red: "#c0392b",
  redSoft: "#fdf1f0", blue: "#1e3a6b", blueSoft: "#eef2fb", amber: "#b8960b", amberSoft: "#fdf8ed",
};

export default function FacultyAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (selectedCourse) loadCourse(selectedCourse); }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const { data } = await api.get("/attendance/my-courses");
      setCourses(data.courses || []);
      if (data.courses?.length) setSelectedCourse(data.courses[0].id);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadCourse = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/attendance/course/${id}`);
      setStudents(data.students || []);
      setStats({ total: data.total_students, lessons: data.total_lessons, atRisk: data.at_risk, inactive: data.inactive });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openDetail = async (studentId) => {
    try {
      const { data } = await api.get(`/attendance/student/${studentId}?course_id=${selectedCourse}`);
      setDetail(data.student);
      setDetailData(data);
    } catch (e) { console.error(e); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : "-";
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }) : "-";
  const fmtFull = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) + " " + fmtTime(d) : "-";
  const statusPill = (s) => {
    const m = { active:{bg:T.greenSoft,c:T.green}, at_risk:{bg:T.amberSoft,c:T.amber}, inactive:{bg:T.redSoft,c:T.red} };
    const st = m[s] || m.inactive;
    return <span style={{padding:"2px 10px",borderRadius:8,fontSize:11,fontWeight:600,background:st.bg,color:st.c}}>{s?.replace("_"," ") || "unknown"}</span>;
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, padding:"24px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <Link to="/faculty" style={{ display:"inline-flex", alignItems:"center", gap:6, color:T.muted, textDecoration:"none", fontSize:14, marginBottom:16 }}>
          <ArrowLeft size={16}/> Back to Dashboard
        </Link>
        <h1 style={{ fontSize:24, fontWeight:700, color:T.navy, marginBottom:8 }}>Student Attendance</h1>
        <p style={{ color:T.muted, fontSize:14, marginBottom:20 }}>See who's watching lectures, how long, and who needs attention</p>

        {/* Course selector */}
        <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
          {courses.map(c => (
            <button key={c.id} onClick={() => setSelectedCourse(c.id)}
              style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${selectedCourse===c.id?T.navy:T.border}`,
                background:selectedCourse===c.id?T.navy:T.white, color:selectedCourse===c.id?T.white:T.text,
                fontSize:13, fontWeight:500, cursor:"pointer" }}>
              {c.course_name}
            </button>
          ))}
        </div>

        {loading ? <p style={{textAlign:"center",padding:40,color:T.muted}}>Loading...</p> : <>

        {/* Stats Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          <StatCard label="Total Students" value={stats.total || 0} color={T.navy} icon={<Users size={18}/>}/>
          <StatCard label="Total Lessons" value={stats.lessons || 0} color={T.blue} icon={<Eye size={18}/>}/>
          <StatCard label="At Risk" value={stats.atRisk || 0} color={T.amber} icon={<AlertTriangle size={18}/>}/>
          <StatCard label="Inactive" value={stats.inactive || 0} color={T.red} icon={<Activity size={18}/>}/>
        </div>

        {/* Students Table */}
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}` }}>
            <h3 style={{ fontSize:15, fontWeight:600, color:T.navy, margin:0 }}>Students ({students.length})</h3>
          </div>
          {students.length === 0 ? <div style={{padding:30,textAlign:"center",color:T.muted}}>No attendance data for this course</div> :
          <div style={{overflowX:"auto"}}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{background:T.bg}}>
                  <th style={th}>Student</th><th style={th}>Lessons</th><th style={th}>Hours</th><th style={th}>Avg Watch</th><th style={th}>Last Active</th><th style={th}>Status</th><th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i} style={{borderTop:`1px solid ${T.border}`,cursor:"pointer"}} onClick={() => openDetail(s.student_id)}>
                    <td style={td}>
                      <div style={{fontWeight:500,color:T.navy}}>{s.full_name || `Student ${s.student_id}`}</div>
                      <div style={{fontSize:11,color:T.muted}}>{s.email || ""}</div>
                    </td>
                    <td style={td}><span style={{fontWeight:600}}>{s.lessons_watched || 0}</span> <span style={{color:T.muted}}>/ {stats.lessons || "?"}</span></td>
                    <td style={td}>{s.total_hours || 0} hrs</td>
                    <td style={td}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:50,height:5,borderRadius:3,background:T.border}}>
                          <div style={{width:`${Math.min(s.avg_watch_percent||0,100)}%`,height:5,borderRadius:3,background:(s.avg_watch_percent||0)>=70?T.green:(s.avg_watch_percent||0)>=40?"#f39c12":T.red}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:600}}>{s.avg_watch_percent || 0}%</span>
                      </div>
                    </td>
                    <td style={td}>{s.last_active ? fmtFull(s.last_active) : "Never"}</td>
                    <td style={td}>{statusPill(s.status)}</td>
                    <td style={td}><ChevronRight size={14} color={T.muted}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </div>
        </>}

        {/* Student Detail Modal */}
        {detail && detailData && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={() => {setDetail(null);setDetailData(null);}}>
            <div style={{background:T.white,borderRadius:12,width:"100%",maxWidth:700,maxHeight:"85vh",overflow:"auto",padding:24}} onClick={e => e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div>
                  <h2 style={{fontSize:18,fontWeight:700,color:T.navy,margin:0}}>{detail.name}</h2>
                  <p style={{fontSize:13,color:T.muted,margin:0}}>{detail.email}</p>
                </div>
                <button onClick={() => {setDetail(null);setDetailData(null);}} style={{background:"none",border:"none",cursor:"pointer"}}><X size={20} color={T.muted}/></button>
              </div>

              {/* Course Summary */}
              {detailData.course_summary?.length > 0 && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:16}}>
                  {detailData.course_summary.map((cs, i) => (
                    <div key={i} style={{background:T.bg,borderRadius:8,padding:12}}>
                      <div style={{fontSize:11,color:T.muted}}>{cs.course_name}</div>
                      <div style={{fontSize:20,fontWeight:700,color:T.navy}}>{cs.days_attended} days</div>
                      <div style={{fontSize:11,color:T.green}}>{cs.lessons_watched} lessons | {cs.total_hours} hrs</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lecture Records */}
              <h3 style={{fontSize:14,fontWeight:600,color:T.navy,marginBottom:8}}>Lecture History</h3>
              {detailData.records?.length > 0 ? (
                <div style={{overflowX:"auto",marginBottom:16}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr style={{background:T.bg}}>
                      <th style={th}>Lecture</th><th style={th}>Date</th><th style={th}>Joined</th><th style={th}>Left</th><th style={th}>Mins</th><th style={th}>Watch%</th>
                    </tr></thead>
                    <tbody>
                      {detailData.records.slice(0,30).map((r,i) => (
                        <tr key={i} style={{borderTop:`1px solid ${T.border}`}}>
                          <td style={td}>{r.lesson_title || `Lesson ${r.lesson_id}`}</td>
                          <td style={td}>{fmt(r.session_date)}</td>
                          <td style={{...td,color:T.green}}>{fmtTime(r.joined_at)}</td>
                          <td style={{...td,color:r.left_at?T.red:T.muted}}>{r.left_at?fmtTime(r.left_at):"..."}</td>
                          <td style={td}>{r.duration_minutes||0}</td>
                          <td style={td}><span style={{fontWeight:600,color:(r.watch_percent||0)>=70?T.green:T.red}}>{r.watch_percent||0}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{color:T.muted,fontSize:13}}>No lecture records</p>}

              {/* Login History */}
              <h3 style={{fontSize:14,fontWeight:600,color:T.navy,marginBottom:8}}>Login History</h3>
              {detailData.logins?.length > 0 ? (
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr style={{background:T.bg}}>
                      <th style={th}>Date & Time</th><th style={th}>IP</th><th style={th}>Device</th>
                    </tr></thead>
                    <tbody>
                      {detailData.logins.slice(0,15).map((l,i) => (
                        <tr key={i} style={{borderTop:`1px solid ${T.border}`}}>
                          <td style={td}>{fmtFull(l.login_at)}</td>
                          <td style={td}>{l.ip_address||"-"}</td>
                          <td style={td}>{(l.device||"").substring(0,40)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{color:T.muted,fontSize:13}}>No login records</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{background:"#fff",borderRadius:10,padding:16,border:`1px solid #e8e9f0`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:12,color:"#72706b",marginBottom:4}}>{label}</div><div style={{fontSize:28,fontWeight:700,color}}>{value}</div></div>
        <div style={{color,opacity:0.3}}>{icon}</div>
      </div>
    </div>
  );
}

const th = { textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:500, color:"#888", textTransform:"uppercase", letterSpacing:0.5 };
const td = { padding:"10px 14px" };
