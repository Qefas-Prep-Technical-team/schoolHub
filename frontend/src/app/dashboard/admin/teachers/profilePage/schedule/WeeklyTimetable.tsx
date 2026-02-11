import ClassCard from './ClassCard'
import AvailabilityIndicator from './AvailabilityIndicator'

interface ClassSchedule {
  id: string
  course: string
  time: string
  room: string
  color: string
  day: string
  startTime: string
  duration: number // in hours
  hasConflict?: boolean
}

interface WeeklyTimetableProps {
  classes: ClassSchedule[]
  onClassClick: (classId: string) => void
}

export default function WeeklyTimetable({ classes, onClassClick }: WeeklyTimetableProps) {
  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'
  ]

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const calculatePosition = (startTime: string, duration: number) => {
    const timeToPixels: { [key: string]: number } = {
      '08:00': 0, '08:30': 32, '09:00': 64, '09:30': 96,
      '10:00': 128, '10:30': 160, '11:00': 192, '11:30': 224,
      '12:00': 256, '12:30': 288, '13:00': 320, '13:30': 352,
      '14:00': 384, '14:30': 416, '15:00': 448
    }

    const [time, modifier] = startTime.split(' ')
    let [hours] = time.split(':').map(Number)
    const [minutes] = time.split(':').map(Number)

    if (modifier === 'PM' && hours !== 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0

    const timeKey = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    const top = timeToPixels[timeKey] || 0
    const height = duration * 64 // 64px per hour

    return { top, height }
  }

  return (
    <div className="bg-white dark:bg-[#191e2a] rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] min-w-[800px]">
        {/* Time Column */}
        <div className="w-16">
          <div className="h-10"></div>
          {timeSlots.map((time, index) => (
            <div
              key={time}
              className="h-16 text-right pr-4 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-1"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map((day) => (
          <div key={day} className="relative" data-day={day}>
            <div className="h-10 text-center font-bold text-[#0e121b] dark:text-white">
              {day.slice(0, 3)}
            </div>
            <div className="h-full border-l border-gray-200 dark:border-gray-700 space-y-px">
              {timeSlots.map((_, index) => (
                <div
                  key={index}
                  className="h-16 border-t border-gray-200 dark:border-gray-700"
                ></div>
              ))}
            </div>

            {/* Render classes for this day */}
            {classes
              .filter(cls => cls.day === day)
              .map((cls) => {
                const position = calculatePosition(cls.startTime, cls.duration)
                return (
                  <ClassCard
                    key={cls.id}
                    course={cls.course}
                    time={cls.time}
                    room={cls.room}
                    color={cls.color}
                    hasConflict={cls.hasConflict}
                    style={{
                      top: position.top,
                      height: position.height
                    }}
                  />
                )
              })}

            {/* Special cases */}
            {day === 'Tuesday' && (
              <AvailabilityIndicator
                message="Unavailable"
                style={{ top: 314, height: 128 }}
              />
            )}

            {day === 'Wednesday' && classes.some(cls => cls.hasConflict) && (
              <>
                {/* Conflicting class */}
                {classes
                  .filter(cls => cls.day === day && cls.hasConflict)
                  .map((cls) => {
                    const position = calculatePosition(cls.startTime, cls.duration)
                    return (
                      <ClassCard
                        key={cls.id}
                        course={cls.course}
                        time={cls.time}
                        room={cls.room}
                        color={cls.color}
                        hasConflict={true}
                        style={{
                          top: position.top,
                          height: position.height,
                          zIndex: 5,
                          marginLeft: '12px',
                          marginTop: '12px',
                          opacity: 0.8
                        }}
                      />
                    )
                  })}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}