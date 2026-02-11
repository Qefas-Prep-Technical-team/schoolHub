'use client'

import { cn } from "@/lib/utils"
import { getClassStatusColor } from "./dashboardUtils"
import { TodayClass } from "./types"

interface TodayClassesProps {
  classes: TodayClass[]
  className?: string
}

export function TodayClasses({ classes, className }: TodayClassesProps) {
  const currentIndex = classes.findIndex(c => c.status === 'ongoing')
  const nextIndex = classes.findIndex(c => c.status === 'next')

  return (
    <div className={className}>
      <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 md:px-6 pb-3 pt-5">
        Today&apos;s Classes
      </h2>
      
      <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-4 md:pl-6">
        <div className="flex items-stretch gap-4 pb-4">
          {classes.map((classItem, index) => {
            const isCurrent = index === currentIndex
            const isNext = index === nextIndex
            
            return (
              <div
                key={classItem.id}
                className={cn(
                  "flex h-full flex-col gap-4 rounded-xl shadow-sm border w-64 min-w-64",
                  isCurrent
                    ? "bg-primary/10 dark:bg-primary/20 border-primary/30"
                    : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex flex-col p-4 gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 dark:text-white text-base font-semibold leading-normal">
                      {classItem.subject}
                    </p>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      getClassStatusColor(classItem.status)
                    )}>
                      {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                    {classItem.time}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                    {classItem.teacher} | {classItem.room}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}