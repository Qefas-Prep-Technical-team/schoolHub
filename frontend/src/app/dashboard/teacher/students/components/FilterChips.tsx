import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

interface FilterChipsProps {
  selectedClassId: string;
  onClassChange: (classId: string) => void;
}

interface ClassItem {
  id: string;
  name: string;
  section?: string;
}

const FilterChips: React.FC<FilterChipsProps> = ({ selectedClassId, onClassChange }) => {
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();
  
  const { data: classes } = useQuery({
    queryKey: ['teacher-classes', selectedSchoolId],
    queryFn: async () => {
      const isPersonal = selectedSchoolName === "Personal Dashboard" || selectedSchoolId === user?.id;
      const filterId = isPersonal ? undefined : selectedSchoolId;
      return await teacherService.getClasses(filterId ? { schoolId: filterId } : {});
    },
  });

  const classesList: ClassItem[] = Array.isArray(classes) ? classes : (classes?.classes || classes?.data || []);

  return (
    <div className="w-full sm:w-auto">
      <div className="relative group w-full sm:w-auto">
        <select
          value={selectedClassId}
          onChange={(e) => onClassChange(e.target.value)}
          className="w-full sm:w-auto flex h-12 appearance-none items-center justify-center gap-x-2 rounded-2xl bg-white/70 dark:bg-emerald-950/70 backdrop-blur-xl pl-4 pr-10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-emerald-800/50 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 cursor-pointer"
        >
          <option value="">ALL CLASSES</option>
          {classesList.map((c: ClassItem) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.section ? `(${c.section})` : ''}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" />
      </div>
    </div>
  );
};

export default FilterChips;
