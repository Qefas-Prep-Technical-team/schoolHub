import { FileText, HelpCircle, BookOpen } from 'lucide-react'

const items = [
  {
    id: 1,
    title: 'Algebra Mid-term',
    date: 'Oct 12, 2023',
    score: '88/100',
    rank: 'Top 10%',
    icon: <FileText className="size-5" />,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    id: 2,
    title: 'Quadratic Quiz',
    date: 'Oct 05, 2023',
    score: '10/10',
    rank: 'Perfect',
    icon: <HelpCircle className="size-5" />,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    id: 3,
    title: 'Homework #4',
    date: 'Sep 28, 2023',
    score: '18/20',
    rank: 'Avg',
    icon: <BookOpen className="size-5" />,
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
]

export default function GradedItems() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
          Recent Graded Items
        </h4>
        <a href="#" className="text-xs text-primary font-medium hover:underline">
          View All
        </a>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {item.date}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                {item.score}
              </p>
              <p className={`text-[10px] font-medium ${
                item.rank === 'Perfect' || item.rank === 'Top 10%'
                  ? 'text-green-600'
                  : 'text-text-secondary-light dark:text-text-secondary-dark'
              }`}>
                {item.rank}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}