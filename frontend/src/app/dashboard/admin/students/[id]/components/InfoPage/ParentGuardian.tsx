import { StudentProfile } from "@/lib/api/services/studentService";
import { User, Phone, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParentGuardianProps {
  student: StudentProfile;
}

export default function ParentGuardian({ student }: ParentGuardianProps) {
  const primaryLink = student.parentLinks?.[0];
  const parent = primaryLink?.parent;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
      <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
        Parent/Guardian
      </h2>
      
      {!parent ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
            <User size={24} />
          </div>
          <p className="text-sm font-bold text-slate-400 italic">No parent linked to this student</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5 border-t border-slate-50 dark:border-slate-800/50 pt-5">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Primary Parent
            </p>
            <p className="text-slate-700 dark:text-slate-200 text-sm font-bold leading-normal">
              {parent.name}
            </p>
          </div>
          
          <div className="flex flex-col gap-1.5 border-t border-slate-50 dark:border-slate-800/50 pt-5">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Phone
            </p>
            <p className="text-slate-700 dark:text-slate-200 text-sm font-bold leading-normal flex items-center gap-2">
              <Phone size={14} className="text-slate-400" />
              {parent.phone || "Not provided"}
            </p>
          </div>
          
          <div className="flex flex-col gap-1.5 border-t border-slate-50 dark:border-slate-800/50 pt-5">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Email
            </p>
            <p className="text-slate-700 dark:text-slate-200 text-sm font-bold leading-normal flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              {parent.email}
            </p>
          </div>

          <Button variant="outline" className="w-full mt-4 h-12 rounded-2xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 group">
            <span className="truncate">View Full Parent Profile</span>
            <ExternalLink size={14} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      )}
    </div>
  )
}
