import React from "react"
import { Subject } from "../services/subjectService"

interface SubjectCardProps {
  subject: Subject
  onEdit?: (subject: Subject) => void
  onView?: (subject: Subject) => void
  onArchive?: (id: string) => void
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onEdit, onView }) => {
  // Map subject code to an icon
  const getIcon = (code: string) => {
    if (code.includes("BIO")) return "biotech"
    if (code.includes("MAT")) return "functions"
    if (code.includes("HIS")) return "history_edu"
    if (code.includes("PHY")) return "rocket_launch"
    if (code.includes("ART")) return "palette"
    if (code.includes("LIT")) return "auto_stories"
    return "menu_book"
  }

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 border border-slate-100 dark:border-slate-800 hover:border-blue-500/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
      onClick={() => onView?.(subject)}
    >
      {/* Subtle background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
      
      <div className="flex justify-between items-start mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <span className="material-symbols-outlined text-[20px] font-bold">
              {getIcon(subject.code)}
            </span>
          </div>
          <div>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px] rounded uppercase tracking-wider">
              {subject.code}
            </span>
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(subject);
          }}
          className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          title="Edit Subject"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
      </div>
      
      <div className="flex-1 z-10">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
          {subject.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed">
          {subject.description || "No curriculum description provided yet for this module."}
        </p>
      </div>
      
      <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
                {[1, 2].map((i) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700"></div>
                ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400">
                {subject.teachersCount || 0} Teachers
            </span>
        </div>
        
        <div className={`flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
          subject.scope === "SCHOOL" 
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
            : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        }`}>
          <span className="material-symbols-outlined text-[12px]">
            {subject.scope === "SCHOOL" ? "domain" : "person"}
          </span>
          <span>{subject.scope === "SCHOOL" ? "School" : "Private"}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-slate-300 text-[14px]">groups</span>
            <span className="text-[10px] font-bold text-slate-400">{subject.classesCount || 0} Classes</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400">
            <span>View Details</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </div>
      </div>
    </div>
  )
}

export default SubjectCard
