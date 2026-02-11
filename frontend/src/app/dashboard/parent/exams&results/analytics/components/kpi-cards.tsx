"use client"

interface KPICard {
  title: string
  value: string
  subValue?: string
  description?: string
  trend?: {
    label: string
    isPositive: boolean
  }
  progress?: number
  icon: string
  iconColor: string
  iconBgColor: string
  statColor?: string
}

export default function KPICards() {
  const kpis: KPICard[] = [
    {
      title: 'Current Grade',
      value: '88%',
      subValue: '(A)',
      progress: 88,
      icon: 'grade',
      iconColor: 'text-primary',
      iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Weighted average of all assessments'
    },
    {
      title: 'Term Improvement',
      value: '+12%',
      trend: { label: 'VS Term 1', isPositive: true },
      icon: 'trending_up',
      iconColor: 'text-green-600 dark:text-green-500',
      iconBgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Great job! Sarah is showing consistent growth in algebra.'
    },
    {
      title: 'Class Percentile',
      value: 'Top 15%',
      icon: 'leaderboard',
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
      statColor: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="group relative overflow-hidden bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {kpi.title}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className={`text-3xl font-black ${kpi.statColor || 'text-slate-900 dark:text-white'}`}>
                  {kpi.value}
                  {kpi.subValue && (
                    <span className="text-lg text-slate-400 font-semibold">
                      {kpi.subValue}
                    </span>
                  )}
                </h3>
                {kpi.trend && (
                  <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                    kpi.trend.isPositive
                      ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                      : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    <span className="material-symbols-outlined text-sm -ml-1">
                      {kpi.trend.isPositive ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    {kpi.trend.label}
                  </span>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${kpi.iconBgColor} ${kpi.iconColor}`}>
              <span className="material-symbols-outlined">{kpi.icon}</span>
            </div>
          </div>

          {kpi.progress !== undefined && (
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full"
                style={{ width: `${kpi.progress}%` }}
              ></div>
            </div>
          )}

          {kpi.description && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {kpi.description}
            </p>
          )}

          {/* Student avatars for percentile card */}
          {index === 2 && (
            <div className="flex items-center gap-2 mt-4">
              <div className="flex -space-x-2 overflow-hidden">
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBGo1ayCniDe7Bkj2zt2MDExePk8aoGW9UHT-_O8vxrR1TvSiFepEtp9-YNfJQaggYackFwyFP6uTgz5ZxsDkuv283RLdat2V7zKeloanCbOwMxTOZnjKOol3ZzKrMASTiZerpT9HJfsQKDHEg4Uk0rmiI6RNSBYEgA8bCohXVuBwpo5vC5Io_GdW9uVN3cnAEic8gsEE9NKA9Hrp9SIS1iso0Y7XPO9rYQrNOb9oxcQv28xf-okZNy28y-F2mS7q47E2kXM9FwuhY',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAyrySsYkoNlPtJCMYF4QTdTyA51_Zf-hD65lYTaklsG4suQ8XGb-GyGW0mbc0uJrHzWJjChEDladPtNNRBq8zjZMXl47KLTqjeqsKlzH9cZc_f8LMEYPOCX4M8GUIoeYguzWpLbOT6U7WCitrfjGjX-BfNrmTX3x3X_9lS4j6ltyyeyECZ4GFzew62kgK0FK0LxUXv85rz8cp69Xjn_sht_mW6RvUL4E9egeQuTkhPWGMmBALVf6LjUKMnQuWd2aeRSuEJKeVHVsY',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCELuwkyTjO4u_pTEFeKndCLKq9LmArwuMNr5ivdk7iJsOkf-eiVjfi9R4kEZe0eQPgqLDAsD1bpr48cA9ZlOhAE_kxoEb2LDpHpS6DVyvS2sSUUOTBrNBzcmRUE_43aXYIfM6-oLoEDvs_SFmtCihyjC1E74kgpSiMJTyLyVEvIgzHVWd6Y9v3wNiuMqn-Rjl_JyrryOxubEQ7vkkLikTXAQMLb2G0mcTOGRz5iCAIUrbmmzErAjaJj9kWVWwJhxT_h6j-k04_91w'
                ].map((url, i) => (
                  <div
                    key={i}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-card-dark bg-cover bg-center"
                    style={{ backgroundImage: `url("${url}")` }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ahead of 24 students
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}