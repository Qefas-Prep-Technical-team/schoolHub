import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";

const HeaderTitle: React.FC = () => {
  const { selectedSchoolId, schools } = useDashboardStore();
  const selectedSchool = schools.find(s => s.id === selectedSchoolId);

  return (
    <div>
      <h1 className="text-gray-900 dark:text-white text-4xl font-black tracking-tight">
        Students
      </h1>
      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">
        {selectedSchoolId && selectedSchool 
          ? `Managing students for ${selectedSchool.name}` 
          : "Overview across all your connected schools"}
      </p>
    </div>
  );
};

export default HeaderTitle;