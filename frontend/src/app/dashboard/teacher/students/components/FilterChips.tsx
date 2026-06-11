import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

interface FilterChipsProps {
  selectedClassId: string;
  onClassChange: (classId: string) => void;
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

  const classesList = Array.isArray(classes) ? classes : (classes?.classes || classes?.data || []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative group">
          <select
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            className="flex h-10 appearance-none items-center justify-center gap-x-2 rounded-xl bg-white dark:bg-slate-800/80 pl-4 pr-10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-primary/30 transition-all duration-300 shadow-sm text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="">ALL CLASSES</option>
            {classesList.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section ? `(${c.section})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default FilterChips;
