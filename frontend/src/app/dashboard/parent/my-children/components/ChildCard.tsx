'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useChildDetailsDrawer } from './ChildDetailsDrawer/components/useChildDetailsDrawer';
import ChildDetailsDrawer from './ChildDetailsDrawer/ChildDetailsDrawer';
import { 
  User, 
  ChevronRight, 
  GraduationCap, 
  MoreVertical, 
  Layout, 
  Edit3,
  ExternalLink,
  MapPin,
  Hash
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import EditChildModal from './EditChildModal';
import { cn } from '@/lib/utils';

interface ChildCardProps {
  child: {
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
}

export default function ChildCard({ child }: ChildCardProps) {
  const { isOpen, selectedChild, openDrawer, closeDrawer } = useChildDetailsDrawer()
  const { setSelectedChildId } = useParentStore()
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

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

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-emerald-500'
    if (percentage >= 85) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(child.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;
  const displayImage = (!imgError && child.imageUrl && child.imageUrl !== "null" && child.imageUrl !== "") 
    ? child.imageUrl 
    : placeholderUrl;

  return (
    <>
      <article className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col hover:shadow-md transition-shadow">
        
        {/* Card Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="relative size-16 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0">
              <Image
                src={displayImage}
                alt={child.name}
                fill
                className="object-cover"
                sizes="64px"
                onError={() => setImgError(true)}
                unoptimized
              />
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {child.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-500">
                <Hash size={12} className="text-slate-400" />
                <span>{child.studentId}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg">
              <DropdownMenuItem 
                onClick={(e) => handleViewChildDetails(e as any)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ExternalLink size={14} className="text-slate-500" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit3 size={14} className="text-slate-500" /> Edit Info
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
              <DropdownMenuItem 
                onClick={handleViewDashboard}
                className="flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium cursor-pointer text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
              >
                <Layout size={14} /> Open Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Visual Analytics */}
        <div className="flex flex-col gap-4 mb-6">
           <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
             <div className="flex flex-col">
               <span className="text-[11px] text-slate-500 font-medium">Class</span>
               <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{child.class}</span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[11px] text-slate-500 font-medium">Avg Grade</span>
               <div className="flex items-baseline gap-1 mt-0.5">
                 <span className="text-sm font-semibold text-slate-900 dark:text-white">{child.gradePercentage}</span>
               </div>
             </div>
           </div>

           <div className="flex flex-col p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-500 font-medium">Attendance</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">{child.attendance}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", getAttendanceColor(child.attendance))}
                  style={{ width: `${child.attendance}%` }}
                />
              </div>
           </div>
        </div>

        <Button 
          onClick={handleViewDashboard}
          className="w-full h-11 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 font-semibold text-sm transition-colors mt-auto"
        >
          View Dashboard
        </Button>
      </article>

      {/* Edit Modal */}
      <EditChildModal 
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        child={{
          id: child.id,
          name: child.name,
          imageUrl: child.imageUrl
        }}
      />
    </>
  )
}
