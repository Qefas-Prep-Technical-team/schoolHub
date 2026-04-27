import TableHeader from "./TableHeader";
import TablePagination from "./TablePagination";
import TableRow from "./TableRow";
import TableToolbar from "./TableToolbar";
import { TableSkeletonBody } from "./TableSkeletonRow";
import { StudentGrade } from "./types";

interface GradesTableProps {
  grades: StudentGrade[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilter: () => void;
  onSort: () => void;
  onExport: () => void;
  onEditGrade: (grade: StudentGrade) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
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
  onPageChange,
  isLoading = false
}) => {
  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalItems);

  return (
    <div className="flex flex-col rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
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
            {isLoading ? (
              <TableSkeletonBody rows={7} />
            ) : (
              grades.map((grade) => (
                <TableRow
                  key={grade.id}
                  grade={grade}
                  onEdit={() => onEditGrade(grade)}
                />
              ))
            )}
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
