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
  Calendar, 
  MoreVertical, 
  Layout, 
  Edit3,
  ExternalLink,
  ShieldCheck
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
    if (percentage >= 95) return 'bg-green-500'
    if (percentage >= 85) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(child.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;
  const displayImage = (!imgError && child.imageUrl && child.imageUrl !== "null" && child.imageUrl !== "") 
    ? child.imageUrl 
    : placeholderUrl;

  return (
    <article className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[3rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl hover:shadow-orange-600/10 transition-all duration-700 animate-in fade-in zoom-in-95">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Card Header */}
      <div className="p-10 pb-0">
        <div className="flex justify-between items-start">
          <div className="relative">
            <div className="size-28 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-800 relative group-hover:scale-105 transition-transform duration-700">
              <Image
                src={displayImage}
                alt={child.name}
                fill
                className="object-cover"
                sizes="112px"
                onError={() => setImgError(true)}
                unoptimized
              />
            </div>
            
            {child.status === 'active' && (
              <div className="absolute -bottom-2 -right-2 size-10 bg-orange-600 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg animate-bounce-slow">
                <ShieldCheck size={18} />
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-12 rounded-2xl hover:bg-orange-600/10 hover:text-orange-600 transition-all">
                <MoreVertical size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-[1.5rem] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200 dark:border-white/5 shadow-2xl">
              <DropdownMenuItem 
                onClick={(e) => handleViewChildDetails(e as any)}
                className="flex items-center gap-3 p-3 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer focus:bg-orange-600 focus:text-white transition-all"
              >
                <ExternalLink size={14} /> View Node Intelligence
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-3 p-3 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer focus:bg-orange-600 focus:text-white transition-all"
              >
                <Edit3 size={14} /> Modify Protocol (Edit)
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-1" />
              <DropdownMenuItem 
                onClick={handleViewDashboard}
                className="flex items-center gap-3 p-3 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer text-orange-600 focus:bg-orange-600 focus:text-white transition-all"
              >
                <Layout size={14} /> View Child
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-8 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">
            <span>STU-CODE: {child.studentId}</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight group-hover:text-orange-600 transition-colors">
            {child.name}
          </h3>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-bold text-xs">
            <span className="flex items-center gap-1.5"><GraduationCap size={14} /> {child.class}</span>
            <span className="size-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
            <span className="flex items-center gap-1.5"><User size={14} /> Age {child.age || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      {/* Visual Analytics */}
      <div className="p-10 pt-8 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 group/stat hover:bg-white dark:hover:bg-white/5 transition-all">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-orange-500" /> Academic Level
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{child.gradeValue}</span>
              <span className="text-[10px] font-black text-orange-600">{child.gradePercentage}</span>
            </div>
          </div>
          
          <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 group/stat hover:bg-white dark:hover:bg-white/5 transition-all">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-green-500" /> Presence Rate
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{child.attendance}%</span>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", getAttendanceColor(child.attendance))}
                  style={{ width: `${child.attendance}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleViewDashboard}
          className="w-full h-16 rounded-[1.5rem] bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-xl hover:shadow-orange-600/30 active:scale-95 group/btn"
        >
          View Child
          <ChevronRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>

      <EditChildModal 
        isOpen={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
        child={{ id: child.id, name: child.name, imageUrl: child.imageUrl }} 
      />

      {selectedChild && (
        <ChildDetailsDrawer
          isOpen={isOpen}
          onClose={closeDrawer}
          child={selectedChild}
        />
      )}
    </article>
  )
}
