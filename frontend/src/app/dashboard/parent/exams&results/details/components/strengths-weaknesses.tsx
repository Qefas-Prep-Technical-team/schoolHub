"use client"

interface Strength {
  name: string
}

interface Weakness {
  name: string
  description: string
}

export default function StrengthsWeaknesses() {
  const strengths: Strength[] = [
    { name: 'Algebra' },
    { name: 'Geometry' },
    { name: 'Problem Solving' }
  ]

  const weaknesses: Weakness[] = [
    {
      name: 'Derivatives',
      description: 'Missed 2 questions'
    },
    {
      name: 'Word Problems',
      description: 'Time management issue'
    }
  ]

  const handleResourcesClick = (topic: string) => {
    console.log(`Resources for ${topic} clicked`)
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-6">
      {/* Strengths */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-green-600 dark:text-green-400">
              thumb_up
            </span>
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white">
            Areas of Strength
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {strengths.map((strength) => (
            <span
              key={strength.name}
              className="px-3 py-1 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg border border-green-100 dark:border-green-900/20"
            >
              {strength.name}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

      {/* Weaknesses */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="size-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-orange-600 dark:text-orange-400">
              priority_high
            </span>
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white">
            Needs Improvement
          </h4>
        </div>
        <div className="flex flex-col gap-2">
          {weaknesses.map((weakness) => (
            <div
              key={weakness.name}
              className="flex items-start justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                  {weakness.name}
                </span>
                <span className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                  {weakness.description}
                </span>
              </div>
              <button
                onClick={() => handleResourcesClick(weakness.name)}
                className="text-primary text-xs font-bold hover:underline self-center"
              >
                Resources
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}