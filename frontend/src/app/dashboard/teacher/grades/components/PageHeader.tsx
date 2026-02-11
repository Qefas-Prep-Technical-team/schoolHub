import Link from "next/link";
import Button from "../../students/components/ui/Button";


interface PageHeaderProps {
  onAddGrade: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onAddGrade }) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <p className="text-slate-900 dark:text-slate-50 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
        Grades
      </p>
      <Link href="/dashboard/teacher/grades/record-grades">
      <Button 
        variant="primary" 
        icon="add"
        onClick={onAddGrade}
      >
        Record New Grade
      </Button>
      </Link>
    </div>
  );
};

export default PageHeader;