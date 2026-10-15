'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ChildCard from './ChildCard'
import AddChildCard from './AddChildCard'
import { ChildSummary } from '@/lib/api/services/parentService'
import { useParentChildren } from '@/lib/api/hooks/useParentChildren'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { useChildDetailsDrawer } from './ChildDetailsDrawer/components/useChildDetailsDrawer'
import EditChildModal from './EditChildModal'
import { 
  MoreVertical, 
  ExternalLink, 
  Edit3, 
  Layout, 
  Hash, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'

interface Child {
  id: string
  name: string
  age: number
  grade: string
  class: string
  studentId: string
  imageUrl: string
  attendance: number
  gradeValue: string | number
  gradePercentage?: string
  status: 'active' | 'inactive'
  badge: {
    text: string
    color: 'green' | 'blue' | 'purple'
    icon: string
  }
}

interface ChildrenGridProps {
  viewMode?: 'grid' | 'list';
}

function ChildListRow({ child, index }: { child: Child; index: number }) {
  const router = useRouter()
  const { setSelectedChildId } = useParentStore()
  const { openDrawer } = useChildDetailsDrawer()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleViewDashboard = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedChildId(child.id)
    router.push(`/dashboard/parent/child-details/${child.id}`)
  }

  const handleViewChildDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openDrawer({
      id: child.id,
      name: child.name,
      class: child.class,
      studentId: child.studentId,
      imageUrl: child.imageUrl,
      isActive: child.status === 'active',
      stats: {
        averageGrade: child.gradePercentage || 'N/A',
        attendance: `${child.attendance}%`,
        behavior: 'Good',
      },
    })
  }

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(child.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`
  const displayImage = (!imgError && child.imageUrl && child.imageUrl !== "null" && child.imageUrl !== "") 
    ? child.imageUrl 
    : placeholderUrl

  const attendanceNum = Number(child.attendance) || 0
  const avgNum = parseFloat(String(child.gradePercentage || '0'))

  return (
    <>
      <tr 
        onClick={handleViewDashboard}
        className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
      >
        {/* Row Number */}
        <td className="px-3 sm:px-4 py-4 text-center font-bold text-xs text-slate-400 dark:text-slate-500 w-12">
          {index}
        </td>

        {/* Student Name & Avatar */}
        <td className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative size-11 sm:size-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
              <Image
                src={displayImage}
                alt={child.name}
                fill
                className="object-cover"
                sizes="48px"
                onError={() => setImgError(true)}
                unoptimized
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                {child.name}
              </h4>
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mt-0.5">
                <Hash size={11} className="text-slate-400" />
                <span>{child.studentId}</span>
              </div>
            </div>
          </div>
        </td>

        {/* Class */}
        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          {child.class}
        </td>

        {/* Attendance */}
        <td className="px-4 sm:px-6 py-4 text-center">
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border",
            attendanceNum >= 90 ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
            attendanceNum >= 75 ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
            "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
          )}>
            {child.attendance}%
          </span>
        </td>

        {/* Average Grade */}
        <td className="px-4 sm:px-6 py-4 text-center">
          <div className="inline-flex items-center gap-1.5">
            <span className={cn(
              "size-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm",
              avgNum >= 70 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
              avgNum >= 50 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" :
              "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
            )}>
              {child.gradeValue}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {child.gradePercentage}
            </span>
          </div>
        </td>

        {/* Status */}
        <td className="px-4 sm:px-6 py-4 text-center">
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            child.status === 'active' 
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
              : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
          )}>
            <span className={cn("size-1.5 rounded-full", child.status === 'active' ? "bg-emerald-500" : "bg-slate-400")} />
            {child.status}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 sm:px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDashboard}
              className="hidden sm:inline-flex h-8 px-3 rounded-lg text-xs font-bold text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30"
            >
              Dashboard
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg">
                <DropdownMenuItem 
                  onClick={handleViewDashboard}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium cursor-pointer text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                >
                  <Layout size={14} /> Open Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleViewChildDetails}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink size={14} className="text-slate-500" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit3 size={14} className="text-slate-500" /> Edit Info
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>

      <EditChildModal 
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        child={{
          id: child.id,
          name: child.name,
          imageUrl: child.imageUrl || ''
        }}
      />
    </>
  )
}

export default function ChildrenGrid({ viewMode = 'grid' }: ChildrenGridProps) {
  const { data: children = [], isLoading, isError } = useParentChildren()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[300px] bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-medium">Failed to load children. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const getGradeLabel = (avg: number) => {
    if (avg >= 70) return 'A'
    if (avg >= 60) return 'B'
    if (avg >= 50) return 'C'
    if (avg >= 45) return 'D'
    if (avg >= 40) return 'E'
    return 'F'
  }

  // Map backend children to frontend Child interface
  const mappedChildren: Child[] = children.map((c) => ({
    id: c.id,
    name: c.name,
    age: 0,
    grade: getGradeLabel(c.stats.averageGrade),
    class: c.currentClass ? `${c.currentClass.name} ${c.currentClass.section || ''}` : 'No Class Assigned',
    studentId: c.studentCode,
    imageUrl: c.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=ea580c&color=fff`,
    attendance: c.stats.attendanceRate,
    gradeValue: getGradeLabel(c.stats.averageGrade),
    gradePercentage: `${c.stats.averageGrade}%`,
    status: (c.linkStatus === 'ACCEPTED' || c.linkStatus === 'active') ? 'active' : 'inactive',
    badge: {
      text: c.stats.averageGrade >= 70 ? 'Top Performer' : 'Needs Improvement',
      color: c.stats.averageGrade >= 70 ? 'green' : c.stats.averageGrade >= 50 ? 'blue' : 'purple',
      icon: c.stats.averageGrade >= 70 ? 'stars' : 'trending_down',
    },
  }))

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
                  <th className="px-3 sm:px-4 py-4 w-12 text-center">#</th>
                  <th className="px-4 sm:px-6 py-4">Student</th>
                  <th className="px-4 sm:px-6 py-4">Class</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Attendance</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Average</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {mappedChildren.map((child, index) => (
                  <ChildListRow key={child.id} child={child} index={index + 1} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Link More Children Banner */}
        <div className="flex justify-end pt-2">
          <AddChildCard childrenCount={mappedChildren.length} />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-300">
      {mappedChildren.map((child) => (
        <ChildCard key={child.id} child={child} />
      ))}
      <AddChildCard childrenCount={mappedChildren.length} />
    </div>
  )
}
