import { StudentProfile } from "@/lib/api/services/studentService";

interface ClassInformationProps {
  student: StudentProfile;
}

export default function ClassInformation({ student }: ClassInformationProps) {
  const enrollment = student.classes?.[0];
  const className = enrollment ? `${enrollment.class.name} ${enrollment.class.section || ""}` : "Not enrolled in any class";
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
      <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
        Class Enrollment
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col gap-1.5 border-t border-slate-50 dark:border-slate-800/50 pt-5">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Current Class
          </p>
          <p className="text-slate-700 dark:text-slate-200 text-sm font-bold leading-normal">
            {className}
          </p>
        </div>
        
        <div className="flex flex-col gap-1.5 border-t border-slate-50 dark:border-slate-800/50 pt-5">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Class Teacher
          </p>
          <p className="text-primary text-sm font-bold leading-normal cursor-pointer hover:underline">
            {(enrollment?.class as any)?.teacherId ? "Teacher Assigned (View Profile)" : "No Teacher Assigned"}
          </p>
        </div>
      </div>
      
      {student.classes && student.classes.length > 1 && (
        <div className="border-t border-slate-50 dark:border-slate-800/50 pt-6">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
            Additional Classes
          </p>
          <div className="flex flex-wrap gap-2">
            {student.classes.slice(1).map((cls, index) => (
              <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                {cls.class.name} {cls.class.section}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
