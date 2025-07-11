import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Camera, CheckCircle, AlertCircle, Play, Pause, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface WebcamCaptureProps {
    onAnalysisUpdate: (data: any) => void;
}

export default function WebcamCapture({ onAnalysisUpdate }: WebcamCaptureProps) {
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisType, setAnalysisType] = useState<"squat" | "desk">("squat");
    const [error, setError] = useState<string | null>(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const captureAndAnalyze = async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        try {
            setIsAnalyzing(true);
            setProgress(15);
            setError(null);

            const blob = await (await fetch(imageSrc)).blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append("file", file);
            formData.append("posture_type", analysisType);

            const response = await axios.post(`${baseUrl}/analyze`, formData, {
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / (e.total || 1));
                    setProgress(Math.min(percent, 90));
                },
            });

            setProgress(100);
            onAnalysisUpdate(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze image.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        if (!capturing) return;
        const interval = setInterval(() => {
            captureAndAnalyze();
        }, 2500);
        return () => clearInterval(interval);
    }, [capturing, analysisType]);

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Camera className="w-5 h-5" />
                        <span>Webcam Posture Detection</span>
                    </CardTitle>
                    <CardDescription>Live analysis using your webcam to detect bad squat or desk posture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Analysis Type Selection */}
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

                    {/* Webcam Preview */}
                    <div className="relative rounded-lg overflow-hidden border shadow-md bg-black">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-64 object-contain"
                        />
                        <Badge variant="secondary" className="absolute bottom-4 right-4 bg-white/20 text-white backdrop-blur">
                            {capturing ? "Capturing..." : "Paused"}
                        </Badge>
                    </div>

                    {/* Controls */}
                    <div className="flex space-x-4">
                        <Button onClick={() => setCapturing(!capturing)} className="flex-1">
                            {capturing ? (
                                <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause Detection
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Detection
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={captureAndAnalyze}>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Manual Capture
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    {isAnalyzing && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Analyzing frame...</span>
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

                    {/* Success Alert */}
                    {progress === 100 && !isAnalyzing && !error && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                Frame analyzed. Feedback updated.
                            </AlertDescription>
                        </Alert>
                    )}
                    {/* Analysis Result */}
                    {/* {lastResult && (
                        <div className="mt-4 p-4 rounded bg-gray-50 border text-sm text-gray-800">
                            <strong>Analysis Result:</strong>
                            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(lastResult, null, 2)}</pre>
                        </div>
                    )} */}
                </CardContent>
            </Card>
        </div>
    );
}