'use client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Announcement } from './types'

interface AnnouncementsListProps {
  announcements: Announcement[]
  title?: string
  viewAllLink?: string
  className?: string
}

export function AnnouncementsList({
  announcements,
  title = 'Announcements',
  viewAllLink,
  className
}: AnnouncementsListProps) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-sm font-medium text-primary hover:underline"
          >
            See All
          </a>
        )}
      </div>
      
      <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 max-h-80 overflow-y-auto">
        {announcements.map((announcement, index) => (
          <div
            key={announcement.id}
            className={cn(
              index < announcements.length - 1
                ? "border-b border-gray-200 dark:border-gray-700 pb-3"
                : ""
            )}
          >
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {announcement.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Posted by {announcement.author}
              {announcement.department && ` • ${announcement.department}`}
              {' '}on {format(announcement.date, 'MMM d')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}