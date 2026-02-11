'use client'

import React from 'react'
import Image from 'next/image'
import {  useChildDetailsDrawer } from './ChildDetailsDrawer/components/useChildDetailsDrawer'
import ChildDetailsDrawer, { ChildData } from './ChildDetailsDrawer/ChildDetailsDrawer'

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

const mockChild: ChildData = {
  id: '1',
  name: 'Sarah Johnson',
  class: 'Class 5-B',
  studentId: '#88291',
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmbtPV3Svqpl7Xy7SDHeGBMLhNBFXRzMPBnOj00_ampuAD02z5DVLCtNdMD7SKdaDP4PxU9proxV_rflTzvnPTpZ7HMT7miuN_3ddTYsEixCJFKMSBUGud8C4khRjmxs8xbArEZ5gB6QxY3ZAHpsUl_FjBmK3Z1Nd__SVvfWvPlXEqdZIy7hLybzZKFUJQDVVbDuJ87oWwb4ksvevECmdyfagm1bKLepXZALKmaRlqlBh8DtGqVQF-MhGxNu7DJa0zfcwN6Zxe4vQ',
  isActive: true,
  stats: {
    averageGrade: '88%',
    attendance: '95%',
    behavior: 'Good',
  },
}

export default function ChildCard({ child }: ChildCardProps) {

  const { isOpen, selectedChild, openDrawer, closeDrawer } = useChildDetailsDrawer()

  const handleViewChildDetails = () => {
    openDrawer(mockChild)
  }

  const handleMoreActions = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Show more actions menu
    console.log(`More actions for ${child.name}`)
  }

  const getBadgeColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    }
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-green-500'
    if (percentage >= 85) return 'bg-yellow-400'
    return 'bg-red-500'
  }

  const getGradeColor = (grade: string | number) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-600 dark:text-green-400'
    if (grade === 'B' || grade === 'B+') return 'text-yellow-600 dark:text-yellow-400'
    return 'text-slate-500 dark:text-slate-400'
  }

  return (
    <article className="flex flex-col bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Card Header */}
      <div className="p-6 pb-0 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="relative">
            <div className="relative size-16 rounded-full overflow-hidden shadow-inner">
              <Image
                src={child.imageUrl}
                alt={`Portrait of ${child.name}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            
            {child.status === 'active' && (
              <div 
                className="absolute -bottom-1 -right-1 size-6 bg-green-500 rounded-full border-2 border-white dark:border-surface-dark flex items-center justify-center"
                title="Active"
              >
                <span className="material-symbols-outlined text-white text-[14px] font-bold">
                  check
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col pt-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {child.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {child.class} • Age {child.age}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-mono">
              {child.studentId}
            </p>
          </div>
        </div>
        
        {/* More Actions Dropdown Trigger */}
        <button 
          onClick={handleMoreActions}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
      
      {/* Key Stats */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-3">
          {/* Grade Stat */}
          <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-primary">school</span>
              Grade
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold ${getGradeColor(child.gradeValue)}`}>
                {child.gradeValue}
              </span>
              {child.gradePercentage && (
                <span className={`text-sm font-medium ${getGradeColor(child.gradeValue)}`}>
                  ({child.gradePercentage})
                </span>
              )}
            </div>
          </div>
          
          {/* Attendance Stat */}
          <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
              Attend.
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {child.attendance}%
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
              <div 
                className={`h-full rounded-full ${getAttendanceColor(child.attendance)}`}
                style={{ width: `${child.attendance}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="mt-auto p-6 pt-0 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md ${getBadgeColorClasses(child.badge.color)} text-xs font-semibold`}>
            <span className="material-symbols-outlined text-[14px]">{child.badge.icon}</span>
            {child.badge.text}
          </span>
        </div>
        
        <button 
          onClick={handleViewChildDetails}
          className="w-full flex items-center cursor-pointer justify-center gap-2 h-10 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-sm transition-all group-hover:bg-primary group-hover:text-white"
        >
          <span>View Dashboard</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
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