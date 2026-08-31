import { GradeStatus, StudentGrade } from "./types";
import { Edit2, MoreVertical, Edit, Eye, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TableRowProps {
  grade: StudentGrade;
  rowNumber: number;
  onEdit: () => void;
  onPublish: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}

const TableRow: React.FC<TableRowProps> = ({
  grade,
  rowNumber,
  onEdit,
  onPublish,
  onDelete,
  onViewDetails
}) => {
  const getStatusStyles = (status: GradeStatus) => {
    switch (status) {
      case 'Graded':
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case 'Pending':
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case 'Missing':
        return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
    }
  };

  const initials = grade.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <tr className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all duration-300">
      <td className="px-6 py-4 text-sm font-black text-slate-400 dark:text-slate-600">
        {String(rowNumber).padStart(2, '0')}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold shadow-sm group-hover:scale-110 transition-transform duration-500 overflow-hidden">
            {grade.profilePicture ? (
              <img src={grade.profilePicture} alt={grade.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{grade.name}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{grade.studentCode}</span>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{grade.subjectPaper}</span>
          <span className="text-[10px] font-black uppercase tracking-tight text-primary/80 dark:text-primary/90">{grade.assessmentType}</span>
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <div className="inline-flex flex-col items-center">
          <span className="text-sm font-black text-slate-900 dark:text-slate-100">{grade.score}</span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Score</span>
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <div className="inline-flex h-8 px-3 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm">
          {grade.totalScore}
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <div className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg font-black shadow-sm",
          grade.grade.startsWith('A') ? "bg-emerald-500 text-white" :
          grade.grade.startsWith('B') ? "bg-blue-500 text-white" :
          grade.grade.startsWith('C') ? "bg-amber-500 text-white" :
          "bg-red-500 text-white"
        )}>
          {grade.grade}
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
          getStatusStyles(grade.status)
        )}>
          <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_rgba(currentColor,0.5)]" />
          {grade.status}
        </div>
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 w-48 p-2 shadow-2xl bg-white dark:bg-slate-900 z-50">
              <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit size={14} /> Edit Grade
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
                <Eye size={14} /> View Details
              </DropdownMenuItem>
              {grade.status !== 'Graded' && (
                <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-emerald-600 dark:text-emerald-400 gap-2" onClick={(e) => { e.stopPropagation(); onPublish(); }}>
                  <Send size={14} /> Publish Now
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-rose-600 gap-2" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 size={14} /> Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
};

export default TableRow;
