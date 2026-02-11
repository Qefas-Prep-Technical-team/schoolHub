import Button from "./Button";


interface BehaviourHeaderProps {
  studentName: string;
  studentInfo: string;
  onAddReport?: () => void;
}

const BehaviourHeader: React.FC<BehaviourHeaderProps> = ({
  studentName,
  studentInfo,
  onAddReport
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-72 flex-col gap-2">
        <p className="text-slate-900 dark:text-slate-50 text-4xl font-bold leading-tight tracking-tight">
          {studentName}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
          {studentInfo}
        </p>
      </div>
      <div className="flex items-center justify-end">
        <Button
          icon="add_circle"
          onClick={onAddReport}
        >
          Add Behaviour Report
        </Button>
      </div>
    </div>
  );
};

export default BehaviourHeader;