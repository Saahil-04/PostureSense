import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import ChooseMethod from "./pages/chooseMethod";
import WebcamAnalyzer from "./pages/webCamAnalyzer";
import VideoAnalyzer from "./pages/videoAnalyzer";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyze" element={<ChooseMethod />} />
        <Route path="/analyze/webcam" element={<WebcamAnalyzer />} />
        <Route path="/analyze/upload" element={<VideoAnalyzer />} />
      </Routes>
    </Router>
  );
}

export default App;
