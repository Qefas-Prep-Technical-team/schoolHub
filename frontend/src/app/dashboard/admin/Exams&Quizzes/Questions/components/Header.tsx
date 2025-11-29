import HeaderActions from "./HeaderActions";
import HeaderInfo from "./HeaderInfo";



interface HeaderProps {
    title: string;
    subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
    return (
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <HeaderInfo title={title} subtitle={subtitle} />
                <HeaderActions />
            </div>
        </header>
    );
};

export default Header;