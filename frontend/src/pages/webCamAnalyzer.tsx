import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import PostureFeedback from "../components/postureFeedback";

export default function WebcamAnalyzer() {
  const webcamRef = useRef<Webcam>(null);
  const [result, setResult] = useState<any>(null);
  const [postureType, setPostureType] = useState<"squat" | "desk" | "">("");
  const [analyzing, setAnalyzing] = useState(false);

  const captureAndAnalyze = async () => {
    if (!webcamRef.current || !postureType) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await (await fetch(imageSrc)).blob();
    const file = new File([blob], "frame.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("posture_type", postureType);

    try {
      const res = await axios.post("http://localhost:8000/analyze", formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!postureType) return;

    setAnalyzing(true);
    const interval = setInterval(captureAndAnalyze, 2000);

    return () => {
      clearInterval(interval);
      setAnalyzing(false);
    };
  }, [postureType]);

  const handleReset = () => {
    setPostureType("");
    setResult(null);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold">Real-Time Posture Detection</h1>

      {!postureType ? (
        <div className="space-y-4">
          <p className="text-lg">Choose your posture type:</p>
          <div className="flex gap-4">
            <button
              onClick={() => setPostureType("squat")}
              className="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded-lg"
            >
              Squat
            </button>
            <button
              onClick={() => setPostureType("desk")}
              className="bg-green-600 hover:bg-green-800 px-4 py-2 rounded-lg"
            >
              Desk
            </button>
          </div>
        </div>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-xl shadow-xl max-w-md w-full"
          />
          <p className="text-gray-400">
            {analyzing
              ? `Analyzing posture: ${postureType}...`
              : `Paused`}
          </p>
          <button
            onClick={handleReset}
            className="mt-4 text-sm underline text-red-400"
          >
            Change Posture Type
          </button>
        </>
      )}

      {result && <PostureFeedback {...result} />}
    </div>
  );
}
