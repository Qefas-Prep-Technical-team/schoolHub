import Button from "./ui/Button";

interface HeaderActionsProps {
  onQuickAttendance?: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ onQuickAttendance }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" icon="ios_share">
        Export List
      </Button>
      <Button variant="secondary" icon="forward_to_inbox">
        Bulk Message
      </Button>
      <Button variant="primary" icon="checklist" onClick={onQuickAttendance}>
        Quick Attendance
      </Button>
    </div>
  );
};

export default HeaderActions;
