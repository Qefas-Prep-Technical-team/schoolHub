import React from "react";
import { User, Mail, Phone, BadgeCheck } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  teacherCode?: string;
}

interface ClassTeacher {
  teacher: Teacher;
  isLead: boolean;
}

interface TeachersTabProps {
  teachers: ClassTeacher[];
}

const TeachersTab: React.FC<TeachersTabProps> = ({ teachers }) => {
  if (!teachers || teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <User className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Teachers Assigned</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          There are currently no teachers assigned to this class.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((ct) => (
          <div 
            key={ct.teacher.id}
            className="group relative bg-white dark:bg-[#1f2937] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
          >
            {ct.isLead && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/50">
                <BadgeCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Lead Teacher</span>
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                {ct.teacher.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {ct.teacher.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                  {ct.teacher.teacherCode || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <Mail size={14} className="text-slate-400" />
                </div>
                <span className="text-xs truncate">{ct.teacher.email}</span>
              </div>
              {ct.teacher.phoneNumber && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                    <Phone size={14} className="text-slate-400" />
                  </div>
                  <span className="text-xs">{ct.teacher.phoneNumber}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
              <button className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all duration-300">
                View Full Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeachersTab;
