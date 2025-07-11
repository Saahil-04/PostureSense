import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, AlertTriangle, ArrowRightCircle } from "lucide-react"

interface DashboardProps {
  analysisHistory: {
    posture_type: string
    score: number
    issues: {
      type: string
      description: string
      severity: "LOW" | "MEDIUM" | "HIGH"
      angle?: number | null
    }[]
    recommendations: string[]
    timestamp?: string
  }[]
}

export default function Dashboard({ analysisHistory }: DashboardProps) {
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

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <span>Analysis History</span>
          </CardTitle>
          <CardDescription>Log of your posture check sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {analysisHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No history yet. Upload a video or try the webcam!</p>
          ) : (
            <ScrollArea className="h-[400px] pr-3">
              <div className="space-y-4">
                {analysisHistory.map((entry, i) => (
                  <Card key={i} className="bg-white/70 border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="capitalize">{entry.posture_type} posture</span>
                        <Badge variant="secondary">{entry.score}/100</Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "Recent"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Issues */}
                      {entry.issues?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-700">Issues</p>
                          <ul className="space-y-1 text-sm">
                            {entry.issues.map((issue, j) => (
                              <li key={j} className="flex items-center justify-between border rounded px-2 py-1">
                                <span>{issue.description}{issue.angle ? ` (${issue.angle}°)` : ""}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(issue.severity)}`}>
                                  {issue.severity}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {entry.recommendations?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-gray-700">Recommendations</p>
                          <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                            {entry.recommendations.map((rec, k) => (
                              <li key={k} className="flex items-start">
                                <ArrowRightCircle className="w-3.5 h-3.5 mt-1 mr-2 text-blue-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.issues?.length === 0 && (
                        <p className="text-green-600 text-sm flex items-center gap-2 mt-2">
                          <AlertTriangle className="w-4 h-4" /> No issues detected. Great job!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
