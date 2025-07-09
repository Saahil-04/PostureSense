import { useState } from "react";
import axios from "axios";
import PostureFeedback from "../components/postureFeedback";

export default function VideoAnalyzer() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [postureType, setPostureType] = useState<"squat" | "desk" | "">("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !postureType) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("posture_type", postureType); // ✅ Fix applied

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/analyze", formData);
      setResult(res.data);
    } catch (err) {
      console.error("Error analyzing video:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Analyze Posture from Video</h1>

      <select
        value={postureType}
        onChange={(e) => setPostureType(e.target.value as "squat" | "desk")}
        className="p-2 rounded bg-gray-800 text-white border border-gray-600"
      >
        <option value="">-- Select Posture Type --</option>
        <option value="squat">Squat</option>
        <option value="desk">Desk Sitting</option>
      </select>

      <input
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        disabled={!postureType}
        className="text-white"
      />

      {loading && <p className="text-gray-400">Analyzing video...</p>}

      {result && <PostureFeedback {...result} />}
    </div>
  );
}
