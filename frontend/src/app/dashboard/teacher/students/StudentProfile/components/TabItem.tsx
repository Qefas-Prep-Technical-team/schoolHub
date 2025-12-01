import { Tab } from "./types";


interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ tab, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 border-b-2 ${
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-primary'
      } pb-2.5 pt-2.5 whitespace-nowrap`}
    >
      <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>
        {tab.icon}
      </span>
      <p className="text-sm font-bold">{tab.label}</p>
    </button>
  );
};

export default TabItem;