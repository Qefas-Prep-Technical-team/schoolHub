"use client"
import { useState } from 'react';
import Image from 'next/image';
import { Download, Mail, Calendar } from 'lucide-react';
import { useChildExams } from '@/lib/api/hooks/useChildExams';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileHeader() {
    const { selectedChildId } = useParentStore();
    const { data: student, isLoading } = useChildExams(selectedChildId);
    const [imgError, setImgError] = useState(false);

    if (isLoading) {
        return <Skeleton className="h-40 w-full rounded-2xl mb-8" />;
    }

    if (!student) return null;

    // Use DiceBear as a more robust fallback
    const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;
    
    const displayImage = (!imgError && student.profileImage && student.profileImage !== "null" && student.profileImage !== "") 
        ? student.profileImage 
        : placeholderUrl;

    return (
        <section className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/10 group overflow-hidden relative">
            <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-9xl text-orange-600">person</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left w-full md:w-auto z-10">
                <div className="relative">
                    <div className="relative size-28 p-1 bg-orange-600 rounded-full shadow-2xl shadow-orange-600/20">
                        <div className="size-full rounded-full overflow-hidden bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800">
                            <Image
                                src={displayImage}
                                alt={`Portrait of student ${student.name}`}
                                fill
                                className="object-cover"
                                onError={() => setImgError(true)}
                                unoptimized={displayImage.includes('api.dicebear.com') || displayImage.includes('ui-avatars.com')}
                            />
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border-2 border-white dark:border-slate-900 shadow-lg">
                        Active
                    </div>
                </div>

                <div className="flex flex-col justify-center py-2">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                        {student.name}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-widest mt-2 flex items-center gap-2 justify-center sm:justify-start">
                        {student.school?.name || 'School Hub Academy'} <span className="size-1 bg-slate-300 rounded-full"></span> ID: {student.id?.slice(-6).toUpperCase() || 'N/A'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                        <div className="inline-flex items-center gap-2 bg-orange-600/10 text-orange-600 px-3 py-1.5 rounded-xl border border-orange-500/10 shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">school</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {student.classes?.[0]?.class?.name || 'Class N/A'}
                            </span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                Session 2023-2024
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center sm:justify-start z-10">
                <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); console.log('Download requested'); }}
                    className="flex items-center gap-3 bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95 group cursor-pointer"
                >
                    <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                    <span>Download Report</span>
                </button>
                <button 
                    type="button"
                    className="flex items-center gap-3 bg-white dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                    <Mail className="h-4 w-4" />
                    <span>Contact Teacher</span>
                </button>
            </div>
        </section>
    );
}

