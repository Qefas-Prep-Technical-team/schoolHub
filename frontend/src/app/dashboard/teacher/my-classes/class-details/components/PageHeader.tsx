import { Megaphone } from 'lucide-react';

interface ClassData {
  name: string;
  subject: string;
  subjectCode: string;
  level: string;
  teacher: string;
  studentCount: number;
  academicYear: string;
  term: string;
  room?: string;
  schedule?: string;
}

interface PageHeaderProps {
  classData: ClassData;
  onAddAnnouncement: () => void;
}

export default function PageHeader({ classData, onAddAnnouncement }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {classData.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600 dark:text-gray-400">
            <span className="text-base">{classData.subject} • {classData.teacher}</span>
            <span className="hidden md:inline">•</span>
            <span className="text-base">{classData.studentCount} Students</span>
          </div>
        </div>

        <button
          onClick={onAddAnnouncement}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-bold whitespace-nowrap"
        >
          <Megaphone className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Class Details */}
      <div className="flex flex-wrap gap-3">
        <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
          📅 {classData.academicYear}
        </div>
        <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
          📚 {classData.term}
        </div>
        {classData.room && (
          <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
            🏫 {classData.room}
          </div>
        )}
        {classData.schedule && (
          <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
            ⏰ {classData.schedule}
          </div>
        )}
        <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
          {classData.subjectCode}
        </div>
      </div>
    </div>
  );
}