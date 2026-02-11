import Link from "next/link";
import { GradeStatus, StudentGrade } from "./types";


interface TableRowProps {
  grade: StudentGrade;
  onEdit: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ grade, onEdit }) => {
  const getStatusStyles = (status: GradeStatus) => {
    switch (status) {
      case 'Graded':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/50',
          text: 'text-emerald-700 dark:text-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'Pending':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/50',
          text: 'text-amber-700 dark:text-amber-300',
          dot: 'bg-amber-500'
        };
      case 'Missing':
        return {
          bg: 'bg-red-100 dark:bg-red-900/50',
          text: 'text-red-700 dark:text-red-300',
          dot: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800/50',
          text: 'text-slate-700 dark:text-slate-300',
          dot: 'bg-slate-500'
        };
    }
  };

  const styles = getStatusStyles(grade.status);

  return (
    <tr className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
      <td className="h-[72px] px-4 py-2 text-slate-800 dark:text-slate-200 text-sm font-normal leading-normal">
        {grade.name}
      </td>
      <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
        {grade.studentId}
      </td>
      <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal text-center">
        {grade.caScore}
      </td>
      <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal text-center">
        {grade.assignmentScore}
      </td>
      <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal text-center">
        {grade.examScore}
      </td>
      <td className="h-[72px] px-4 py-2 text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal text-center">
        {grade.totalScore}
      </td>
      <td className="h-[72px] px-4 py-2 text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal text-center">
        {grade.grade}
      </td>
      <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal text-center">
        <div className={`inline-flex items-center gap-1.5 rounded-full ${styles.bg} px-2 py-1 text-xs font-medium ${styles.text}`}>
          <span className={`size-1.5 rounded-full ${styles.dot}`}></span>
          {grade.status}
        </div>
      </td>
      <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-bold leading-normal text-right">
        <Link href={"/dashboard/teacher/grades/grade-edit"}>

        <button
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
          onClick={onEdit}
        >
          <span className="material-symbols-outlined text-lg">edit</span>
        </button>
        </Link>
      </td>
    </tr>
  );
};

export default TableRow;