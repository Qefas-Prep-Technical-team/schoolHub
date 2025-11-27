interface Tab {
  id: string
  label: string
}

interface TeacherTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function TeacherTabs({ tabs, activeTab, onTabChange }: TeacherTabsProps) {
  return (
    <div className="mt-6">
      <div className="flex overflow-x-auto border-b border-[#d1d8e6] dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex shrink-0 flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-4 ${
              activeTab === tab.id
                ? 'border-b-primary text-primary'
                : 'border-b-transparent text-[#6C757D] hover:text-primary'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
              {tab.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}