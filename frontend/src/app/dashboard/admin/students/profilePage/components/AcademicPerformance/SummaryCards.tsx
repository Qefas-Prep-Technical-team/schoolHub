// app/components/SummaryCards.jsx
export default function SummaryCards() {
  const cards = [
    {
      icon: 'star_half',
      bgColor: 'bg-primary/20',
      textColor: 'text-primary',
      label: 'Overall Average',
      value: '88%'
    },
    {
      icon: 'trending_up',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
      label: 'Highest Subject',
      value: 'Physics: 95%'
    },
    {
      icon: 'trending_down',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-600 dark:text-red-400',
      label: 'Lowest Subject',
      value: 'History: 76%'
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className={`${card.bgColor} ${card.textColor} p-3 rounded-full`}>
            <span className="material-symbols-outlined">{card.icon}</span>
          </div>
          <div>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
              {card.label}
            </p>
            <p className={`text-lg font-bold text-text-light dark:text-text-dark ${
              index === 0 ? 'text-2xl' : ''
            }`}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}