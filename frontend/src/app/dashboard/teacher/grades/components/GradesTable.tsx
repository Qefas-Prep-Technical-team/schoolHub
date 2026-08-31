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
  onPublishGrade: (grade: StudentGrade) => void;
  onDeleteGrade: (grade: StudentGrade) => void;
  onViewDetailsGrade: (grade: StudentGrade) => void;
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
  onPublishGrade,
  onDeleteGrade,
  onViewDetailsGrade,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading = false
}) => {
  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalItems);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
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
              grades.map((grade, index) => (
                <TableRow
                  key={grade.id}
                  grade={grade}
                  rowNumber={(currentPage - 1) * 10 + index + 1}
                  onEdit={() => onEditGrade(grade)}
                  onPublish={() => onPublishGrade(grade)}
                  onDelete={() => onDeleteGrade(grade)}
                  onViewDetails={() => onViewDetailsGrade(grade)}
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
