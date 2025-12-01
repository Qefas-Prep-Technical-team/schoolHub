interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <div className="flex flex-wrap justify-between gap-3">
            <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-[-0.03em] min-w-72">
                {title}
            </p>
        </div>
    );
};

export default Header;