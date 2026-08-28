import { Exam, SubjectPaper } from "@/lib/api/services/examService";
import { BookOpen, FileText, LayoutDashboard, PenTool } from "lucide-react";

interface StatsCardsProps {
    examsCount?: number;
    quizzesCount?: number;
    casCount?: number;
    papersCount?: number;
}

export default function StatsCards({ examsCount = 0, quizzesCount = 0, casCount = 0, papersCount = 0 }: StatsCardsProps) {
    const totalExams = examsCount;
    const totalQuizzes = quizzesCount;
    const totalCAs = casCount;
    const totalPapers = papersCount;

    const stats = [
        { 
            label: 'Total Exams', 
            value: totalExams.toString(),
            icon: LayoutDashboard,
            bg: "bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/20",
            border: "border-blue-500/20 hover:border-blue-500/50",
            accent: "bg-blue-600",
            iconBg: "bg-blue-600 text-white shadow-blue-600/30",
            textHighlight: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
        },
        { 
            label: 'Total Quizzes', 
            value: totalQuizzes.toString(),
            icon: PenTool,
            bg: "bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-amber-950/20",
            border: "border-amber-500/20 hover:border-amber-500/50",
            accent: "bg-amber-500",
            iconBg: "bg-amber-500 text-white shadow-amber-500/30",
            textHighlight: "group-hover:text-amber-600 dark:group-hover:text-amber-400"
        },
        { 
            label: 'Continuous Assessments', 
            value: totalCAs.toString(),
            icon: BookOpen,
            bg: "bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20",
            border: "border-emerald-500/20 hover:border-emerald-500/50",
            accent: "bg-emerald-500",
            iconBg: "bg-emerald-500 text-white shadow-emerald-500/30",
            textHighlight: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
        },
        { 
            label: 'Subject Papers', 
            value: totalPapers.toString(),
            icon: FileText,
            bg: "bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20",
            border: "border-purple-500/20 hover:border-purple-500/50",
            accent: "bg-purple-600",
            iconBg: "bg-purple-600 text-white shadow-purple-600/30",
            textHighlight: "group-hover:text-purple-600 dark:group-hover:text-purple-400"
        },
    ];

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className={`group relative overflow-hidden rounded-3xl border ${stat.border} ${stat.bg} p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-default flex flex-col justify-between`}
                    >
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${stat.accent}`} />
                        <Icon className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-[0.03] text-slate-900 dark:text-white transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12`} />
                        
                        <div className="relative z-10 flex flex-col h-full gap-8">
                            <div className="flex justify-between items-start">
                                <div className={`p-3.5 rounded-2xl shadow-lg transition-transform duration-500 group-hover:-rotate-6 ${stat.iconBg}`}>
                                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                                </div>
                            </div>

                            <div>
                                <p className={`text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors duration-300 ${stat.textHighlight}`}>
                                    {stat.value}
                                </p>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}