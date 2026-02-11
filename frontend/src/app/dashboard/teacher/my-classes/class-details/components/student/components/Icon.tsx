'use client'

import { Search, Plus, ChevronDown, Phone, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconProps {
  name: string
  className?: string
  size?: number
}

const iconMap = {
  search: Search,
  add: Plus,
  arrow_drop_down: ChevronDown,
  call: Phone,
  visibility: Eye,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
}

export function Icon({ name, className, size = 20 }: IconProps) {
  const IconComponent = iconMap[name as keyof typeof iconMap]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return <IconComponent className={cn(className)} size={size} />
}