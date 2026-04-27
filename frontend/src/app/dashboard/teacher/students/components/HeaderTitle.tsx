import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Sparkles } from "lucide-react";

const HeaderTitle: React.FC = () => {
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();
  const isPersonal = selectedSchoolId === user?.id;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.22em] text-[10px] mb-2 leading-none">
        <Sparkles size={12} className="animate-pulse" />
        Academic Directory
      </div>
      <h1 className="text-slate-900 dark:text-white text-4xl sm:text-5xl font-black tracking-tight leading-none">
        Students
      </h1>
      <div className="mt-3 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
          {isPersonal ? "All Connected Schools" : selectedSchoolName}
        </span>
        {isPersonal && (
          <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest italic">
            • Personalized view
          </p>
        )}
      </div>
    </div>
  );
};

export default HeaderTitle;
