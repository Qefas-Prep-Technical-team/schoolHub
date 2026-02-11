import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function AnalyticsCharts() {
  // Mock Data for Line Chart
  const performanceTrendData = [
    { name: "Week 1", score: 90 },
    { name: "Week 2", score: 92 },
    { name: "Week 3", score: 88 },
    { name: "Week 4", score: 94 },
    { name: "Week 5", score: 96 },
  ];

  // Mock Data for Bar Chart
  const scoreVsAverageData = [
    { name: "Quizzes", You: 92, ClassAvg: 85 },
    { name: "Assignments", You: 95, ClassAvg: 88 },
  ];

  return (
    <>
      <h2 className="mb-4 text-xl font-bold leading-tight tracking-tight text-text-light dark:text-text-dark">
        Performance Analytics
      </h2>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

        {/* Line Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Your Performance Trend
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Score vs. Class Average
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreVsAverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="You" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ClassAvg" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}
