interface TrendData {
  month: string
  value: number
  isCurrent: boolean
}

const trendData: TrendData[] = [
  { month: 'Aug', value: 92, isCurrent: false },
  { month: 'Sep', value: 98, isCurrent: false },
  { month: 'Oct', value: 96, isCurrent: true },
  { month: 'Nov', value: 0, isCurrent: false },
]

export default function TrendsChart() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">
        Monthly Trends
      </h3>
      
      {/* CSS-only Bar Chart */}
      <div className="flex items-end gap-3 h-48 w-full pb-2 border-b border-gray-200 dark:border-gray-700">
        {trendData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 gap-2 group">
            <div
              className={`w-full rounded-t-lg relative transition-all group-hover:opacity-90 ${
                item.isCurrent
                  ? 'bg-primary shadow-md shadow-primary/20'
                  : item.value > 0
                  ? 'bg-primary/20 dark:bg-primary/30 group-hover:bg-primary/40'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
              style={{ height: `${item.value}%` }}
            >
              <div
                className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity ${
                  item.isCurrent ? 'text-primary' : 'text-gray-500'
                }`}
              >
                {item.value > 0 ? `${item.value}%` : ''}
              </div>
            </div>
            <span
              className={`text-xs font-medium ${
                item.isCurrent
                  ? 'text-primary font-bold'
                  : item.value > 0
                  ? 'text-gray-400'
                  : 'text-gray-300'
              }`}
            >
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}