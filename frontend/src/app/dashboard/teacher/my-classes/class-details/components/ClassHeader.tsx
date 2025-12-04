import { Plus, FileText, GraduationCap } from 'lucide-react';

interface ClassData {
  name: string;
  subject: string;
  teacher: string;
  studentCount: number;
  academicYear?: string;
  term?: string;
  room?: string;
  schedule?: string;
}

interface ClassHeaderProps {
  classData: ClassData;
  onAddAssignment: () => void;
  onAddExam: () => void;
}

export default function ClassHeader({ classData, onAddAssignment, onAddExam }: ClassHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          {classData.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span className="text-base">{classData.subject}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">•</span>
            <span className="text-base">Teacher: {classData.teacher}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">•</span>
            <span className="text-base">{classData.studentCount} Students</span>
          </div>
        </div>

        {/* Additional Class Info */}
        <div className="flex flex-wrap gap-4 mt-4">
          {classData.academicYear && (
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
              📅 {classData.academicYear}
            </div>
          )}
          {classData.term && (
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
              📚 {classData.term}
            </div>
          )}
          {classData.room && (
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
              🏫 {classData.room}
            </div>
          )}
          {classData.schedule && (
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
              ⏰ {classData.schedule}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onAddAssignment}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-bold whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </button>

        <button
          onClick={onAddExam}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-primary/20 dark:bg-primary/30 text-primary dark:text-white rounded-lg hover:bg-primary/30 dark:hover:bg-primary/40 transition-colors text-sm font-bold whitespace-nowrap"
        >
          <FileText className="w-4 h-4" />
          <span>Add Exam/Quiz</span>
        </button>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900 dark:text-white">94%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Attendance</div>
          </div>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
          <div className="text-center">
            <div className="text-sm font-bold text-green-600 dark:text-green-400">85%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg. Grade</div>
          </div>
        </div>
      </div>
    </div>
  );
}