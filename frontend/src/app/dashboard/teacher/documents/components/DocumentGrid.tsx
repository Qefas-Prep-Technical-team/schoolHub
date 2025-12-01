
import DocumentCard from "./DocumentCard";
import { ViewMode, Document as StudentDocument } from "./types";


interface DocumentGridProps {
  documents: StudentDocument[];
  viewMode: ViewMode;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({ documents, viewMode }) => {
  const gridClass = viewMode === 'grid' 
    ? 'grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6'
    : 'flex flex-col gap-4';

  return (
    <div className={gridClass}>
      {documents.map((document) => (
        <DocumentCard
          key={document.id} 
          document={document}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default DocumentGrid;