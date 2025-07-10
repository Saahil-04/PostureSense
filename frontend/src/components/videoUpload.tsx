import { useState, useRef } from "react";
import axios from "axios";
import { Upload, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface VideoUploadProps {
  onAnalysisComplete: (data: any) => void;
}

export default function VideoUpload({ onAnalysisComplete }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analysisType, setAnalysisType] = useState<"squat" | "desk">("squat");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a valid video file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please drop a valid video file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("posture_type", analysisType);

      const response = await axios.post("http://localhost:8000/analyze", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(Math.min(percent, 90));
        },
      });

      setProgress(100);
      onAnalysisComplete(response.data);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Video for Analysis</span>
          </CardTitle>
          <CardDescription>
            Upload a video of your squat or desk posture to get AI-powered feedback and improvement tips.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Posture type selection */}
          <div className="flex space-x-4">
            <Button
              variant={analysisType === "squat" ? "default" : "outline"}
              onClick={() => setAnalysisType("squat")}
              className="flex-1"
            >
              Squat
            </Button>
            <Button
              variant={analysisType === "desk" ? "default" : "outline"}
              onClick={() => setAnalysisType("desk")}
              className="flex-1"
            >
              Desk
            </Button>
          </div>

          {/* File upload area or video preview */}
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">Drop your video here or click to browse</p>
              <p className="text-sm text-gray-500">Supports MP4, MOV, AVI formats</p>
              <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={URL.createObjectURL(selectedFile)}
                  className="w-full h-64 object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={togglePlayback}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={resetVideo}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    {selectedFile.name}
                  </Badge>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1">
                  {isAnalyzing ? "Analyzing..." : "Analyze Posture"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                  Remove
                </Button>
              </div>
            </>
          )}

          {/* Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing video...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success */}
          {progress === 100 && !isAnalyzing && !error && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Analysis complete. Check the results below!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
