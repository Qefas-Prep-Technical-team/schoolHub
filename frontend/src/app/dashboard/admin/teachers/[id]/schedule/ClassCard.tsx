interface ClassCardProps {
  course: string
  time: string
  room: string
  color: string
  hasConflict?: boolean
  style?: React.CSSProperties
}

export default function ClassCard({ 
  course, 
  time, 
  room, 
  color,
  hasConflict = false,
  style 
}: ClassCardProps) {
  const colorMap: { [key: string]: { bg: string; border: string } } = {
    math: { bg: 'bg-[#50E3C2]/20', border: 'border-[#50E3C2]' },
    history: { bg: 'bg-[#4A90E2]/20', border: 'border-[#4A90E2]' },
    chemistry: { bg: 'bg-[#F8E71C]/20', border: 'border-[#F8E71C]' },
    english: { bg: 'bg-[#E57373]/20', border: 'border-[#E57373]' }
  }

  const colors = colorMap[color] || { bg: 'bg-primary/20', border: 'border-primary' }

  return (
    <div 
      className={`absolute w-[calc(100%-8px)] left-1 p-2 rounded-lg ${colors.bg} border-l-4 ${colors.border} cursor-pointer hover:shadow-lg transition-shadow ${
        hasConflict ? 'z-10' : ''
      }`}
      style={style}
    >
      <p className="font-bold text-sm text-[#0e121b] dark:text-white">{course}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{room}</p>
      
      {hasConflict && (
        <div className="absolute top-1 right-1 flex items-center gap-1 text-red-600 dark:text-red-400">
          <span className="material-symbols-outlined text-sm">warning</span>
          <span className="text-xs font-semibold">Conflict</span>
        </div>
      )}
    </div>
  )
}