import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    Lightbulb,
    Activity,
    Ruler,
} from "lucide-react"

interface Issue {
    type: string
    description: string
    severity: "LOW" | "MEDIUM" | "HIGH"
    angle?: number | null
}

interface PostureData {
    posture_type: "desk" | "squat"
    score: number
    issues: Issue[]
    recommendations: string[]
}

interface PostureAnalysisProps {
    data: PostureData
    isRealTime?: boolean
}

const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
}

const getBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
}

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case "HIGH":
            return "bg-red-100 text-red-800"
        case "MEDIUM":
            return "bg-yellow-100 text-yellow-800"
        case "LOW":
            return "bg-blue-100 text-blue-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

export default function PostureAnalysis({ data, isRealTime = false }: PostureAnalysisProps) {
    if (!data) return null

    return (
        <div className="space-y-6">
            {/* Score Card */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5" />
                            <span>
                                {isRealTime ? "Real-time" : "Posture"} Analysis –{" "}
                                {data.posture_type === "desk" ? "Desk" : "Squat"}
                            </span>
                        </div>
                        <Badge variant={getBadgeVariant(data.score)} className="text-lg px-3 py-1">
                            {data.score}/100
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        {isRealTime ? "Live feedback based on your camera feed" : "Detailed analysis of uploaded input"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Overall Score</span>
                            <span className={`text - 2xl font-bold ${getScoreColor(data.score)}`}>{data.score}%</span>

                        </div>
                        <Progress value={data.score} className="h-3" />
                        <p className="text-sm text-gray-600">
                            {data.score >= 80
                                ? "Excellent posture!"
                                : data.score >= 60
                                    ? "Good posture, minor corrections needed"
                                    : "Significant posture issues detected"}
                        </p>
                    </div>
                </CardContent>
            </Card>
            {/* Issues Card */}
            {
                data.issues.length > 0 && (
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                <span>Issues Detected</span>
                            </CardTitle>
                            <CardDescription>Posture problems found during analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.issues.map((issue, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-white/70 backdrop-blur"
                                >
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                        <div>
                                            <div className="font-semibold">{issue.description}</div>
                                            {issue.angle && (
                                                <div className="text-xs text-gray-600 flex items-center mt-0.5">
                                                    <Ruler className="w-3 h-3 mr-1" />
                                                    Approx angle: {Math.round(issue.angle)}°
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )
            }

            {/* Recommendations */}
            {
                data.recommendations.length > 0 && (
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Lightbulb className="w-5 h-5 text-yellow-600" />
                                <span>Recommendations</span>
                            </CardTitle>
                            <CardDescription>Tips to improve your posture</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.recommendations.map((tip, idx) => (
                                <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
                                    <span className="text-blue-800">{tip}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )
            }
        </div>
    );
}