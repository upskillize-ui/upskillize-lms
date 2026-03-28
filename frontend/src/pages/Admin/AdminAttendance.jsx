import { useState, useEffect } from "react";
import api from "../../services/api";
import { Users, Activity, AlertTriangle, ArrowLeft, Monitor, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const T = {
  navy: "#1a2744", navyLight: "#2c3e6b", gold: "#b8960b", goldSoft: "#fdf8ed",
  white: "#ffffff", bg: "#f7f8fc", border: "#e8e9f0", text: "#1a1a1a",
  muted: "#72706b", green: "#2d6a2d", greenSoft: "#edf7ed", red: "#c0392b",
  redSoft: "#fdf1f0", blue: "#1e3a6b", blueSoft: "#eef2fb", amber: "#b8960b", amberSoft: "#fdf8ed",
};

export default function AdminAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => { load(); }, [days]);

  const load = async () => {
    try {
      setLoading(true);
      const { data: d } = await api.get(`/attendance/admin/overview?days=${days}`);
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : "-";
  const fmtFull = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) + " " + new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }) : "Never";

  return (
    <div style={{ minHeight:"100vh", background:T.bg, padding:"24px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <Link to="/admin" style={{ display:"inline-flex", alignItems:"center", gap:6, color:T.muted, textDecoration:"none", fontSize:14, marginBottom:16 }}>
          <ArrowLeft size={16}/> Back to Dashboard
        </Link>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:T.navy, marginBottom:4 }}>Attendance Overview</h1>
            <p style={{ color:T.muted, fontSize:14, margin:0 }}>All courses, all students</p>
          </div>
          <div style={{display:"flex",gap:6}}>
            {[7,30,90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${days===d?T.navy:T.border}`,
                  background:days===d?T.navy:T.white,color:days===d?T.white:T.text,fontSize:12,fontWeight:500,cursor:"pointer"}}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? <p style={{textAlign:"center",padding:40,color:T.muted}}>Loading...</p> : data && <>

        {/* Top Stat */}
        <div style={{background:T.navy,borderRadius:12,padding:20,marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
          <div style={{background:"rgba(255,255,255,0.1)",borderRadius:10,padding:12}}><Monitor size={24} color={T.white}/></div>
          <div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.6)"}}>Logins Today</div>
            <div style={{fontSize:36,fontWeight:700,color:T.white}}>{data.logins_today || 0}</div>
          </div>
        </div>

        {/* Course-wise Attendance */}
        <div style={{background:T.white,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:20,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}>
            <h3 style={{fontSize:15,fontWeight:600,color:T.navy,margin:0}}>Course Activity</h3>
          </div>
          {(data.courses||[]).length === 0 ? <div style={{padding:30,textAlign:"center",color:T.muted}}>No attendance data</div> :
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:T.bg}}>
                <th style={th}>Course</th><th style={th}>Active Students</th><th style={th}>Active Days</th><th style={th}>Total Hours</th><th style={th}>Avg Watch %</th>
              </tr></thead>
              <tbody>
                {data.courses.map((c,i) => (
                  <tr key={i} style={{borderTop:`1px solid ${T.border}`}}>
                    <td style={td}><span style={{fontWeight:500,color:T.navy}}>{c.course_name || `Course ${c.course_id}`}</span></td>
                    <td style={td}><span style={{fontWeight:600}}>{c.active_students}</span></td>
                    <td style={td}>{c.active_days}</td>
                    <td style={td}>{c.total_hours || 0} hrs</td>
                    <td style={td}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:50,height:5,borderRadius:3,background:T.border}}>
                          <div style={{width:`${Math.min(c.avg_watch_percent||0,100)}%`,height:5,borderRadius:3,background:(c.avg_watch_percent||0)>=70?T.green:(c.avg_watch_percent||0)>=40?"#f39c12":T.red}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:600}}>{c.avg_watch_percent||0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </div>

        {/* Daily Active Students */}
        {(data.daily_active||[]).length > 0 && (
          <div style={{background:T.white,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:20,padding:20}}>
            <h3 style={{fontSize:15,fontWeight:600,color:T.navy,margin:"0 0 12px"}}>Daily Active Students (Last 30 Days)</h3>
            <div style={{display:"flex",alignItems:"flex-end",gap:2,height:100}}>
              {data.daily_active.map((d,i) => {
                const max = Math.max(...data.daily_active.map(x => x.active_students), 1);
                const h = (d.active_students / max) * 80;
                return (
                  <div key={i} title={`${fmt(d.session_date)}: ${d.active_students} students`}
                    style={{flex:1,background:T.navy,borderRadius:2,minHeight:2,height:h,opacity:0.7,cursor:"pointer"}}/>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              <span style={{fontSize:10,color:T.muted}}>{fmt(data.daily_active[0]?.session_date)}</span>
              <span style={{fontSize:10,color:T.muted}}>{fmt(data.daily_active[data.daily_active.length-1]?.session_date)}</span>
            </div>
          </div>
        )}

        {/* Inactive Students */}
        <div style={{background:T.white,borderRadius:10,border:`1px solid ${T.border}`,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <h3 style={{fontSize:15,fontWeight:600,color:T.red,margin:0}}>Inactive Students (7+ days)</h3>
            <span style={{padding:"2px 10px",borderRadius:8,fontSize:11,fontWeight:600,background:T.redSoft,color:T.red}}>{(data.inactive_students||[]).length}</span>
          </div>
          {(data.inactive_students||[]).length === 0 ?
            <div style={{padding:30,textAlign:"center",color:T.green,fontSize:14}}>All students are active!</div> :
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:T.bg}}>
                <th style={th}>Student</th><th style={th}>Email</th><th style={th}>Last Active</th><th style={th}>Days Inactive</th>
              </tr></thead>
              <tbody>
                {data.inactive_students.map((s,i) => (
                  <tr key={i} style={{borderTop:`1px solid ${T.border}`}}>
                    <td style={td}><span style={{fontWeight:500,color:T.navy}}>{s.full_name || "Unknown"}</span></td>
                    <td style={td}>{s.email || "-"}</td>
                    <td style={td}>{s.last_active ? fmtFull(s.last_active) : "Never"}</td>
                    <td style={td}><span style={{padding:"2px 10px",borderRadius:8,fontSize:11,fontWeight:600,
                      background:(s.days_inactive||0)>=14?T.redSoft:T.amberSoft,
                      color:(s.days_inactive||0)>=14?T.red:T.amber}}>{s.days_inactive || "?"} days</span></td>
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

const th = { textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:500, color:"#888", textTransform:"uppercase", letterSpacing:0.5 };
const td = { padding:"10px 14px" };
