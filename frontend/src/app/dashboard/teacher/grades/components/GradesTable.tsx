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
  publishingGradeId?: string | null;
  onDeleteGrade: (grade: StudentGrade) => void;
  onViewDetailsGrade: (grade: StudentGrade) => void;
  onPublishAll?: () => void;
  isPublishingAll?: boolean;
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
  publishingGradeId,
  onDeleteGrade,
  onViewDetailsGrade,
  onPublishAll,
  isPublishingAll,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading = false
}) => {
  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalItems);

  return (
    <div className="flex flex-col rounded-2xl border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 overflow-hidden shadow-sm">
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onFilter={onFilter}
        onSort={onSort}
        onExport={onExport}
        onPublishAll={onPublishAll}
        isPublishingAll={isPublishingAll}
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
                  isPublishing={publishingGradeId === grade.id}
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
