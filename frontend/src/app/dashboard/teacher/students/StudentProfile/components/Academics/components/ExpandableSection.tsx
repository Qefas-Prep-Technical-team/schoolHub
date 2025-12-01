import { ExpandableSectionT } from "./types";


interface ExpandableSectionProps {
  section: ExpandableSectionT;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ section }) => {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm">
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer list-none">
          <h3 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold">
            {section.title}
          </h3>
          <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">
            expand_more
          </span>
        </summary>
        <div className="mt-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <p>{section.content}</p>
        </div>
      </details>
    </div>
  );
};

export default ExpandableSection;