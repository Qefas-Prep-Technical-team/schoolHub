"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
    usePlatformTeachers 
} from "@/lib/api/hooks/usePlatformSchools"
import { 
    Search as SearchIcon, 
    Presentation as TeacherIcon,
    School as SchoolIcon,
    Mail as MailIcon,
    UserCircle as UserIcon,
    BookOpen as SubjectIcon,
    ExternalLink as ExternalLinkIcon,
    ShieldCheck as ShieldIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Pagination from "@/components/ui/Pagination"

export default function PlatformTeachersPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const { data: response, isLoading } = usePlatformTeachers(searchQuery, currentPage, 10)
    const teachers = response?.data || []
    const pagination = response?.pagination

    return (
        <div className="space-y-8 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <TeacherIcon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Platform Core</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Teacher <span className="text-indigo-600 dark:text-indigo-500">Directory</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                        Overview of educational staff across all linked institutions and their subject expertise.
                    </p>
                </div>

                <div className="relative group min-w-[320px]">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <SearchIcon className="text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    </div>
                    <Input 
                        placeholder="Search name, code, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 w-16">#</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Teacher Profile</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Subjects</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-right">Registered</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-6"><Skeleton className="h-4 w-4 rounded" /></td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-12 w-12 rounded-2xl" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-32" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                <Skeleton className="h-6 w-16 rounded-full" />
                                                <Skeleton className="h-6 w-16 rounded-full" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6"><Skeleton className="h-4 w-24 float-right" /></td>
                                    </tr>
                                ))
                            ) : teachers?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                                            <TeacherIcon size={64} className="text-slate-400" />
                                            <p className="text-xl font-bold text-slate-500">No teachers found</p>
                                            <p className="text-sm font-medium">Try broadening your search criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                teachers?.map((teacher: any, index: number) => (
                                    <tr 
                                        key={teacher.id}
                                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/console/teachers/${teacher.id}`)}
                                    >
                                        <td className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-600">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">
                                                        {teacher.name}
                                                    </span>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                                        <span className="text-indigo-500">{teacher.teacherCode}</span>
                                                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                        <span className="truncate flex items-center gap-1">
                                                            <MailIcon size={10} />
                                                            {teacher.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    <Link 
                                                        href={`/console/schools/${teacher.School_Teacher_primarySchoolIdToSchool?.id}`}
                                                        className="hover:text-indigo-500 flex items-center gap-1 transition-colors"
                                                    >
                                                        <SchoolIcon size={14} className="text-slate-400" />
                                                        {teacher.School_Teacher_primarySchoolIdToSchool?.name || "Independent"}
                                                        <ExternalLinkIcon size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </Link>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-slate-500/10 text-slate-500 dark:text-slate-400 border-none px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <SubjectIcon size={10} />
                                                        {teacher._count?.teacherSubjects || 0} Subjects
                                                    </Badge>
                                                    <Badge className={cn(
                                                        "rounded-full px-3 py-0.5 font-black text-[9px] uppercase tracking-widest border-none",
                                                        teacher.subscriptionStatus === 'ACTIVE' 
                                                            ? "bg-emerald-500/10 text-emerald-500" 
                                                            : "bg-amber-500/10 text-amber-500"
                                                    )}>
                                                        {teacher.subscriptionStatus}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {format(new Date(teacher.createdAt), 'MMM dd, yyyy')}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {format(new Date(teacher.createdAt), 'hh:mm a')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {!isLoading && pagination && pagination.totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    )
}
