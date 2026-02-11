interface PageHeaderProps {
    title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
    return (
        <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                {title}
            </h1>
        </div>
    );
};

export default PageHeader;