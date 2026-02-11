import { CheckCircle, Edit, FileText, ListChecks } from 'lucide-react';

interface QuestionTypeTabsProps {
  activeTab: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  onTabChange: (tab: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay') => void;
}

const tabs = [
  {
    id: 'multiple-choice',
    label: 'Multiple Choice',
    icon: ListChecks,
  },
  {
    id: 'true-false',
    label: 'True/False',
    icon: CheckCircle,
  },
  {
    id: 'short-answer',
    label: 'Short Answer',
    icon: Edit,
  },
  {
    id: 'essay',
    label: 'Essay',
    icon: FileText,
  },
] as const;

export default function QuestionTypeTabs({ activeTab, onTabChange }: QuestionTypeTabsProps) {
  return (
    <div className="px-4 pt-4">
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 gap-2 sm:gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-2 border-b-[3px] pb-3 pt-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-sm font-bold tracking-wide whitespace-nowrap ${
                isActive ? 'text-primary' : ''
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}