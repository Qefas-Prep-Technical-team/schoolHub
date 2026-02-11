'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
import { Icon } from '../Icon'
import { Exam } from './components/types'

interface ExamActionsProps {
  exam: Exam
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onExport: () => void
  className?: string
}

export function ExamActions({
  exam,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  className
}: ExamActionsProps) {
  const isDraft = exam.status === 'draft'
  const isCompleted = exam.status === 'completed' || exam.status === 'graded'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary",
            "dark:hover:text-primary-400 rounded-full hover:bg-gray-100",
            "dark:hover:bg-gray-800 transition-colors",
            className
          )}
          aria-label="Exam actions"
        >
          <Icon name="more_horiz" className="text-lg" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] rounded-lg bg-white dark:bg-gray-800 p-2 shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          align="end"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer outline-none"
            onClick={onView}
          >
            <Icon name="visibility" className="h-4 w-4" />
            View Details
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none",
              isDraft
                ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                : "opacity-50 cursor-not-allowed"
            )}
            onClick={isDraft ? onEdit : undefined}
            disabled={!isDraft}
          >
            <Icon name="edit" className="h-4 w-4" />
            Edit
          </DropdownMenu.Item>

          {isCompleted && (
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer outline-none"
              onClick={onExport}
            >
              <Icon name="download" className="h-4 w-4" />
              Export Results
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer outline-none"
            onClick={onDuplicate}
          >
            <Icon name="copy" className="h-4 w-4" />
            Duplicate
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer outline-none"
            onClick={onDelete}
          >
            <Icon name="trash_2" className="h-4 w-4" />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}