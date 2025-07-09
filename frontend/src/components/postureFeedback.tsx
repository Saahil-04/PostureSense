interface Issue {
  type: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  angle?: number;
}

interface Props {
  score: number;
  issues: Issue[];
  recommendations: string[];
  posture_type: string;
}

const severityColors = {
  LOW: "bg-green-700",
  MEDIUM: "bg-yellow-600",
  HIGH: "bg-red-600",
};

export default function PostureFeedback({ score, issues, recommendations, posture_type }: Props) {
  return (
    <div className="w-full max-w-xl p-4 rounded-lg bg-zinc-800 text-white shadow-md">
      <h2 className="text-2xl font-bold capitalize mb-2">{posture_type} Posture Report</h2>
      <p className="text-lg mb-4">Posture Score: <span className="font-semibold">{score}/100</span></p>

      {issues.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Detected Issues:</h3>
          <ul className="space-y-2">
            {issues.map((issue, idx) => (
              <li key={idx} className={`p-3 rounded ${severityColors[issue.severity]}`}>
                {issue.description} <span className="italic text-sm">({issue.severity})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Recommendations:</h3>
          <ul className="list-disc pl-6 space-y-1">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
