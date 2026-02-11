import Button from "./ui/Button";


const HeaderActions: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" icon="ios_share">
        Export List
      </Button>
      <Button variant="secondary" icon="forward_to_inbox">
        Bulk Message
      </Button>
      <Button variant="primary" icon="checklist">
        Quick Attendance
      </Button>
    </div>
  );
};

export default HeaderActions;