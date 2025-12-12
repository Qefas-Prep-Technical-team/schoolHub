import Image from 'next/image'
import { Verified } from 'lucide-react'

export default function ProfileCard() {
  return (
    <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="relative">
        <div className="relative w-24 h-24">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYj3MZdYLevrT_KPDjMz84yRJcV0W1OlNvkU4yAil4t5efj6Gw2yIaMTSBSi8gO0dB_BxVeKgGzIH3Th8RhSdQMdh02mYJaAtEpCYLYm4Eg8-oWvChkCeRgYVCinlrIIjsxPAqAZcygCxlrokbs8BpGeBG26hqI2SfZNk7qvGy5QYk3rPJkE7cWfKN1CGwYiEBtoGtTcd4uysb4TIHe_gBQHrtPy2kvWiQtpHstCqMw7Jvp7KPLf4AZ2woIP0PbwvhfFLdYba0ImA"
            alt="Student portrait Alex Richardson"
            fill
            className="rounded-xl object-cover"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white dark:border-surface-dark">
          ONLINE
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Alex Richardson</h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
              Student ID: 2023-8891
            </p>
          </div>
          <div className="inline-flex bg-primary-light dark:bg-primary/20 text-primary dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium items-center gap-1 self-center sm:self-start">
            <Verified className="size-4" />
            On Track
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
          <span className="px-3 py-1 rounded-md bg-background-light dark:bg-background-dark text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark">
            Science Club Member
          </span>
          <span className="px-3 py-1 rounded-md bg-background-light dark:bg-background-dark text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark">
            School Bus Route B
          </span>
        </div>
      </div>
    </div>
  )
}