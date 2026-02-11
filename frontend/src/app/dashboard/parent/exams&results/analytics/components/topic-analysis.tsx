"use client"

interface Topic {
  name: string
  type: 'strength' | 'weakness'
}

export default function TopicAnalysis() {
  const strengths: Topic[] = [
    { name: 'Algebra', type: 'strength' },
    { name: 'Mental Math', type: 'strength' },
    { name: 'Graphs', type: 'strength' }
  ]

  const weaknesses: Topic[] = [
    { name: 'Word Problems', type: 'weakness' },
    { name: 'Fractions', type: 'weakness' }
  ]

  const getTopicStyles = (type: Topic['type']) => {
    return type === 'strength'
      ? {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-300',
          border: 'border-green-100 dark:border-green-800/30'
        }
      : {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          text: 'text-orange-700 dark:text-orange-300',
          border: 'border-orange-100 dark:border-orange-800/30'
        }
  }

  return (
    <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Topic Analysis
      </h3>
      
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Strongest Topics
        </p>
        <div className="flex flex-wrap gap-2">
          {strengths.map((topic) => {
            const styles = getTopicStyles(topic.type)
            return (
              <span
                key={topic.name}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${styles.bg} ${styles.text} ${styles.border}`}
              >
                {topic.name}
              </span>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Areas to Improve
        </p>
        <div className="flex flex-wrap gap-2">
          {weaknesses.map((topic) => {
            const styles = getTopicStyles(topic.type)
            return (
              <span
                key={topic.name}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${styles.bg} ${styles.text} ${styles.border}`}
              >
                {topic.name}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}