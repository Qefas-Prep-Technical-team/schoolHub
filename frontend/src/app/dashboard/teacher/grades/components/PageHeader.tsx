import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  onAddGrade: () => void;
  selectedSchoolName: string;
  isPersonal: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onAddGrade, selectedSchoolName, isPersonal }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-white text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            Academic Grades
          </h1>
          <p className="text-slate-800 dark:text-slate-200 mt-2 font-bold text-sm bg-primary/5 dark:bg-primary/10 px-3 py-1 rounded-full w-fit">
            {isPersonal 
              ? "All Connected Schools"
              : selectedSchoolName}
          </p>
        </div>
        <Link href="/dashboard/teacher/grades/record-grades">
          <Button 
            className="h-12 px-6 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 font-black tracking-tight"
            onClick={onAddGrade}
          >
            <Plus className="mr-2 h-5 w-5" />
            Record New Grade
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PageHeader;