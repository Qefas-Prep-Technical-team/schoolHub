import { Exam, SubjectPaper } from "@/lib/api/services/examService";
import { BookOpen, FileText, LayoutDashboard, PenTool, Plus } from "lucide-react";
import Link from "next/link";

interface StatsCardsProps {
    examsCount?: number;
    quizzesCount?: number;
    casCount?: number;
    papersCount?: number;
}

export default function StatsCards({ examsCount = 0, quizzesCount = 0, casCount = 0, papersCount = 0 }: StatsCardsProps) {
    const stats = [
        { 
            label: 'Total Exams', 
            value: examsCount,
            icon: LayoutDashboard,
            bg: "bg-white dark:bg-slate-900",
            iconColor: "text-blue-500",
            iconBg: "bg-blue-50 dark:bg-blue-900/20",
        },
        { 
            label: 'Total Quizzes', 
            value: quizzesCount,
            icon: PenTool,
            bg: "bg-white dark:bg-slate-900",
            iconColor: "text-orange-500",
            iconBg: "bg-orange-50 dark:bg-orange-900/20",
        },
        { 
            label: 'Total CAs', 
            value: casCount,
            icon: BookOpen,
            bg: "bg-white dark:bg-slate-900",
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
        },
        { 
            label: 'Subject Papers', 
            value: papersCount,
            icon: FileText,
            bg: "bg-white dark:bg-slate-900",
            iconColor: "text-purple-500",
            iconBg: "bg-purple-50 dark:bg-purple-900/20",
        }
    ];

    return (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            {/* Banner Card */}
            <div className="lg:col-span-12 xl:col-span-6 bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-[2rem] p-8 md:p-10 flex flex-col justify-center text-white relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black mb-3">Ready to manage exams?</h2>
                    <p className="text-indigo-100 font-medium mb-8 max-w-md leading-relaxed text-sm">
                        Create, schedule, and grade assessments. Keep your school's examination process organized and efficient.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/dashboard/admin/exams/new?category=EXAM&mode=SINGLE_SUBJECT">
                            <button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2 text-sm">
                                <Plus size={18} strokeWidth={2.5} />
                                Create Exam
                            </button>
                        </Link>
                        <Link href="/dashboard/admin/exams/new/paper">
                            <button className="bg-indigo-700/50 hover:bg-indigo-700 border border-indigo-400/30 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm">
                                <FileText size={18} strokeWidth={2.5} />
                                New Subject Paper
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-12 xl:col-span-6 grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className={`rounded-[2rem] border border-slate-100 dark:border-slate-800 ${stat.bg} p-6 shadow-sm flex flex-col justify-center`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                                    <Icon size={24} strokeWidth={2.5} />
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {stat.label}
                                </p>
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}