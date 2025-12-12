import { MessageSquare } from 'lucide-react'
import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'

interface ScoreBreakdown {
  category: string
  score: string
  percentage: number
  color: 'emerald' | 'yellow'
}

const scoreBreakdowns: ScoreBreakdown[] = [
  { category: 'Content & Analysis', score: '45/50', percentage: 90, color: 'emerald' },
  { category: 'Grammar & Mechanics', score: '22/25', percentage: 88, color: 'emerald' },
  { category: 'Formatting', score: '18/25', percentage: 72, color: 'yellow' },
]

export default function TeacherFeedback() {
  return (
    <Card>
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="text-primary size-5" />
          Teacher Feedback
        </h3>
      </div>
      
      <div className="p-6 flex flex-col gap-6">
        {/* Comment Bubble */}
        <div className="flex gap-4">
          <div className="size-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
            MA
          </div>
          <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl rounded-tl-none">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              &apos;James, this is a very strong submission. You did an excellent job connecting the technological advancements to the social shifts in urban areas. Your point about tenement housing was particularly well-researched. For next time, please double-check your citation formatting for the primary sources.&apos;
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              - Mr. Anderson, Oct 25
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-4">
            Score Breakdown
          </p>
          <div className="flex flex-col gap-4">
            {scoreBreakdowns.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.score}
                  </span>
                </div>
                <ProgressBar
                  value={item.percentage}
                  color={item.color}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}