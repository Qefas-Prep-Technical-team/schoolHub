'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, GraduationCap, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TeacherGridItem {
    id: string
    teacherCode?: string
    code?: string
    name: string
    email: string
    subjects: string[]
    classes: string[]
    status: 'active' | 'pending' | string
    isClaimed?: boolean
    primarySchoolId?: string
    profileImage: string
}

interface TeacherGridProps {
    teachers: TeacherGridItem[]
    currentPage: number
    itemsPerPage: number
}

export function TeacherGrid({ teachers, currentPage, itemsPerPage }: TeacherGridProps) {
    const router = useRouter()

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
            {teachers.map((teacher, index) => {
                const rowNumber = currentPage * itemsPerPage + index + 1
                const facultyCode = teacher.teacherCode ? String(teacher.teacherCode).padStart(8, '0') : '—'

                return (
                    <div
                        key={teacher.id}
                        onClick={() => router.push(`/dashboard/admin/teachers/${teacher.id}`)}
                        className="group relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
                    >
                        <div>
                            {/* Top Header: ID badge + Status Pill */}
                            <div className="flex items-center justify-between gap-2 mb-3.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                        #{rowNumber}
                                    </span>
                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tracking-wider truncate">
                                        {facultyCode}
                                    </span>
                                </div>
                                <span className={cn(
                                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0',
                                    teacher.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
                                )}>
                                    <span className={cn('size-1.5 rounded-full', teacher.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400')} />
                                    {teacher.status === 'active' ? 'Active' : 'Pending'}
                                </span>
                            </div>

                            {/* Avatar + Name & Email */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-gray-100 dark:bg-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                                    <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors capitalize">
                                        {teacher.name}
                                    </h4>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                        {teacher.email}
                                    </p>
                                </div>
                            </div>

                            {/* Subjects & Classes metadata */}
                            <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-white/5">
                                {/* Subjects */}
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                                        <BookOpen size={11} className="text-indigo-500 shrink-0" />
                                        <span>Assigned Subjects</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {teacher.subjects.length > 0 ? (
                                            <>
                                                {teacher.subjects.slice(0, 3).map((s, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-500/20">
                                                        {s}
                                                    </span>
                                                ))}
                                                {teacher.subjects.length > 3 && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                                                        +{teacher.subjects.length - 3}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No subjects assigned</span>
                                        )}
                                    </div>
                                </div>

                                {/* Classes */}
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                                        <GraduationCap size={11} className="text-slate-400 shrink-0" />
                                        <span>Classes</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {teacher.classes.length > 0 ? (
                                            <>
                                                {teacher.classes.slice(0, 3).map((c, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {c}
                                                    </span>
                                                ))}
                                                {teacher.classes.length > 3 && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                                                        +{teacher.classes.length - 3}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No classes assigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Link / Action */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                            <span className="text-gray-400 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                View Profile
                            </span>
                            <ChevronRight size={14} className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
