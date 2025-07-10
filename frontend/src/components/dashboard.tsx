import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Issue {
  type: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  angle?: number | null;
}

interface AnalysisData {
  posture_type: "squat" | "desk";
  score: number;
  issues: Issue[];
  recommendations: string[];
  timestamp?: string; 
}

interface DashboardProps {
  analysisHistory: AnalysisData[];
}

export default function Dashboard({ analysisHistory }: DashboardProps) {
  if (!analysisHistory.length) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p>No analysis data available yet. Start by uploading a video or using the webcam.</p>
      </div>
    );
  }

  const severityColor = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-800",
  };

  const severityIcon = {
    LOW: <CheckCircle className="w-4 h-4 mr-1" />,
    MEDIUM: <AlertTriangle className="w-4 h-4 mr-1" />,
    HIGH: <XCircle className="w-4 h-4 mr-1" />,
  };

  return (
    <div className="grid gap-6">
      {analysisHistory.map((entry, index) => (
        <Card key={index} className="bg-white/60 backdrop-blur-sm shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="capitalize">{entry.posture_type} Posture</CardTitle>
                <CardDescription>Score: <span className="font-medium">{entry.score}/100</span></CardDescription>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Flame className="w-4 h-4 mr-1" />
                Analysis #{index + 1}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-sm text-gray-700 mb-1">Detected Issues:</p>
              {entry.issues.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-gray-800 text-sm">
                  {entry.issues.map((issue, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityColor[issue.severity]}`}
                      >
                        {severityIcon[issue.severity]}
                        {issue.severity}
                      </span>
                      <span>{issue.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 text-sm">No posture issues detected. Great job!</p>
              )}
            </div>

            <div>
              <p className="font-semibold text-sm text-gray-700 mb-1">Recommendations:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {entry.recommendations.map((rec, j) => (
                  <li key={j}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
