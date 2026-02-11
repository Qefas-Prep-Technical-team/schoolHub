import TableHeader from "./TableHeader";
import TablePagination from "./TablePagination";
import TableRow from "./TableRow";
import TableToolbar from "./TableToolbar";
import { StudentGrade } from "./types";


interface GradesTableProps {
  grades: StudentGrade[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilter: () => void;
  onSort: () => void;
  onExport: () => void;
  onEditGrade: (gradeId: number) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const GradesTable: React.FC<GradesTableProps> = ({
  grades,
  searchQuery,
  onSearchChange,
  onFilter,
  onSort,
  onExport,
  onEditGrade,
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}) => {
  const startItem = (currentPage - 1) * 5 + 1;
  const endItem = Math.min(currentPage * 5, totalItems);

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onFilter={onFilter}
        onSort={onSort}
        onExport={onExport}
      />
      
      <div className="overflow-x-auto @container">
        <table className="w-full text-left">
          <TableHeader />
          <tbody>
            {grades.map((grade) => (
              <TableRow
                key={grade.id}
                grade={grade}
                onEdit={() => onEditGrade(grade.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default GradesTable;