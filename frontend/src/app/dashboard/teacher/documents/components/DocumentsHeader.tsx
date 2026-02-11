import Link from "next/link";
import Button from "./Button";


interface DocumentsHeaderProps {
  onUpload?: () => void;
}

const DocumentsHeader: React.FC<DocumentsHeaderProps> = ({ onUpload }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-800">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Documents
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage and share your educational materials.
        </p>
      </div>
      <Link href="/dashboard/teacher/students/StudentProfile/upload-documents" passHref>
      <Button 
        variant="primary" 
        icon="upload_file"
        onClick={onUpload}
      >
        Upload Document
      </Button>
      </Link>
    </div>
  );
};

export default DocumentsHeader;