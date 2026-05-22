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
            gradient: "from-blue-500/20 to-indigo-500/5",
            textColor: "text-blue-600 dark:text-blue-400",
            iconBg: "bg-blue-100 dark:bg-blue-900/40"
        },
        { 
            label: 'Total Quizzes', 
            value: totalQuizzes.toString(),
            icon: PenTool,
            gradient: "from-amber-500/20 to-orange-500/5",
            textColor: "text-amber-600 dark:text-amber-400",
            iconBg: "bg-amber-100 dark:bg-amber-900/40"
        },
        { 
            label: 'Continuous Assessments', 
            value: totalCAs.toString(),
            icon: BookOpen,
            gradient: "from-green-500/20 to-emerald-500/5",
            textColor: "text-green-600 dark:text-green-400",
            iconBg: "bg-green-100 dark:bg-green-900/40"
        },
        { 
            label: 'Subject Papers', 
            value: totalPapers.toString(),
            icon: FileText,
            gradient: "from-purple-500/20 to-pink-500/5",
            textColor: "text-purple-600 dark:text-purple-400",
            iconBg: "bg-purple-100 dark:bg-purple-900/40"
        },
    ];

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className={`relative overflow-hidden flex flex-col gap-3 rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                    >
                        {/* Background gradient blob */}
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.textColor} transition-colors`}>
                                <Icon className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                        </div>

                        <div className="relative z-10 mt-2">
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                                {stat.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}