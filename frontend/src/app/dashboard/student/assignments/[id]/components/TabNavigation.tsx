/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  activeTab: 'instructions' | 'attachments' | 'rubric' | 'materials';
  onTabChange: (tab: 'instructions' | 'attachments' | 'rubric' | 'materials') => void;
  attachmentsCount?: number;
}

export default function TabNavigation({ activeTab, onTabChange, attachmentsCount = 0 }: Props) {
  const tabs = [
    { id: 'instructions', label: 'Instructions' },
    { id: 'attachments', label: `Attachments (${attachmentsCount})` },
    { id: 'rubric', label: 'Rubric' },
    { id: 'materials', label: 'Related Materials' },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
      <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:border-slate-300 dark:text-slate-400 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}