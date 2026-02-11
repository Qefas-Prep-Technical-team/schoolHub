import Button from './ui/Button';

const HeaderActions: React.FC = () => {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline">
                Preview Exam
            </Button>
            <Button variant="secondary">
                Save Draft
            </Button>
            <Button variant="primary">
                Publish Exam
            </Button>
        </div>
    );
};

export default HeaderActions;