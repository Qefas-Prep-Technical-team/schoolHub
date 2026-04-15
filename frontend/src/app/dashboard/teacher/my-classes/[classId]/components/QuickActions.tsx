import { FileText, GraduationCap, CheckSquare, Mail } from 'lucide-react';

interface QuickActionsProps {
  onAddAssignment: () => void;
  onAddQuiz: () => void;
  onTakeAttendance: () => void;
  onSendMessage: () => void;
}

export default function QuickActions({
  onAddAssignment,
  onAddQuiz,
  onTakeAttendance,
  onSendMessage,
}: QuickActionsProps) {
  const actions = [
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Add Assignment',
      onClick: onAddAssignment,
      color: 'bg-blue-500',
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      label: 'Add Quiz',
      onClick: onAddQuiz,
      color: 'bg-green-500',
    },
    {
      icon: <CheckSquare className="w-5 h-5" />,
      label: 'Take Attendance',
      onClick: onTakeAttendance,
      color: 'bg-purple-500',
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Send Message',
      onClick: onSendMessage,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mb-3`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}