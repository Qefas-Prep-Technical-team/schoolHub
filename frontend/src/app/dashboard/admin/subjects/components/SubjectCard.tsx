import React from "react"
import { Subject } from "../services/subjectService"

interface SubjectCardProps {
  subject: Subject
  onEdit?: (subject: Subject) => void
  onArchive?: (id: string) => void
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onEdit }) => {
  // Map subject code to an icon (simulation of the design)
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
      className="group bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm hover:shadow-xl hover:shadow-blue-500/5 border border-slate-100 dark:border-slate-800 hover:border-blue-500/10 transition-all duration-300 cursor-pointer"
      onClick={() => onEdit?.(subject)}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-black text-xs rounded-full tracking-wider">
          {subject.code}
        </span>
        <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 transition-colors">
          {getIcon(subject.code)}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{subject.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">
        {subject.description || "No description provided."}
      </p>
      
      <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <div className="flex -space-x-2">
            {/* Simulation of teacher avatars */}
            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                {subject.teachersCount || 0}
            </div>
        </div>
        
        <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
          subject.scope === "GLOBAL" 
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        }`}>
          <span className="material-symbols-outlined text-[14px]">
            {subject.scope === "GLOBAL" ? "public" : "lock"}
          </span>
          <span>{subject.scope === "GLOBAL" ? "Global" : "Private"}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Classes</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{subject.classesCount || 0} Sections</span>
        </div>
      </div>
    </div>
  )
}

export default SubjectCard
