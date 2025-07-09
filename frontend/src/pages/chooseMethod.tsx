import { useNavigate } from "react-router-dom";

export default function ChooseMethod() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center px-6 space-y-6">
            <h2 className="text-3xl font-bold mb-2">Select Input Method</h2>
            <p className="text-gray-400 mb-4 text-center max-w-md">
                You can use your webcam for real-time posture detection or upload a recorded video for full analysis.
            </p>
            <div className="flex gap-6">
                <button
                    onClick={() => navigate("/analyze/webcam")}
                    className="px-6 py-3 bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Use Webcam
                </button>
                <button
                    onClick={() => navigate("/analyze/upload")}
                    className="px-6 py-3 bg-green-600 rounded-md hover:bg-green-700"
                >
                    Upload Video
                </button>
            </div>
        </div>
    );
}
