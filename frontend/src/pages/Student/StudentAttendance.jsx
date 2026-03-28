import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Clock, BookOpen, Calendar, Monitor, ArrowLeft, Activity, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const T = {
  navy: "#1a2744", navyLight: "#2c3e6b", gold: "#b8960b", goldSoft: "#fdf8ed",
  white: "#ffffff", bg: "#f7f8fc", border: "#e8e9f0", text: "#1a1a1a",
  muted: "#72706b", green: "#2d6a2d", greenSoft: "#edf7ed", red: "#c0392b",
  redSoft: "#fdf1f0", blue: "#1e3a6b", blueSoft: "#eef2fb", amber: "#b8960b", amberSoft: "#fdf8ed",
};

export default function StudentAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("");

  useEffect(() => { load(); }, [courseFilter]);

  const load = async () => {
    try {
      setLoading(true);
      const url = courseFilter ? `/attendance/my?course_id=${courseFilter}` : "/attendance/my";
      const { data } = await api.get(url);
      setRecords(data.records || []);
      setSummary(data.summary || []);
      setLogins(data.logins || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "-";
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }) : "-";

  return (
    <div style={{ minHeight:"100vh", background:T.bg, padding:"24px" }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>
        <Link to="/student" style={{ display:"inline-flex", alignItems:"center", gap:6, color:T.muted, textDecoration:"none", fontSize:14, marginBottom:16 }}>
          <ArrowLeft size={16}/> Back to Dashboard
        </Link>
        <h1 style={{ fontSize:24, fontWeight:700, color:T.navy, marginBottom:8 }}>My Attendance</h1>
        <p style={{ color:T.muted, fontSize:14, marginBottom:24 }}>Your lecture watch history, login times, and activity</p>

        {loading ? <p style={{textAlign:"center",padding:40,color:T.muted}}>Loading...</p> : <>

        {/* Summary Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginBottom:24 }}>
          {summary.map((s, i) => (
            <div key={i} style={{ background:T.white, borderRadius:10, padding:16, border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:12, color:T.muted, marginBottom:4 }}>{s.course_name}</div>
              <div style={{ fontSize:28, fontWeight:700, color:T.navy }}>{s.days_attended || 0} <span style={{fontSize:14,fontWeight:400,color:T.muted}}>days</span></div>
              <div style={{ display:"flex", gap:12, marginTop:8, fontSize:12 }}>
                <span style={{color:T.green}}>{s.lessons_watched || 0} lessons</span>
                <span style={{color:T.blue}}>{s.total_hours || 0} hrs</span>
                <span style={{color:T.amber}}>avg {s.avg_watch_percent || 0}%</span>
              </div>
            </div>
          ))}
          {summary.length === 0 && <div style={{background:T.white,borderRadius:10,padding:24,border:`1px solid ${T.border}`,textAlign:"center",color:T.muted}}>No attendance data yet. Start watching lectures!</div>}
        </div>

        {/* Lecture History */}
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, marginBottom:24, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h3 style={{ fontSize:15, fontWeight:600, color:T.navy, margin:0 }}>Lecture History</h3>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Eye size={14} color={T.muted}/>
              <span style={{fontSize:12,color:T.muted}}>{records.length} sessions</span>
            </div>
          </div>
          {records.length === 0 ? <div style={{padding:30,textAlign:"center",color:T.muted,fontSize:14}}>No lectures watched yet</div> :
          <div style={{overflowX:"auto"}}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{background:T.bg}}>
                  <th style={th}>Lecture</th><th style={th}>Date</th><th style={th}>Joined</th><th style={th}>Left</th><th style={th}>Duration</th><th style={th}>Watched</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} style={{borderTop:`1px solid ${T.border}`}}>
                    <td style={td}><span style={{fontWeight:500,color:T.navy}}>{r.lesson_title || `Lesson ${r.lesson_id}`}</span><br/><span style={{fontSize:11,color:T.muted}}>{r.course_name || ""}</span></td>
                    <td style={td}>{fmt(r.session_date)}</td>
                    <td style={td}><span style={{color:T.green}}>{fmtTime(r.joined_at)}</span></td>
                    <td style={td}><span style={{color:r.left_at ? T.red : T.muted}}>{r.left_at ? fmtTime(r.left_at) : "..."}</span></td>
                    <td style={td}>{r.duration_minutes || r.duration || "0"} min</td>
                    <td style={td}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:60,height:6,borderRadius:3,background:T.border}}>
                          <div style={{width:`${Math.min(r.watch_percent||0,100)}%`,height:6,borderRadius:3,background:(r.watch_percent||0)>=70?T.green:(r.watch_percent||0)>=40?"#f39c12":T.red}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:600,color:(r.watch_percent||0)>=70?T.green:(r.watch_percent||0)>=40?"#f39c12":T.red}}>{r.watch_percent||0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </div>

        {/* Login History */}
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}` }}>
            <h3 style={{ fontSize:15, fontWeight:600, color:T.navy, margin:0 }}>Login History</h3>
          </div>
          {logins.length === 0 ? <div style={{padding:30,textAlign:"center",color:T.muted,fontSize:14}}>No login records</div> :
          <div style={{overflowX:"auto"}}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{background:T.bg}}>
                  <th style={th}>Date & Time</th><th style={th}>IP Address</th><th style={th}>Device</th>
                </tr>
              </thead>
              <tbody>
                {logins.map((l, i) => (
                  <tr key={i} style={{borderTop:`1px solid ${T.border}`}}>
                    <td style={td}><Calendar size={12} style={{marginRight:4,verticalAlign:"middle"}}/>{fmt(l.login_at)} {fmtTime(l.login_at)}</td>
                    <td style={td}><Monitor size={12} style={{marginRight:4,verticalAlign:"middle"}}/>{l.ip_address || "-"}</td>
                    <td style={td} title={l.device}>{(l.device||"").substring(0,50)}{(l.device||"").length>50?"...":""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </div>
        </>}
      </div>
    </div>
  );
}

const th = { textAlign:"left", padding:"10px 16px", fontSize:11, fontWeight:500, color:"#888", textTransform:"uppercase", letterSpacing:0.5 };
const td = { padding:"10px 16px" };
