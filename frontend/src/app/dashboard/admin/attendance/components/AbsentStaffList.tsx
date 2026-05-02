'use client';

import { Users, MoreHorizontal, UserX } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface AbsentStaff {
    id: string;
    name: string;
    department: string;
    leaveType: 'sick' | 'personal' | 'vacation' | 'unexcused' | 'other' | 'unassigned';
    imageUrl: string;
    notes?: string;
}

interface AbsentStaffListProps {
    summary?: {
        unassignedCount: number;
        unassignedTeachers: any[];
    };
    isLoading?: boolean;
}

export default function AbsentStaffList({ summary, isLoading }: AbsentStaffListProps) {
    const staff = useMemo<AbsentStaff[]>(() => {
        if (!summary?.unassignedTeachers || summary.unassignedTeachers.length === 0) {
            // Fallback mock data if no real unassigned teachers
            return [
                {
                    id: '1',
                    name: 'Mr. Anderson',
                    department: 'Mathematics Dept.',
                    leaveType: 'sick',
                    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCy3EoI-nMTqa6J8BL8D19cdjQKfq2fecDiylNZp5xdVb3uBFF2RkrzIU__BVIwjGX1jwQxzDVnggxR99aQloh1IWCjOzgCPqt-I-o1tyeAg9e7FwPraWOgeh9nvmtc85P3tWfAbapNConIdcV3egS6oYvRtwjJLxtS_MEOil-0hSI8PAr5fVn3muuNs_3h9jjSr2nk_6ByP0E5bBozUgO0qhPf3iLZvandDh-z2lIoZDwO7ZmMoC1hbSiVfUe7g383rBlkYXIU7k0',
                },
                {
                    id: '2',
                    name: 'Ms. Davis',
                    department: 'Science Dept.',
                    leaveType: 'unexcused',
                    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARWQO6EcB4srQApqesWj-urhWTuFSwSJIEnnf-Ccu8_PKZmGlPKVdKYvijbHW_lnLadd2gEtHJnliCWFRlBYVZzlD0wgXAZGxXCTb6tnucC4Yshn-KpiNFhHNt-kLsKjz_-atAi_lM8O_B7nfJZJEeZyMRh5q_mctobLkgsyt9eNqGQR67FOfw5sU1F13GIlFIrRh6GAdlq20aPDTp1ieQIcv4StxEoRjgWoOLJRxbbDk8hE4yMj-vauZOzbCrTITnfbU-b4aEsFM',
                }
            ];
        }

        return summary.unassignedTeachers.map(t => ({
            id: t.id,
            name: t.name,
            department: 'Unallocated',
            leaveType: 'unassigned',
            imageUrl: t.profileImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCy3EoI-nMTqa6J8BL8D19cdjQKfq2fecDiylNZp5xdVb3uBFF2RkrzIU__BVIwjGX1jwQxzDVnggxR99aQloh1IWCjOzgCPqt-I-o1tyeAg9e7FwPraWOgeh9nvmtc85P3tWfAbapNConIdcV3egS6oYvRtwjJLxtS_MEOil-0hSI8PAr5fVn3muuNs_3h9jjSr2nk_6ByP0E5bBozUgO0qhPf3iLZvandDh-z2lIoZDwO7ZmMoC1hbSiVfUe7g383rBlkYXIU7k0',
        }));
    }, [summary]);

    const getLeaveStyles = (type: AbsentStaff['leaveType']) => {
        switch (type) {
            case 'sick': return "bg-amber-500/10 text-amber-600";
            case 'unexcused': return "bg-rose-500/10 text-rose-600";
            case 'personal': return "bg-primary/10 text-primary";
            case 'vacation': return "bg-emerald-500/10 text-emerald-600";
            case 'unassigned': return "bg-purple-500/10 text-purple-600";
            default: return "bg-slate-500/10 text-slate-600";
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <Skeleton className="h-8 w-40 rounded-lg" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <UserX className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {summary?.unassignedCount ? 'Faculty Attention' : 'Absent Faculty'}
                        </h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">
                        {summary?.unassignedCount ? 'Staff unallocated to classes' : "Today's non-attendance"}
                    </p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase px-3 py-1">
                    {staff.length} Total
                </Badge>
            </div>

            <div className="space-y-4">
                {staff.map((person) => (
                    <div key={person.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm transition-transform group-hover:scale-110">
                                <Image
                                    src={person.imageUrl}
                                    alt={person.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-slate-900 dark:text-white text-sm truncate tracking-tight italic">
                                    {person.name}
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                                    {person.department}
                                </p>
                            </div>
                        </div>
                        <Badge className={cn(
                            "rounded-lg text-[9px] font-black uppercase px-2 py-0.5 border-none",
                            getLeaveStyles(person.leaveType)
                        )}>
                            {person.leaveType}
                        </Badge>
                    </div>
                ))}
            </div>

            <div className="pt-4">
                <button className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all">
                    Coordinate Substitutes
                </button>
            </div>
        </div>
    );
}

