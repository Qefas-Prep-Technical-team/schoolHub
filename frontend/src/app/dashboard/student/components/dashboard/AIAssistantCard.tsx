'use client'
import { cn } from '@/lib/utils'
import { Icon } from './Icon'

interface AIAssistantCardProps {
  className?: string
}

export function AIAssistantCard({ className }: AIAssistantCardProps) {
  return (
    <div className={cn(
      "rounded-xl p-6 flex flex-col items-center text-center gap-4",
      "bg-gradient-to-br from-primary/80 to-primary dark:from-primary/50 dark:to-primary/80",
      className
    )}>
      <Icon name="auto_awesome" className="text-4xl text-white" />
      <h3 className="font-bold text-xl text-white">AI Study Assistant</h3>
      <p className="text-sm text-white/80">
        Ask questions, study smarter, and get instant explanations for complex topics.
      </p>
      <button className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/90 transition-colors">
        Open AI Assistant
      </button>
    </div>
  )
}