import Button from "./ui/Button";

const HeaderActions: React.FC = () => {
  return (
    <div className="flex w-full max-w-[480px] gap-3 @[480px]:w-auto flex-shrink-0">
      <Button variant="secondary" icon="print" className="flex-1 @[480px]:flex-auto">
        Print Report
      </Button>
      <Button variant="primary" icon="send" className="flex-1 @[480px]:flex-auto">
        Message Parent
      </Button>
    </div>
  );
};

export default HeaderActions;