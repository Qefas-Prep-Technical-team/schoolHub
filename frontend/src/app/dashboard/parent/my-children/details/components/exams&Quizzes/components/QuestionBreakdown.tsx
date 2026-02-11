interface Question {
  id: string
  number: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  result: 'correct' | 'incorrect'
}

const questions: Question[] = [
  {
    id: '1',
    number: 'Q1',
    topic: 'Linear Algebra',
    difficulty: 'Easy',
    result: 'correct',
  },
  {
    id: '2',
    number: 'Q2',
    topic: 'Trigonometry',
    difficulty: 'Medium',
    result: 'correct',
  },
  {
    id: '3',
    number: 'Q3',
    topic: 'Calculus (Derivatives)',
    difficulty: 'Hard',
    result: 'incorrect',
  },
]

const difficultyConfig = {
  Easy: {
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  Medium: {
    className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  },
  Hard: {
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
}

export default function QuestionBreakdown() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-text-sec-light dark:text-text-sec-dark">
          Question Breakdown
        </h4>
        <button className="text-xs font-bold text-primary hover:underline transition-colors">
          View All Questions
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border-light dark:border-border-dark">
        <table className="w-full text-left text-sm">
          <thead className="bg-background-light dark:bg-background-dark text-text-sec-light dark:text-text-sec-dark">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Topic</th>
              <th className="px-4 py-3 font-medium">Difficulty</th>
              <th className="px-4 py-3 font-medium text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark bg-surface-light dark:bg-surface-dark">
            {questions.map((question) => (
              <tr key={question.id}>
                <td className="px-4 py-3 text-text-sec-light dark:text-text-sec-dark">
                  {question.number}
                </td>
                <td className="px-4 py-3 font-medium">{question.topic}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${difficultyConfig[question.difficulty].className}`}>
                    {question.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {question.result === 'correct' ? (
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      <span className="material-symbols-outlined align-middle text-[18px]">check</span>
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold">
                      <span className="material-symbols-outlined align-middle text-[18px]">close</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}