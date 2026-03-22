// ===== RANJANA'S CODE: AI Enhancer Component =====
// Independent from Dashboard.jsx — imported as a component
// Agent URL: https://upskill25-ai-enhancer.hf.space

import { useState, useEffect } from "react";
import { Sparkles, Eye } from "lucide-react";

const AGENT_URL = import.meta.env.VITE_AGENT_URL || "https://upskill25-ai-enhancer.hf.space";

export default function AIEnhancer({ showMsg }) {
  const [aiProfile, setAiProfile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  // Auto-load existing profile on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${AGENT_URL}/api/v1/profile/me`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.slug && data.status === "completed") {
            let html = null;
            try {
              const htmlRes = await fetch(`${AGENT_URL}/api/v1/profile/public/${data.slug}`);
              if (htmlRes.ok) html = await htmlRes.text();
            } catch {}
            setAiProfile({
              slug: data.slug, html,
              url: data.public_url || `${AGENT_URL}/api/v1/profile/public/${data.slug}`,
              download_url: data.download_url || `${AGENT_URL}/api/v1/profile/download/${data.slug}`,
              visibility: data.visibility || "private",
              student_name: data.student_name,
              views: data.views || 0,
              time: null,
            });
          }
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setAiProfile(null);
    try {
      const res = await fetch(`${AGENT_URL}/api/v1/profile/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ force_regenerate: true }),
      });
      const data = await res.json();
      if (res.ok && data.slug) {
        let html = null;
        try {
          const htmlRes = await fetch(`${AGENT_URL}/api/v1/profile/public/${data.slug}`);
          if (htmlRes.ok) html = await htmlRes.text();
        } catch {}
        setAiProfile({
          slug: data.slug, html,
          url: data.profile_url,
          download_url: data.download_url || `${AGENT_URL}/api/v1/profile/download/${data.slug}`,
          time: data.generation_time,
          visibility: "private",
          views: 0,
        });
      } else {
        setError(data.detail || data.message || "Failed to generate profile.");
      }
    } catch {
      setError("Could not connect to AI agent. Please try again later.");
    }
    setGenerating(false);
  };

  const handleToggleVisibility = async () => {
    if (!aiProfile) return;
    const newVis = aiProfile.visibility === "public" ? "private" : "public";
    try {
      const res = await fetch(`${AGENT_URL}/api/v1/profile/toggle-visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ visibility: newVis }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiProfile(prev => ({ ...prev, visibility: data.visibility, url: data.public_url || prev.url }));
        if (showMsg) showMsg("success", `Profile is now ${data.visibility}`);
      }
    } catch {
      if (showMsg) showMsg("error", "Failed to update visibility");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTop: "3px solid #f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontSize: 13, color: "#6b7280" }}>Loading your profile...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No profile yet — show generate button
  if (!aiProfile) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#1A2744,#2a3f6f)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>🚀</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1a2744", marginBottom: 8 }}>Generate Your AI Profile</h3>
        <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 480, margin: "0 auto 8px", lineHeight: 1.6 }}>
          Our AI reads your courses, quiz scores, case studies, psychometric results, and all LMS activity — then creates a professional, recruiter-ready profile in seconds.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, margin: "16px 0 24px" }}>
          {["📚 Courses", "📝 Quiz Scores", "📋 Case Studies", "🧠 Psychometric", "📊 Performance", "🏆 Certificates"].map(item => (
            <span key={item} style={{ fontSize: 12, padding: "5px 12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 20, color: "#6b7280" }}>{item}</span>
          ))}
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 16, maxWidth: 480, margin: "0 auto 16px" }}>
            <p style={{ fontSize: 13, color: "#dc2626" }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{ fontSize: 15, padding: "14px 32px", borderRadius: 10, background: "#1a2744", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, opacity: generating ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(26,39,68,.2)" }}
        >
          <Sparkles size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
          {generating ? "Generating Profile..." : "✨ Generate My AI Profile"}
        </button>

        {generating && (
          <div style={{ marginTop: 20 }}>
            <div style={{ width: 24, height: 24, border: "3px solid #e5e7eb", borderTop: "3px solid #f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
            <p style={{ fontSize: 13, color: "#6b7280" }}>AI is analyzing your LMS data and building your profile...</p>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>This takes 10-15 seconds</p>
          </div>
        )}
      </div>
    );
  }

  // Profile exists — show it with controls
  return (
    <div>
      {/* Header with controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1a2744", marginBottom: 4 }}>✅ AI Profile Generated!</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            {aiProfile.time && <span style={{ fontSize: 12, color: "#9ca3af" }}>Generated in {aiProfile.time}s</span>}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
              background: aiProfile.visibility === "public" ? "#dcfce7" : "#f1f5f9",
              color: aiProfile.visibility === "public" ? "#16a34a" : "#64748b"
            }}>
              {aiProfile.visibility === "public" ? "🌐 PUBLIC" : "🔒 PRIVATE"}
            </span>
            {aiProfile.views > 0 && <span style={{ fontSize: 11, color: "#9ca3af" }}>{aiProfile.views} views</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handleToggleVisibility} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>
            {aiProfile.visibility === "public" ? "🔒 Make Private" : "🌐 Make Public"}
          </button>
          <a href={`${AGENT_URL}/api/v1/profile/public/${aiProfile.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, background: "#1a2744", color: "#fff", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Eye size={13} /> View Full Profile
          </a>
          <a href={`${AGENT_URL}/api/v1/profile/download/${aiProfile.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", textDecoration: "none", color: "#1a2744", fontWeight: 600 }}>
            📥 Download PDF
          </a>
          <button onClick={() => { navigator.clipboard.writeText(`${AGENT_URL}/api/v1/profile/public/${aiProfile.slug}`); if (showMsg) showMsg("success", "Profile link copied!"); }} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>
            📋 Copy Link
          </button>
          <button onClick={() => { setAiProfile(null); handleGenerate(); }} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>
            🔄 Regenerate
          </button>
        </div>
      </div>

      {/* Visibility banner */}
      {aiProfile.visibility === "private" && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>Your profile is <b>private</b>. Only you can see it. Click <b>"Make Public"</b> to share with recruiters and corporates.</p>
        </div>
      )}
      {aiProfile.visibility === "public" && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🌐</span>
          <p style={{ fontSize: 12, color: "#166534", margin: 0 }}>Your profile is <b>public</b>. Recruiters and corporates can view it using your shareable link.</p>
        </div>
      )}

      {/* Profile preview */}
      {aiProfile.html ? (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#060912" }}>
          <iframe
            srcDoc={aiProfile.html}
            title="AI Profile Preview"
            style={{ width: "100%", height: 700, border: "none" }}
            sandbox="allow-same-origin"
          />
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 32, background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: 14, color: "#1a2744", fontWeight: 600, marginBottom: 8 }}>Profile generated successfully!</p>
          <p style={{ fontSize: 13, color: "#6b7280" }}>Click "View Full Profile" to see your AI-generated professional profile.</p>
        </div>
      )}
    </div>
  );
}
