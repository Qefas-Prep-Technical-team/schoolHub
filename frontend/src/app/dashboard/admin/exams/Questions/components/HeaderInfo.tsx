interface HeaderInfoProps {
    title: string;
    subtitle: string;
}

const HeaderInfo: React.FC<HeaderInfoProps> = ({ title, subtitle }) => {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                {title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                {subtitle}
            </p>
        </div>
    );
};

export default HeaderInfo;