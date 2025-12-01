import Button from "./ui/Button";


interface AddNoteButtonProps {
  onClick?: () => void;
}

const AddNoteButton: React.FC<AddNoteButtonProps> = ({ onClick }) => {
  return (
    <div className="flex justify-end">
      <Button 
        variant="primary" 
        icon="add_comment" 
        className="h-11 px-6"
        onClick={onClick}
      >
        Add Academic Note
      </Button>
    </div>
  );
};

export default AddNoteButton;