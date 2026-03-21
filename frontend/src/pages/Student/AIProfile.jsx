import { useState, useEffect } from "react";
import { generateProfile, getMyProfile, toggleVisibility } from "../../services/profileApi";

export default function AIProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyProfile();
      setProfile(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        setError("Failed to load profile");
      }
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await generateProfile(profile ? true : false);
      alert(res.data.message || "Profile generated!");
      await loadProfile();
    } catch (err) {
      setError(err.response?.data?.detail || "Generation failed. Try again.");
    }
    setGenerating(false);
  };

  const handleToggle = async () => {
    if (!profile) return;
    const newVis = profile.visibility === "public" ? "private" : "public";
    try {
      await toggleVisibility(newVis);
      await loadProfile();
    } catch (err) {
      setError("Failed to update visibility");
    }
  };

  const copyUrl = () => {
    if (profile?.public_url) {
      navigator.clipboard.writeText(profile.public_url);
      alert("URL copied!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">AI Profile Builder</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Generate a professional, recruiter-ready portfolio from your course data,
            test scores, and case study results — in one click.
          </p>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? "Generating... (takes ~15 seconds)" : "Generate My Profile"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {profile.student_name || "My AI Profile"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Status: <span className="text-green-600 font-medium">{profile.status}</span>
              {" · "}
              Visibility: <span className={profile.visibility === "public" ? "text-blue-600 font-medium" : "text-gray-500 font-medium"}>
                {profile.visibility?.toUpperCase()}
              </span>
              {" · "}
              Views: {profile.views || 0}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleToggle}
              className={profile.visibility === "public"
                ? "px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                : "px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
              }
            >
              {profile.visibility === "public" ? "Make Private" : "Make Public"}
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              {generating ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
        </div>

        {profile.public_url && profile.visibility === "public" && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
            <span className="text-blue-600 text-sm font-medium">Public URL:</span>
            <a href={profile.public_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm truncate">
              {profile.public_url}
            </a>
            <button onClick={copyUrl} className="ml-auto text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded">
              Copy
            </button>
          </div>
        )}
      </div>

      {profile.summary && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Professional Summary</h3>
          <p className="text-gray-600 leading-relaxed">{profile.summary}</p>
        </div>
      )}

      {profile.skills && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Key Skills</h3>
          {["technical_skills", "tools", "soft_skills", "domain_knowledge"].map((cat) => {
            const items = profile.skills[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat} className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {cat.replace(/_/g, " ")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((s, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                      {s.name} · {s.score}%
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {profile.performance && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Performance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Overall", value: (profile.performance.overall_score || 0) + "%" },
              { label: "Tests", value: profile.performance.total_tests || 0 },
              { label: "Case Studies", value: profile.performance.total_case_studies || 0 },
              { label: "Courses", value: profile.performance.total_courses || 0 },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}