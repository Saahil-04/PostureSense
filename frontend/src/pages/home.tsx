// Home.tsx
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Activity, Zap, Users } from "lucide-react"
import WebcamCapture from "../components/webcamCapture"
import VideoUpload from "../components/videoUpload"
import PostureAnalysis from "../components/postureAnalysis"
import Dashboard from "../components/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Home() {
    const [analysisData, setAnalysisData] = useState(null)
    const [activeMode, setActiveMode] = useState("upload")

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex justify-center items-center">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                PostureGuard
                            </h1>
                            <p className="text-sm text-gray-600">AI-Powered Posture Analysis</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Zap className="w-3 h-3 mr-1" />
                        Real-time Detection
                    </Badge>
                </div>
            </header>

            {/* Hero */}
            <section className="text-center mt-12 px-4">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Perfect Your Posture with AI</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                    Upload a video or use your webcam to get feedback on your posture during squats or desk work.
                    Our rule-based AI provides instant corrections and expert recommendations.
                </p>
            </section>

            {/* Features */}
            <section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mb-12">
                <Card className="bg-white/60 backdrop-blur-lg shadow">
                    <CardHeader className="items-center text-center">
                        <Camera className="text-blue-600 mx-auto w-8 h-8 mb-2" />
                        <CardTitle>Real-time Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center">
                            Get instant posture feedback using your webcam.
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-lg shadow">
                    <CardHeader className="items-center text-center">
                        <Upload className="text-purple-600 mx-auto w-8 h-8 mb-2" />
                        <CardTitle>Video Upload</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center">
                            Upload workout or desk videos for analysis.
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-lg shadow">
                    <CardHeader className="items-center text-center">
                        <Users className="text-green-600 mx-auto w-8 h-8 mb-2" />
                        <CardTitle>Expert Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center">
                            Rule-based system crafted with fitness & ergonomic expertise.
                        </CardDescription>
                    </CardContent>
                </Card> 
            </section>

            {/* Main Tabs */}
            <section className="max-w-6xl mx-auto px-4">
                <Tabs value={activeMode} onValueChange={setActiveMode}>
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1" /> Upload Video</TabsTrigger>
                        <TabsTrigger value="webcam"><Camera className="w-4 h-4 mr-1" /> Live Webcam</TabsTrigger>
                        <TabsTrigger value="dashboard"><Activity className="w-4 h-4 mr-1" /> Dashboard</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-6">
                        <VideoUpload onAnalysisComplete={setAnalysisData} />
                        {analysisData && <PostureAnalysis data={analysisData} />}
                    </TabsContent>

                    <TabsContent value="webcam" className="space-y-6">
                        <WebcamCapture onAnalysisUpdate={setAnalysisData} />
                        {analysisData && <PostureAnalysis data={analysisData} isRealTime />}
                    </TabsContent>

                    <TabsContent value="dashboard">
                        <Dashboard analysisHistory={analysisData ? [analysisData] : []} />
                    </TabsContent>
                </Tabs>
            </section>

            {/* Footer */}
            <footer className="mt-16 border-t bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-8 text-center text-gray-600">
                    <p className="mb-2">Built with ❤️ for Realfy Technical Assessment</p>
                    <p className="text-sm">Powered by MediaPipe, OpenCV, and React | AI Posture Detection</p>
                </div>
            </footer>
        </div>
    )
}
