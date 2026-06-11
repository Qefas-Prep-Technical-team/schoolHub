import HeaderActions from './HeaderActions';
import HeaderTitle from './HeaderTitle';

interface HeaderProps {
  onQuickAttendance?: () => void;
  onExport?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onQuickAttendance, onExport }) => {
  return (
    <header className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-6">
      <HeaderTitle />
      <HeaderActions onQuickAttendance={onQuickAttendance} onExport={onExport} />
    </header>
  );
};

export default Header;
