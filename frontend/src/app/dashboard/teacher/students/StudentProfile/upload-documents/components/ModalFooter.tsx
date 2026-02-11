import Button from "./ui/Button";


interface ModalFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ onCancel, onSubmit, isLoading }) => {
  return (
    <div className="flex justify-end gap-3 p-4 border-t border-slate-200 dark:border-white/10">
      <Button 
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button 
        variant="primary"
        onClick={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? 'Uploading...' : 'Upload & Share'}
      </Button>
    </div>
  );
};

export default ModalFooter;