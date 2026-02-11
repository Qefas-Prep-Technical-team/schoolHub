import { Breadcrumb } from "./type";


interface BreadcrumbsProps {
    items: Breadcrumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-2">
            {items.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                    {index > 0 && (
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">
                            /
                        </span>
                    )}
                    {item.isCurrent ? (
                        <span className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal">
                            {item.label}
                        </span>
                    ) : (
                        <a
                            href={item.href}
                            className="text-primary/80 dark:text-primary/90 text-sm font-medium leading-normal hover:text-primary"
                        >
                            {item.label}
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Breadcrumbs;