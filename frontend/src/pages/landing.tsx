import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white flex flex-col items-center justify-center px-6 text-center space-y-6">
      <motion.h1
        className="text-5xl font-bold"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        PostureSense
      </motion.h1>
      <p className="text-lg max-w-xl">
        An AI-powered tool that helps you detect and fix bad posture—whether you're working at a desk or doing squats.
      </p>
      <motion.button
        onClick={() => navigate("/analyze")}
        whileHover={{ scale: 1.05 }}
        className="px-6 py-3 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition"
      >
        Start Posture Analysis
      </motion.button>
    </div>
  );
}
