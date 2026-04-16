import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

const HeaderTitle: React.FC = () => {
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-gray-900 dark:text-white text-4xl font-black tracking-tight">
        Students
      </h1>
      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">
        {selectedSchoolId === user?.id 
          ? "Overview across all your connected schools" 
          : `Managing students for ${selectedSchoolName}`}
      </p>
    </div>
  );
};

export default HeaderTitle;