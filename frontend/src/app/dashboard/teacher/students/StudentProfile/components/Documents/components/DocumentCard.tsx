import { ViewMode } from "./types";


interface StudentDocument {
  title: string;
  type: string;
  modifiedDate: string;
  description?: string;
  thumbnailUrl?: string;
}

interface DocumentCardProps {
  document: StudentDocument;
  viewMode: ViewMode;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div 
          className="bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg w-32 flex-shrink-0"
          style={{ backgroundImage: `url("${document.thumbnailUrl}")` }}
        />
        <div className="flex-1">
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {document.title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {document.type} • Modified: {document.modifiedDate}
          </p>
          {document.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {document.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div 
        className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg"
        style={{ backgroundImage: `url("${document.thumbnailUrl}")` }}
      />
      <div>
        <p className="text-base font-medium text-gray-900 dark:text-white">
          {document.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {document.type} • Modified: {document.modifiedDate}
        </p>
      </div>
    </div>
  );
};

export default DocumentCard;