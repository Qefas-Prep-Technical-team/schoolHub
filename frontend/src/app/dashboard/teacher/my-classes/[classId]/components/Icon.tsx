'use client'

import {
  Search,
  Plus,
  Eye,
  Edit,
 BookPlus as Grade,
LayoutDashboard as  Dashboard,
  School,
  UsersRound as Groups,
  Calendar,
  MessageSquare,
  Settings,
  BadgeInfo as Help,
  ChevronRight,
  Home,
  Filter,
  Download,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  FileText,
  BookOpen,
  Users,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconProps {
  name: string
  className?: string
  size?: number
}

const iconMap = {
  // Existing icons
  search: Search,
  add: Plus,
  arrow_drop_down: ChevronRight, // Using ChevronRight as fallback
  call: Phone,
  visibility: Eye,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  
  // New icons for assignments page
  add_circle: PlusCircle,
  edit: Edit,
  grading: Grade,
  dashboard: Dashboard,
  school: School,
  group: Groups,
  calendar_today: Calendar,
  chat_bubble: MessageSquare,
  settings: Settings,
  help: Help,
  home: Home,
  filter: Filter,
  download: Download,
  more_vertical: MoreVertical,
  clock: Clock,
  check_circle: CheckCircle,
  x_circle: XCircle,
  edit_square: Edit3,
  file_text: FileText,
  book_open: BookOpen,
  users: Users,
  bell: Bell,
  // Exam specific icons

   
  
    filter_list: Filter,
    calendar_month: Calendar, // Add logout icon
}

// Import the missing icons
import {
  Phone,
  ChevronLeft,
  PlusCircle,
} from 'lucide-react'

export function Icon({ name, className, size = 20 }: IconProps) {
  const IconComponent = iconMap[name as keyof typeof iconMap]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return <IconComponent className={cn(className)} size={size} />
}