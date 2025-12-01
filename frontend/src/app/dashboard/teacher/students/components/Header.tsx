import HeaderActions from './HeaderActions';
import HeaderTitle from './HeaderTitle';


const Header: React.FC = () => {
  return (
    <header className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-6">
      <HeaderTitle />
      <HeaderActions />
    </header>
  );
};

export default Header;