export default function ScoreCard({ result }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getBarColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-gray-500 mb-1">
            Language: <span className="text-blue-400">{result.language}</span>
          </div>
          <div className="text-xs text-gray-500">
            Engine: <span className="text-blue-400">{result.aiEngine}</span>
          </div>
        </div>
        <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
          {result.score}
        </div>
      </div>

      {/* Score Bar */}
      <div className="w-full bg-gray-200 dark:bg-[#30363d] rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${getBarColor(result.score)}`}
          style={{ width: `${result.score}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
        {result.summary}
      </p>
    </div>
  );
}