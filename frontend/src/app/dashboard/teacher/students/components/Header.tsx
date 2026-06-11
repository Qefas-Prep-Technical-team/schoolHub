import HeaderActions from './HeaderActions';
import HeaderTitle from './HeaderTitle';

interface HeaderProps {
  onQuickAttendance?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onQuickAttendance }) => {
  return (
    <header className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-6">
      <HeaderTitle />
      <HeaderActions onQuickAttendance={onQuickAttendance} />
    </header>
  );
};

export default Header;
