import { StudentProfile } from "@/lib/api/services/studentService";

interface PersonalInformationProps {
  student: StudentProfile;
}

export default function PersonalInformation({ student }: PersonalInformationProps) {
  const personalInfo = [
    { label: 'Full Name', value: student.name },
    { label: 'Student Code', value: student.studentCode },
    { label: 'Grade Level', value: (student as any).gradeLevel || "Not set" },
    { label: 'Gender', value: student.gender || "Not set" },
    { label: 'Email Address', value: student.email },
    { label: 'Role', value: student.role },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
      <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-primary rounded-full" />
        Personal Information
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        {personalInfo.map((info, index) => (
          <div key={index} className="flex flex-col gap-1.5 border-t border-slate-50 dark:border-slate-800/50 py-5 first:border-t-0 sm:even:border-l sm:even:pl-8 sm:even:border-t-0">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
              {info.label}
            </p>
            <p className="text-slate-700 dark:text-slate-200 text-sm font-bold leading-normal">
              {info.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
